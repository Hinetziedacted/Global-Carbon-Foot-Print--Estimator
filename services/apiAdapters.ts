
import { Edge, WeatherData } from '../types';

/**
 * Mocks the TomTom Flow API to get live speed for a list of road edges.
 */
export const fetchSpeeds = async (edges: Edge[]): Promise<Map<string, number>> => {
  // In a real app, this would make parallel calls to TomTom API.
  // Here, we simulate it with a random speed based on edge properties.
  await new Promise(resolve => setTimeout(resolve, 250)); // Simulate network latency
  
  const speedMap = new Map<string, number>();
  edges.forEach(edge => {
    // Simulate lower speeds in complex areas (higher grade) and higher on straightaways
    const baseSpeed = 50;
    const randomFactor = (Math.random() - 0.5) * 20; // +/- 10 km/h
    const gradeFactor = -Math.abs(edge.grade_percent) * 2;
    const speed = Math.max(15, baseSpeed + randomFactor + gradeFactor); // Min speed 15 km/h
    speedMap.set(edge.id, speed);
  });
  return speedMap;
};

/**
 * Mocks the OpenWeather OneCall API to get weather for a polygon's centroid.
 */
export const fetchWeather = async (): Promise<WeatherData> => {
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network latency
  return {
    temp: 18, // 18°C
    pressure: 1013, // hPa
    wind_speed: 5, // 5 m/s
    wind_deg: 270, // from West
  };
};

/**
 * Mocks the OpenSky Network API to get LTO (Landing/Takeoff) counts.
 */
export const fetchLtoCounts = async (): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network latency
    // Simulate finding one small airport in the polygon with some activity.
    return 4; // 2 landings, 2 takeoffs
};
