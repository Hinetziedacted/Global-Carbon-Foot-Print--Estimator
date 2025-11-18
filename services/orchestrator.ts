// FIX: Add missing ZoneExperimentResponse to the type imports.
import { Edge, ZoneEmissionsResponse, ZoneEmissionsInput, ScenarioInput, ZoneEmissionsScenarioResponse, QualityInfo, QualityFlag, VehicleFleetMix, FactorsPack, ScenarioPreset, ScenarioRun, ZoneExperimentResponse } from '../types';
import { fetchLtoCounts, fetchSpeeds, fetchWeather } from './apiAdapters';
import { computeAeroMultiplier, computeBaseFuelConsumption, computeGradeMultiplier, computeHvacEnergyEV, computeHvacMultiplierICE } from './physicsEngine';
import { resolveFactorsPackId } from '../factors/registry';
import { FACTORS_PACKS, SPEED_CURVE_COEFFS, LTO_FACTORS } from '../factors/packs';
import { MODULE_UNCERTAINTY } from '../constants';

/**
 * Simulates clipping a road network and sampling edges.
 */
const clipAndSampleNetwork = (): { all_edges_count: number; sampled_edges: Edge[] } => {
    const totalEdgesInPolygon = 1200;
    const sampleSize = Math.min(400, totalEdgesInPolygon);
    const sampled_edges: Edge[] = [];
    for (let i = 0; i < sampleSize; i++) {
        sampled_edges.push({
            id: `edge_${i}`,
            length_km: 0.1 + Math.random() * 0.4,
            bearing: Math.random() * 360,
            grade_percent: (Math.random() - 0.5) * 8,
        });
    }
    return { all_edges_count: totalEdgesInPolygon, sampled_edges };
}

interface ScenarioOverrides {
    fleet_mix_override?: VehicleFleetMix;
    speed_delta_kmh_override?: number;
    lto_reduction_factor_override?: number;
}

/**
 * v0.3: Computes a quality flag and uncertainty range based on data source quality.
 */
const computeQualityInfo = (
    hasLiveTraffic: boolean,
    hasLiveWeather: boolean,
    factorsPack: FactorsPack
): QualityInfo => {
    const notes: string[] = [];
    let score = 0;

    if (hasLiveTraffic) {
        score += 2;
        notes.push("Using live traffic speed data.");
    } else {
        notes.push("Using default/statistical speed data.");
    }

    if (hasLiveWeather) {
        score += 2;
        notes.push("Using live weather data for physics corrections.");
    } else {
        notes.push("Using default weather conditions.");
    }

    if (factorsPack.id !== 'GLOBAL' && factorsPack.id !== 'EU') {
        score += 2;
        notes.push(`Using country-specific factors pack (${factorsPack.label}).`);
    } else if (factorsPack.id === 'EU') {
        score += 1;
        notes.push("Using regional (EU) factors pack.");
    } else {
        notes.push("Using global fallback factors pack.");
    }

    if (score >= 6) { // Q1: Live traffic + live weather + local factors
        return {
            flag: QualityFlag.Q1,
            uncertainty: { low_multiplier: 0.8, high_multiplier: 1.2 }, // ±20%
            notes
        };
    }
    if (score >= 3) { // Q2: At least one live feed + regional or better factors
        return {
            flag: QualityFlag.Q2,
            uncertainty: { low_multiplier: 0.75, high_multiplier: 1.35 }, // -25%/+35%
            notes
        };
    }
    // Q3: Mostly defaults
    return {
        flag: QualityFlag.Q3,
        uncertainty: { low_multiplier: 0.6, high_multiplier: 1.7 }, // -40%/+70%
        notes
    };
};

/**
 * The core, private function for calculating emissions. Can be run in baseline or scenario mode via overrides.
 */
