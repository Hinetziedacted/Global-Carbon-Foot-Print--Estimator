import { ScenarioPreset } from '../types';

export const SCENARIO_PRESETS: Record<string, ScenarioPreset> = {
  EV_PUSH: {
    id: 'EV_PUSH',
    label: '+30% EV Share',
    description: 'Increases the share of Electric Vehicles in the passenger car fleet by 30 percentage points, displacing petrol and diesel proportionally.',
    input: {
      evShareDelta: 0.30,
      urbanSpeedDeltaKmh: 0,
      shortHaulFlightReduction: 0,
    }
  },
  CITY_30: {
    id: 'CITY_30',
    label: 'Urban Speed Reduction',
    description: 'Reduces average urban road speeds by 20 km/h to simulate aggressive traffic calming or a 30 km/h city-wide speed limit.',
    input: {
      evShareDelta: 0,
      urbanSpeedDeltaKmh: -20,
      shortHaulFlightReduction: 0,
    }
  },
  FLIGHT_SHIFT: {
    id: 'FLIGHT_SHIFT',
    label: 'Cut Short-Haul Flights (50%)',
    description: 'Reduces the number of short-haul Landing/Takeoff (LTO) cycles within the zone by 50%, simulating a modal shift to rail.',
    input: {
      evShareDelta: 0,
      urbanSpeedDeltaKmh: 0,
      shortHaulFlightReduction: 0.50,
    }
  },
  COMBO_DECARB: {
    id: 'COMBO_DECARB',
    label: 'Combined Decarbonization',
    description: 'A combination of the EV push, urban speed reduction, and flight shift policies.',
    input: {
      evShareDelta: 0.30,
      urbanSpeedDeltaKmh: -20,
      shortHaulFlightReduction: 0.50,
    }
  }
};
