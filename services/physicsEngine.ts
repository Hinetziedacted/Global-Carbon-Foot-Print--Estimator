
import { RHO_REF_DENSITY_KG_M3, R_SPECIFIC_DRY_AIR } from '../constants';
import { SpeedCurveCoeffs, WeatherData } from '../types';

/**
 * Step 1: Base Fuel Consumption (Speed Polynomial)
 * Calculates fuel consumption in g/km based on speed using COPERT-style polynomial.
 */
export const computeBaseFuelConsumption = (speed_kmh: number, coeffs: SpeedCurveCoeffs): number => {
  const v = Math.max(speed_kmh, 1.0); // Avoid division by zero
  const fc_base =
    coeffs.alpha * v ** 2 +
    coeffs.beta * v +
    coeffs.gamma +
    coeffs.delta / v +
    coeffs.epsilon / v ** 2 +
    coeffs.zeta / v +
    coeffs.eta;
  return Math.max(fc_base, 5); // Safety clipping
};

/**
 * Step 2: Aerodynamic Multiplier
 */
// 2a: Compute Air Density from Ideal Gas Law
const computeAirDensity = (temp_celsius: number, pressure_hpa: number): number => {
  const pressure_pa = pressure_hpa * 100;
  const temp_kelvin = temp_celsius + 273.15;
  return pressure_pa / (R_SPECIFIC_DRY_AIR * temp_kelvin);
};

// 2b: Compute Relative Air Speed
const computeRelativeAirSpeed = (
  speed_kmh: number,
  wind_speed_ms: number,
  vehicle_bearing_deg: number,
  wind_bearing_deg: number
): number => {
  // Meteorological convention: wind_bearing is FROM, vehicle_bearing is TO. Flip wind to "TO".
  const angle_rad = ((vehicle_bearing_deg - (wind_bearing_deg + 180)) * Math.PI) / 180;
  const v_headwind_ms = wind_speed_ms * Math.cos(angle_rad);
  const v_headwind_kmh = v_headwind_ms * 3.6;
  return Math.max(speed_kmh + v_headwind_kmh, 1.0); // Avoid division by zero
};

// 2c: Compute Aero Multiplier
export const computeAeroMultiplier = (
  speed_kmh: number,
  weather: WeatherData,
  vehicle_bearing_deg: number
): number => {
  const v_vehicle = Math.max(speed_kmh, 1.0);
  const rho = computeAirDensity(weather.temp, weather.pressure);
  const v_air = computeRelativeAirSpeed(speed_kmh, weather.wind_speed, vehicle_bearing_deg, weather.wind_deg);
  
  const faero = (v_air / v_vehicle) ** 3 * (rho / RHO_REF_DENSITY_KG_M3);
  return Math.max(0.5, Math.min(faero, 2.0)); // Clipping
};

/**
 * Step 3: HVAC Effects
 */
// 3a: Temperature-Dependent HVAC Power
const computeHvacPower = (temp_celsius: number): number => {
  return 0.5 + 0.03 * Math.max(0, temp_celsius - 20); // in kW
};

// 3b: HVAC Multiplier (ICE)
export const computeHvacMultiplierICE = (speed_kmh: number, temp_celsius: number): number => {
  const p_hvac_kw = computeHvacPower(temp_celsius);
  // Simplified from spec: empirical factor of 200 gCO2/kWh, here represented as a direct fuel penalty.
  // The formula in spec `f_ac = 1 + beta_ac * v_ref / (v + v_e)` is complex.
  // A simpler approach is to calculate g/km penalty directly.
  // 200 gCO2/kWh * p_hvac_kw / speed_kmh ~= additive g/km
  // A 2kW HVAC at 20km/h is 20g/km, which is ~25% of total EF.
  // So we'll model this as a multiplier for simplicity.
  const base_ef_at_speed = 80; // assume 80 g/km average
  const hvac_ef_penalty = (p_hvac_kw * 200) / Math.max(speed_kmh, 10);
  return 1 + (hvac_ef_penalty / base_ef_at_speed);
};

// 3c: HVAC Added Energy (EV)
export const computeHvacEnergyEV = (speed_kmh: number, temp_celsius: number): number => {
  const p_hvac_kw = computeHvacPower(temp_celsius);
  return p_hvac_kw / Math.max(speed_kmh, 1.0); // kWh/km
};

/**
 * Step 4: Grade Multiplier
 */
export const computeGradeMultiplier = (grade_percent: number, isEV: boolean): number => {
  if (isEV) {
    const m_grade = 1 + 0.030 * grade_percent;
    return Math.max(0.70, Math.min(m_grade, 1.30)); // Clipping for EV
  } else {
    const m_grade = 1 + 0.035 * grade_percent;
    return Math.max(0.65, Math.min(m_grade, 1.35)); // Clipping for ICE
  }
};
