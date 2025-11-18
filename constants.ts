// FIX: Added physical constants required by the physics engine. This file was previously empty.
/**
 * Physical constants for air properties.
 * Based on International Standard Atmosphere (ISA) values.
 */

// Specific gas constant for dry air in J/(kg·K)
export const R_SPECIFIC_DRY_AIR = 287.058;

// Reference air density at sea level (15°C, 1013.25 hPa) in kg/m^3
export const RHO_REF_DENSITY_KG_M3 = 1.225;

/**
 * v0.4: Per-module relative uncertainty for composition-weighted bands.
 */
export const MODULE_UNCERTAINTY = {
  roads_fleet: 0.20, // ±20% for ICE/CNG fleet
  roads_ev: 0.30,    // ±30% for EV fleet (grid & EV factors are less certain)
  aviation: 0.25     // ±25% for LTO factors
};
