import { FactorsPackId } from '../types';
import { FACTORS_PACKS } from './packs';

// A simple map of EU countries for fallback logic
const EU_COUNTRIES = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']);

/**
 * Resolves a country ISO2 code to the most appropriate FactorsPackId.
 * Falls back from country-specific -> EU -> GLOBAL.
 * @param countryIso2 The 2-letter country code.
 * @returns The resolved FactorsPackId.
 */
export const resolveFactorsPackId = (countryIso2: string): FactorsPackId => {
    const upperIso = countryIso2.toUpperCase() as FactorsPackId;
    
    // 1. Check for a direct country-specific match
    if (FACTORS_PACKS[upperIso]) {
        return upperIso;
    }
    
    // 2. Check if the country is in the EU and fall back to the EU pack
    if (EU_COUNTRIES.has(upperIso)) {
        return "EU";
    }
    
    // 3. Fall back to the global default
    return "GLOBAL";
};
