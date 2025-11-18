import React from 'react';
import { ExperimentLogEntry } from '../types';
import { SCENARIO_PRESETS } from '../factors/scenarioPresets';

interface ExperimentsLogProps {
  log: ExperimentLogEntry[];
  onReplay: (experimentId: string) => void;
}

const ExperimentsLog: React.FC<ExperimentsLogProps> = ({ log, onReplay }) => {
  if (log.length === 0) {
    return <p className="helper-text">Your completed runs will appear here.</p>;
  }

  return (
    <div className="log-card-grid">
      {log.map(entry => {
        const scenarioLabels = entry.presetIds.map(id => SCENARIO_PRESETS[id]?.label || id);
        const bestScenarioTonnes = entry.baselineTonnes * (1 + entry.bestDeltaPercent);

        return (
          <div key={entry.id} className="log-card" onClick={() => onReplay(entry.id)} title="Click to reload this experiment's results">
            <div className="log-card-header">
              <span>{entry.timestamp.toLocaleTimeString()}</span>
              <span>{entry.factorPackId}</span>
            </div>
            <div className="log-card-body">
              {scenarioLabels.length > 0 ? (
                <ul>
                  {scenarioLabels.map(label => <li key={label}>- {label}</li>)}
                </ul>
              ) : (
                <em>Baseline Only</em>
              )}
            </div>
            <div className="log-card-footer">
              {entry.presetIds.length > 0 ? (
                 <div className={entry.bestDeltaPercent < 0 ? 'delta-negative' : 'delta-positive'}>
                   {entry.baselineTonnes.toFixed(1)} t → {bestScenarioTonnes.toFixed(1)} t
                   <span> ({(entry.bestDeltaPercent * 100).toFixed(0)}%)</span>
                 </div>
              ) : (
                <div>{entry.baselineTonnes.toFixed(1)} t <span>(Baseline)</span></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExperimentsLog;