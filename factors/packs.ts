import { FactorsPack, FactorsPackId, SpeedCurveCoeffs } from '../types';

// TODO: Replace with real, validated coefficients for different vehicle classes from COPERT or similar.
// These are illustrative coefficients for a generic petrol passenger car.
export const SPEED_CURVE_COEFFS: { [key: string]: SpeedCurveCoeffs } = {
    PC_Petrol_Euro5: {
        vehicle_class: "PC_Petrol_Consumption",
        euro_class: "Euro5",
        // FC(v) = 0.0018v^2 - 0.11v + 105
        alpha: 0.0018, beta: -0.11, gamma: 105, delta: 0, epsilon: 0, zeta: 0, eta: 0
    }
};

// Based on Aviation Module section
export const LTO_FACTORS = {
    generic_jet: { aircraft_class: 'generic_jet', co2_kg_per_lto: 3150 }, // Standard value for short-haul jets
};

export const FACTORS_PACKS: Record<FactorsPackId, FactorsPack> = {
  FI: {
    id: "FI",
    label: "Finland (FI)",
    fleetMix: {
      // TODO: Replace with real data from Traficom
      passengerCar: { petrol: 0.35, diesel: 0.55, ev: 0.10, cng: 0.0 },
      lightCommercial: { petrol: 0.1, diesel: 0.88, ev: 0.02, cng: 0.0 },
      heavyDuty: { diesel: 0.99, cng: 0.01 },
    },
    fuelCo2Factors: {
      // TODO: Replace with official VTT / national values
      petrol_gco2_per_litre: 2350,
      diesel_gco2_per_litre: 2660,
      cng_gco2_per_kwh: 185,
      grid_gco2_per_kwh: 120,
    },
    meta: {
      source: "Illustrative National Data",
      dataYear: 2023,
    },
  },
  DE: {
    id: "DE",
    label: "Germany (DE)",
    fleetMix: {
      // TODO: Replace with real data from KBA
      passengerCar: { petrol: 0.45, diesel: 0.45, ev: 0.08, cng: 0.02 },
      lightCommercial: { petrol: 0.08, diesel: 0.90, ev: 0.02, cng: 0.0 },
      heavyDuty: { diesel: 0.98, cng: 0.02 },
    },
    fuelCo2Factors: {
      // TODO: Replace with official UBA values
      petrol_gco2_per_litre: 2370,
      diesel_gco2_per_litre: 2650,
      cng_gco2_per_kwh: 190,
      grid_gco2_per_kwh: 434,
    },
    meta: {
      source: "Illustrative National Data",
      dataYear: 2023,
    },
  },
  US: {
    id: "US",
    label: "United States (US)",
    fleetMix: {
      // TODO: Replace with real data from EPA/DOT
      passengerCar: { petrol: 0.62, diesel: 0.24, ev: 0.12, cng: 0.02 },
      lightCommercial: { petrol: 0.75, diesel: 0.2, ev: 0.05, cng: 0.0 },
      heavyDuty: { diesel: 0.97, cng: 0.03 },
    },
    fuelCo2Factors: {
      // TODO: Replace with official EPA values
      petrol_gco2_per_litre: 2300,
      diesel_gco2_per_litre: 2700,
      cng_gco2_per_kwh: 180,
      grid_gco2_per_kwh: 385,
    },
    meta: {
      source: "Illustrative National Data",
      dataYear: 2023,
    },
  },
  IN: {
    id: "IN",
    label: "India (IN)",
    fleetMix: {
      // TODO: Replace with real data from MoRTH
      passengerCar: { petrol: 0.65, diesel: 0.30, ev: 0.02, cng: 0.03 },
      lightCommercial: { petrol: 0.2, diesel: 0.75, ev: 0.01, cng: 0.04 },
      heavyDuty: { diesel: 0.96, cng: 0.04 },
    },
    fuelCo2Factors: {
      // TODO: Replace with official national values
      petrol_gco2_per_litre: 2290,
      diesel_gco2_per_litre: 2680,
      cng_gco2_per_kwh: 200,
      grid_gco2_per_kwh: 690,
    },
    meta: {
      source: "Illustrative National Data",
      dataYear: 2023,
    },
  },
  EU: {
    id: "EU",
    label: "European Union (EU Average)",
    fleetMix: {
      // TODO: Replace with real data from ACEA
      passengerCar: { petrol: 0.38, diesel: 0.52, ev: 0.09, cng: 0.01 },
      lightCommercial: { petrol: 0.07, diesel: 0.91, ev: 0.02, cng: 0.0 },
      heavyDuty: { diesel: 0.98, cng: 0.02 },
    },
    fuelCo2Factors: {
      // TODO: Replace with official EEA/JRC values
      petrol_gco2_per_litre: 2360,
      diesel_gco2_per_litre: 2655,
      cng_gco2_per_kwh: 195,
      grid_gco2_per_kwh: 295,
    },
    meta: {
      source: "Illustrative Regional Average",
      dataYear: 2023,
    },
  },
  GLOBAL: {
    id: "GLOBAL",
    label: "Global Average",
    fleetMix: {
      // TODO: Replace with real data from IEA
      passengerCar: { petrol: 0.57, diesel: 0.33, ev: 0.07, cng: 0.03 },
      lightCommercial: { petrol: 0.4, diesel: 0.55, ev: 0.04, cng: 0.01 },
      heavyDuty: { diesel: 0.95, cng: 0.05 },
    },
    fuelCo2Factors: {
      // TODO: Replace with official IEA/IPCC values
      petrol_gco2_per_litre: 2350,
      diesel_gco2_per_litre: 2680,
      cng_gco2_per_kwh: 200,
      grid_gco2_per_kwh: 475,
    },
    meta: {
      source: "Illustrative Global Average (IEA-style)",
      dataYear: 2023,
    },
  }
};
