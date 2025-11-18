import React, { useState } from 'react';
import { QualityFlag, ZoneExperimentResponse, ScenarioRun, ZoneEmissionsResponse } from '../types';
import MethodsPanel from './MethodsPanel';

interface ResultsDisplayProps {
  results: ZoneExperimentResponse;
}

const QualityPill: React.FC<{ flag: QualityFlag }> = ({ flag }) => {
  const flagInfo: Record<string, string> = {
    [QualityFlag.Q1]: "Based on live data feeds (traffic, weather) and local factors",
    [QualityFlag.Q2]: "Based on a mix of live and default data (e.g., regional factors)",
    [QualityFlag.Q3]: "Based on global defaults and statistical data",
    [QualityFlag.Qx]: "Data sources were incomplete for a full estimate",
  };
  return (
    <div className={`quality-pill quality-${flag}`} title={flagInfo[flag]}>
      {flag}
    </div>
  );
};

const formatTonnes = (val: number, precision: number = 1) => val.toFixed(precision);
const formatPercent = (val: number) => isFinite(val) ? `${val > 0 ? '+' : ''}${(val * 100).toFixed(0)}%` : 'N/A';

const DeltaDisplay: React.FC<{ value: number, percent: number, precision?: number }> = ({ value, percent, precision = 1 }) => {
    const isNegative = percent < 0;
    const isPositive = percent > 0;
    const sign = isNegative ? '' : '+';
    
    let tonnesDisplay: string;
    if (Math.abs(value) > 0 && Math.abs(value) < 0.005) {
        tonnesDisplay = '≈0.0 t';
    } else {
        tonnesDisplay = `${sign}${formatTonnes(value, precision)} t`;
    }

    return (
        <div className={`delta-value ${isNegative ? 'delta-negative' : ''} ${isPositive ? 'delta-positive' : ''}`}>
            {tonnesDisplay} <br/> ({formatPercent(percent)})
        </div>
    );
};

const ScenarioChart: React.FC<{ scenarios: ScenarioRun[] }> = ({ scenarios }) => {
    const maxPercent = Math.max(0.01, ...scenarios.map(s => Math.abs(s.result.deltas.totalPercent)));

    return (
        <div className="scenario-chart-container">
            <h4>Scenario Impact Comparison</h4>
            {scenarios.map(s => {
                const percent = s.result.deltas.totalPercent;
                const isNegative = percent < 0;
                // Scale width relative to the max change in the current experiment, up to 50% of the bar width
                const barWidth = (Math.abs(percent) / maxPercent) * 50;

                return (
                    <div className="scenario-bar-row" key={s.id}>
                        <div className="scenario-bar-label" title={s.label}>{s.label}</div>
                        <div className="scenario-bar-wrapper">
                            <div className="scenario-bar-zeroline"></div>
                            <div 
                                className={`scenario-bar ${isNegative ? 'bar-negative' : 'bar-positive'}`}
                                style={{ width: `${barWidth}%` }}
                            ></div>
                        </div>
                        <div className={`scenario-bar-value ${isNegative ? 'delta-negative' : 'delta-positive'}`}>
                            {formatPercent(percent)}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'methods' | 'json'>('snapshot');
  
  const { baseline: baselineRun, scenarios } = results;
  const baseline = baselineRun.baseline;

  const bestScenario = scenarios.length > 0
    ? [...scenarios].sort((a,b) => a.result.deltas.totalPercent - b.result.deltas.totalPercent)[0]
    : null;

  const uncertaintyRun: ZoneEmissionsResponse = bestScenario ? bestScenario.result.scenario : baseline;
  const uncertaintyLabel = bestScenario ? "Uncertainty (best scenario):" : "Uncertainty:";

  const handleExport = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `zone_emissions_lab_run_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  const getRoadsTotal = (run: ZoneEmissionsResponse) => run.by_module.roadsFleet + run.by_module.roadsEv;

  return (
    <div className="card results-card">
        <div className="card-title">
            <span>Zone Emissions Lab · Snapshot</span>
            <div className="results-header-info">
              <QualityPill flag={baseline.quality_info.flag} />
              <div>{uncertaintyLabel} {formatTonnes(uncertaintyRun.low_estimate_tonnes)} – {formatTonnes(uncertaintyRun.high_estimate_tonnes)} t</div>
            </div>
        </div>
        
        <div className="results-tabs">
            <button className={`tab-button ${activeTab === 'snapshot' ? 'active' : ''}`} onClick={() => setActiveTab('snapshot')}>Snapshot</button>
            <button className={`tab-button ${activeTab === 'methods' ? 'active' : ''}`} onClick={() => setActiveTab('methods')}>Methods</button>
            <button className={`tab-button ${activeTab === 'json' ? 'active' : ''}`} onClick={() => setActiveTab('json')}>JSON</button>
        </div>
        
        <div className="tab-content">
            {activeTab === 'snapshot' && (
                <>
                    <h3 className="results-summary-headline">
                        Baseline: {formatTonnes(baseline.co2e_tonnes)} t
                        {bestScenario && (
                            <>
                                {' · '}
                                <span className={`best-scenario-delta ${bestScenario.result.deltas.totalPercent > 0 ? 'delta-positive' : ''}`}>
                                    Best Scenario: {formatTonnes(bestScenario.result.deltas.totalTonnes)} t ({formatPercent(bestScenario.result.deltas.totalPercent)})
                                </span>
                            </>
                        )}
                    </h3>
                   
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Baseline</th>
                                {scenarios.map(s => <th key={s.id}>{s.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Roads</td>
                                <td>{formatTonnes(getRoadsTotal(baseline), 2)} t</td>
                                {scenarios.map(s => (
                                    <td key={s.id}>
                                        {formatTonnes(getRoadsTotal(s.result.scenario), 2)} t
                                        <DeltaDisplay 
                                            value={s.result.deltas.roadsTonnes}
                                            percent={getRoadsTotal(baseline) > 0 ? s.result.deltas.roadsTonnes / getRoadsTotal(baseline) : 0}
                                            precision={2}
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>Aviation</td>
                                <td>{formatTonnes(baseline.by_module.aviation, 2)} t</td>
                                {scenarios.map(s => (
                                    <td key={s.id}>
                                        {formatTonnes(s.result.scenario.by_module.aviation, 2)} t
                                        <DeltaDisplay 
                                            value={s.result.deltas.aviationTonnes}
                                            percent={baseline.by_module.aviation > 0 ? s.result.deltas.aviationTonnes / baseline.by_module.aviation : 0}
                                            precision={2}
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>Total CO₂e</td>
                                <td>{formatTonnes(baseline.co2e_tonnes)} t</td>
                                {scenarios.map(s => (
                                    <td key={s.id}>
                                        {formatTonnes(s.result.scenario.co2e_tonnes)} t
                                        <DeltaDisplay 
                                            value={s.result.deltas.totalTonnes}
                                            percent={s.result.deltas.totalPercent}
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    {scenarios.length > 0 && <ScenarioChart scenarios={scenarios} />}
                </>
            )}

            {activeTab === 'methods' && <MethodsPanel results={results} />}
            
            {activeTab === 'json' && (
              <div>
                <button onClick={handleExport} className="button-secondary" style={{width: 'auto', padding: '0.5rem 1rem', float: 'right', marginBottom: '1rem'}}>
                  Download JSON
                </button>
                <pre className="json-display">
                  <code>{JSON.stringify(results, null, 2)}</code>
                </pre>
              </div>
            )}
        </div>
    </div>
  );
};

export default ResultsDisplay;