const _computeZoneEmissions = async (input: ZoneEmissionsInput, overrides: ScenarioOverrides = {}): Promise<ZoneEmissionsResponse> => {
    const data_sources: string[] = [];

    const { all_edges_count, sampled_edges } = clipAndSampleNetwork();
    
    // For now, we assume we always get live data from our mocked APIs
    const hasLiveTraffic = true;
    const hasLiveWeather = true;

    const [speeds, weather, base_lto_counts] = await Promise.all([
        fetchSpeeds(sampled_edges),
        fetchWeather(),
        fetchLtoCounts(),
    ]);
    data_sources.push('tomtom:flow (mocked)', 'openweather:onecall (mocked)', 'opensky:network (mocked)');
    
    // Resolve factors pack based on country
    const factors_pack_id = resolveFactorsPackId(input.country_iso2.toUpperCase());
    const factors = FACTORS_PACKS[factors_pack_id];
    data_sources.push(`${factors.meta.source} (${factors.meta.dataYear})`);
    
    const quality_info = computeQualityInfo(hasLiveTraffic, hasLiveWeather, factors);

    // Apply LTO override for scenario
    const lto_counts = base_lto_counts * (1 - (overrides.lto_reduction_factor_override || 0));

    // For now, we only model passenger cars. In a real model, we'd use a weighted average.
    const base_fleet_mix = factors.fleetMix.passengerCar;
    const fleet_mix = overrides.fleet_mix_override || base_fleet_mix;
    const grid_intensity_g_co2_kwh = factors.fuelCo2Factors.grid_gco2_per_kwh;

    let total_fleet_grams_sample = 0;
    let total_ev_grams_sample = 0;
    
    for (const edge of sampled_edges) {
        let speed_kmh = speeds.get(edge.id) || 30;
        // Apply speed override for scenario
        if (overrides.speed_delta_kmh_override) {
            speed_kmh = Math.max(5, speed_kmh + overrides.speed_delta_kmh_override);
        }

        const fc_base = computeBaseFuelConsumption(speed_kmh, SPEED_CURVE_COEFFS.PC_Petrol_Euro5);
        const f_aero = computeAeroMultiplier(speed_kmh, weather, edge.bearing);
        
        // ICE / Fleet calculations
        const f_ac_ice = computeHvacMultiplierICE(speed_kmh, weather.temp);
        const m_grade_ice = computeGradeMultiplier(edge.grade_percent, false);
        const fc_petrol_g = fc_base * f_aero * f_ac_ice * m_grade_ice * edge.length_km;
        
        const co2e_petrol = (fc_petrol_g / 1000) * (factors.fuelCo2Factors.petrol_gco2_per_litre / 0.75);
        const co2e_diesel = (fc_petrol_g / 1000) * (factors.fuelCo2Factors.diesel_gco2_per_litre / 0.85);
        
        const edge_fleet_co2e_grams = (co2e_petrol * fleet_mix.petrol) + (co2e_diesel * fleet_mix.diesel);
        total_fleet_grams_sample += edge_fleet_co2e_grams;

        // EV calculations
        const e_base_kwh_km = 0.15;
        const m_grade_ev = computeGradeMultiplier(edge.grade_percent, true);
        const e_hvac_kwh_km = computeHvacEnergyEV(speed_kmh, weather.temp);
        const e_edge_kwh = (e_base_kwh_km * f_aero * m_grade_ev + e_hvac_kwh_km) * edge.length_km;

        const edge_ev_co2e_grams = (e_edge_kwh * grid_intensity_g_co2_kwh) * fleet_mix.ev;
        total_ev_grams_sample += edge_ev_co2e_grams;
    }
    
    const scaling_factor = all_edges_count / sampled_edges.length;
    const roads_fleet_tonnes = (total_fleet_grams_sample * scaling_factor) / 1_000_000;
    const roads_ev_tonnes = (total_ev_grams_sample * scaling_factor) / 1_000_000;
    
    const aviation_co2e_tonnes = (lto_counts * LTO_FACTORS.generic_jet.co2_kg_per_lto) / 1000;

    const total_co2e_tonnes = roads_fleet_tonnes + roads_ev_tonnes + aviation_co2e_tonnes;
    
    // v0.4: Module-aware uncertainty calculation
    const low_estimate_tonnes = 
      (roads_fleet_tonnes * (1 - MODULE_UNCERTAINTY.roads_fleet)) +
      (roads_ev_tonnes * (1 - MODULE_UNCERTAINTY.roads_ev)) +
      (aviation_co2e_tonnes * (1 - MODULE_UNCERTAINTY.aviation));
    
    const high_estimate_tonnes = 
      (roads_fleet_tonnes * (1 + MODULE_UNCERTAINTY.roads_fleet)) +
      (roads_ev_tonnes * (1 + MODULE_UNCERTAINTY.roads_ev)) +
      (aviation_co2e_tonnes * (1 + MODULE_UNCERTAINTY.aviation));


    return {
        co2e_tonnes: total_co2e_tonnes,
        low_estimate_tonnes,
        high_estimate_tonnes,
        quality_info,
        factors_pack_id,
        by_module: {
            roadsFleet: roads_fleet_tonnes,
            roadsEv: roads_ev_tonnes,
            aviation: aviation_co2e_tonnes,
        },
        data_sources,
        metadata: {
            edges_sampled: sampled_edges.length,
            time_window_min: input.time_window_minutes,
            weather_temp_c: weather.temp,
            grid_intensity_g_co2_kwh,
            fleet_shares: fleet_mix,
        }
    };
};

