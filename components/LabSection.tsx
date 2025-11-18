// components/LabSection.tsx
import React from "react";
import { InputForm } from "./InputForm";
import { PresetSelector } from "./PresetSelector";
import { ExperimentsLog } from "./ExperimentsLog";
import { ResultsDisplay } from "./ResultsDisplay";

// If you already have a map component, import it here instead of MapPanel.
import { MapPanel } from "./MapPanel"; // <-- REPLACE with your actual map component

export interface LabSectionProps {
  polygon: any | null;
  onPolygonChange: (polygon: any | null) => void;

  factorsPackId: string;
  onFactorsPackChange: (id: string) => void;

  timeWindowMinutes: number;
  onTimeWindowChange: (minutes: number) => void;

  selectedPresetIds: string[];
  onSelectedPresetIdsChange: (ids: string[]) => void;

  onRunBaseline: () => void;
  onRunExperiment: () => void;

  currentResult: any | null;
  currentExperiment: any | null;

  experimentLog: any[];
  onSelectExperiment: (entry: any) => void;

  loading: boolean;
  uiError: string | null;
}

export const LabSection: React.FC<LabSectionProps> = (props) => {
  const {
    polygon,
    onPolygonChange,
    factorsPackId,
    onFactorsPackChange,
    timeWindowMinutes,
    onTimeWindowChange,
    selectedPresetIds,
    onSelectedPresetIdsChange,
    onRunBaseline,
    onRunExperiment,
    currentResult,
    currentExperiment,
    experimentLog,
    onSelectExperiment,
    loading,
    uiError,
  } = props;

  return (
    <section id="lab-section" className="lab">
      <div className="lab-inner">
        <div className="lab-header-row">
          <div>
            <h2>Interactive lab</h2>
            <p>Draw a zone, pick a time window, run baselines vs. scenarios.</p>
          </div>
          <div className="lab-pill">Q-aware model · v0.4</div>
        </div>

        <div className="lab-grid">
          <div className="lab-map-panel">
            {/* Replace MapPanel with your actual map component */}
            <MapPanel polygon={polygon} onPolygonChange={onPolygonChange} />
          </div>

          <div className="lab-controls-panel">
            <InputForm
              factorsPackId={factorsPackId}
              timeWindowMinutes={timeWindowMinutes}
              onFactorsPackChange={onFactorsPackChange}
              onTimeWindowChange={onTimeWindowChange}
              onRunBaseline={onRunBaseline}
              loading={loading}
              uiError={uiError}
            />
            <PresetSelector
              selectedPresetIds={selectedPresetIds}
              onSelectedPresetIdsChange={onSelectedPresetIdsChange}
              onRunExperiment={onRunExperiment}
              loading={loading}
              // optional: pass uiError if you also want to show it there
            />
          </div>
        </div>

        <div className="lab-bottom-grid">
          <ResultsDisplay
            result={currentResult}
            experiment={currentExperiment}
            loading={loading}
          />
          <ExperimentsLog
            entries={experimentLog}
            onSelect={onSelectExperiment}
          />
        </div>
      </div>
    </section>
  );
};
