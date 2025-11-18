// ===== New types for Factor Packs (v0.3) =====

export type FactorsPackId = "FI" | "DE" | "US" | "IN" | "EU" | "GLOBAL";

// FIX: Added missing SpeedCurveCoeffs type, which is used in factors/packs.ts and services/physicsEngine.ts.
export type SpeedCurveCoeffs = {
  vehicle_class: string;
  euro_class: string;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  epsilon: number;
  zeta: number;
  eta: number;
};

export type VehicleFleetMix = {
  petrol: number;
  diesel: number;
  cng: number;
  ev: number;
};

export type HeavyDutyFleetMix = {
  diesel: number;
  cng: number;
  ev?: number;
};

export type FactorsPack = {
  id: FactorsPackId;
  label: string;
  fleetMix: {
    passengerCar: VehicleFleetMix;
    // FIX: Corrected typo in type name from `VehicleFleetmix` to `VehicleFleetMix`.
    lightCommercial: VehicleFleetMix;
    heavyDuty: HeavyDutyFleetMix;
  };
  fuelCo2Factors: {
    petrol_gco2_per_litre: number;
    diesel_gco2_per_litre: number;
    cng_gco2_per_kwh: number; // Assuming CNG is often measured by energy content
    grid_gco2_per_kwh: number;
  };
  meta: {
    source: string;
    dataYear: number;
    notes?: string;
  };
};

// ===== Core Application Types =====

// FIX: Changed QualityFlag from a type alias to an enum to allow it to be used as a value.
export enum QualityFlag {
  Q1 = "Q1",
  Q2 = "Q2",
  Q3 = "Q3",
  Qx = "Qx",
}

export interface QualityInfo {
  flag: QualityFlag;
  uncertainty: {
    low_multiplier: number;
    high_multiplier: number;
  };
  notes: string[];
}

export interface ZoneEmissionsResponse {
  co2e_tonnes: number;
  low_estimate_tonnes: number;
  high_estimate_tonnes: number;
  quality_info: QualityInfo;
  factors_pack_id: FactorsPackId;
  by_module: {
    roadsFleet: number;
    roadsEv: number;
    aviation: number;
  };
  data_sources: string[];
  metadata: {
    edges_sampled: number;
    time_window_min: number;
    weather_temp_c: number;
    grid_intensity_g_co2_kwh: number;
    fleet_shares: VehicleFleetMix; // Using passenger car mix as representative for now
  };
}

export interface WeatherData {
    temp: number; // celsius
    pressure: number; // hPa
    wind_speed: number; // m/s
    wind_deg: number; // degrees
}

export interface Edge {
    id: string;
    length_km: number;
    bearing: number;
    grade_percent: number;
}

export interface ZoneEmissionsInput {
  country_iso2: string;
  time_window_minutes: number;
  polygon: object;
}

export interface ScenarioInput {
  evShareDelta: number;
  urbanSpeedDeltaKmh: number;
  shortHaulFlightReduction: number;
}

export interface ZoneEmissionsScenarioResponse {
  baseline: ZoneEmissionsResponse;
  scenario: ZoneEmissionsResponse;
  deltas: {
    totalTonnes: number;
    totalPercent: number;
    roadsTonnes: number;
    aviationTonnes: number;
  };
}

// FIX: Add missing types for experiment and scenario runs to resolve import errors.
export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  input: ScenarioInput;
}

export interface ScenarioRun {
  id: string;
  label: string;
  result: ZoneEmissionsScenarioResponse;
}

export interface ZoneExperimentResponse {
  baseline: ZoneEmissionsScenarioResponse;
  scenarios: ScenarioRun[];
}

export interface ExperimentLogEntry {
  id: string;
  timestamp: Date;
  factorPackId: FactorsPackId;
  presetIds: string[];
  baselineTonnes: number;
  bestDeltaPercent: number;
  fullResult: ZoneExperimentResponse;
}