/**
 * Public function to run only a baseline calculation.
 */
export const computeZoneEmissions = (input: ZoneEmissionsInput): Promise<ZoneEmissionsResponse> => {
    return _computeZoneEmissions(input);
};

/**
 * Public function to run a full baseline vs. scenario comparison.
 */
export const runZoneScenario = async (
    input: ZoneEmissionsInput,
    scenario: ScenarioInput,
    precomputedBaseline?: ZoneEmissionsResponse
): Promise<ZoneEmissionsScenarioResponse> => {
    const baseline = precomputedBaseline || await _computeZoneEmissions(input);

    // 1. Calculate new fleet mix based on scenario delta
    const base_factors = FACTORS_PACKS[baseline.factors_pack_id];
    // For now, we only modify the passenger car fleet.
    const base_fleet_mix = base_factors.fleetMix.passengerCar;
    const new_shares = { ...base_fleet_mix };
    const current_ev = new_shares.ev || 0;
    const new_ev = Math.max(0, Math.min(1, current_ev + scenario.evShareDelta));
    const ev_change = new_ev - current_ev;

    const non_ev_pool = (new_shares.petrol || 0) + (new_shares.diesel || 0) + (new_shares.cng || 0);
    if (non_ev_pool > 0) {
        new_shares.petrol = Math.max(0, new_shares.petrol - ev_change * (new_shares.petrol / non_ev_pool));
        new_shares.diesel = Math.max(0, new_shares.diesel - ev_change * (new_shares.diesel / non_ev_pool));
    }
    new_shares.ev = new_ev;

    // 2. Prepare all scenario overrides
    const overrides: ScenarioOverrides = {
        fleet_mix_override: new_shares,
        speed_delta_kmh_override: scenario.urbanSpeedDeltaKmh,
        lto_reduction_factor_override: scenario.shortHaulFlightReduction
    };

    const scenarioResult = await _computeZoneEmissions(input, overrides);

    // 3. Calculate deltas
    const totalTonnes = scenarioResult.co2e_tonnes - baseline.co2e_tonnes;
    const totalPercent = baseline.co2e_tonnes > 0 ? totalTonnes / baseline.co2e_tonnes : 0;
    const scenarioRoads = scenarioResult.by_module.roadsFleet + scenarioResult.by_module.roadsEv;
    const baselineRoads = baseline.by_module.roadsFleet + baseline.by_module.roadsEv;
    
    return {
        baseline,
        scenario: scenarioResult,
        deltas: {
            totalTonnes,
            totalPercent,
            roadsTonnes: scenarioRoads - baselineRoads,
            aviationTonnes: scenarioResult.by_module.aviation - baseline.by_module.aviation,
        }
    };
};

// FIX: Add missing runZoneExperiment function to handle multiple scenarios.
/**
 * Public function to run a full experiment with a baseline and multiple scenarios.
 */
export const runZoneExperiment = async (input: ZoneEmissionsInput, scenarios: ScenarioPreset[]): Promise<ZoneExperimentResponse> => {
    // This function now expects the full preset objects
    const baseline = await _computeZoneEmissions(input);

    const baselineScenarioResponse: ZoneEmissionsScenarioResponse = {
        baseline: baseline,
        scenario: baseline, // For the baseline "run", scenario is the same
        deltas: {
            totalTonnes: 0,
            totalPercent: 0,
            roadsTonnes: 0,
            aviationTonnes: 0,
        }
    };

    const scenarioRuns: ScenarioRun[] = await Promise.all(
        scenarios.map(async (scenarioPreset) => {
            // We already have the baseline, so just run the scenario part, passing the pre-computed baseline
            const result = await runZoneScenario(input, scenarioPreset.input, baseline);
            return {
                id: scenarioPreset.id,
                label: scenarioPreset.label,
                result: result,
            };
        })
    );

    return {
        baseline: baselineScenarioResponse,
        scenarios: scenarioRuns,
    };
};