import React from 'react';
import { ZoneExperimentResponse } from '../types';
import { FACTORS_PACKS } from '../factors/packs';
import { MODULE_UNCERTAINTY } from '../constants';

interface MethodsPanelProps {
  results: ZoneExperimentResponse;
}

const MethodsPanel: React.FC<MethodsPanelProps> = ({ results }) => {
  const baseline = results.baseline.baseline;
  const factorsPack = FACTORS_PACKS[baseline.factors_pack_id];
  const qualityInfo = baseline.quality_info;
  
  const qualityInterpretation: Record<string, string> = {
      Q1: "High confidence. Estimate is based on live, local data sources.",
      Q2: "Medium confidence. Estimate uses a mix of live data and regional defaults.",
      Q3: "Low confidence. Estimate relies heavily on global default values.",
      Qx: "Incomplete. Critical data was missing, estimate is indicative only.",
  }

  return (
    <div className="methods-panel-content">
      <h4>Methodology Summary</h4>
      <ul>
        <li>
          <strong>Factor Basis:</strong> {factorsPack.id} – {factorsPack.label} ({factorsPack.meta.source}, {factorsPack.meta.dataYear}).
        </li>
        <li>
          <strong>Data Sources Queried:</strong> {baseline.data_sources.join(', ')}.
        </li>
        <li>
            <strong>Data Quality Assessment ({qualityInfo.flag}):</strong> {qualityInterpretation[qualityInfo.flag]}
        </li>
      </ul>


      <h4>Uncertainty Model (v0.4)</h4>
        <ul>
          <li>Uncertainty is calculated using a composition-weighted band based on per-module estimates:
            <ul>
              <li>Road ICE/CNG Fleet: <strong>±{(MODULE_UNCERTAINTY.roads_fleet * 100).toFixed(0)}%</strong></li>
              <li>Road EV Fleet: <strong>±{(MODULE_UNCERTAINTY.roads_ev * 100).toFixed(0)}%</strong></li>
              <li>Aviation (LTO): <strong>±{(MODULE_UNCERTAINTY.aviation * 100).toFixed(0)}%</strong></li>
            </ul>
          </li>
          <li>The final uncertainty band for each run (e.g., a specific scenario) is the sum of these individual module uncertainties.</li>
          <li>
            <strong>Baseline uncertainty band:</strong> {baseline.low_estimate_tonnes.toFixed(1)} – {baseline.high_estimate_tonnes.toFixed(1)} t CO₂e.
          </li>
        </ul>

      <h4>Modelling Choices</h4>
      <ul>
        <li>Road emissions are derived from per-vehicle-class speed/consumption curves (COPERT-style methodology).</li>
        <li>Physics-based multipliers (aerodynamics, HVAC, grade) are applied to correct for real-world conditions.</li>
        <li>Aviation emissions are based on Landing/Takeoff (LTO) cycle counts for a generic short-haul jet.</li>
        <li>Scenario levers adjust model *inputs* (e.g., fleet mix, average speed) and re-run the same deterministic engine.</li>
      </ul>

      <h4>Limitations</h4>
      <ul>
        <li>Live data APIs (traffic, weather, aviation) are currently mocked and return static placeholder values.</li>
        <li>Factors packs contain approximate, illustrative numbers and must be replaced with official, peer-reviewed data from sources like EEA, DEFRA, or the IEA.</li>
        <li>The model currently only simulates a single class of passenger car and generic jet, not the full spectrum of vehicle/aircraft types.</li>
      </ul>
    </div>
  );
};

export default MethodsPanel;