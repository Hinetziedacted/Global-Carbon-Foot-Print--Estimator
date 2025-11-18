// components/PresetSelector.tsx
import React from "react";

type ScenarioPresetId = string; // or import your real type

interface PresetSelectorProps {
  selectedPresetIds: ScenarioPresetId[];
  onSelectedPresetIdsChange: (ids: ScenarioPresetId[]) => void;
  onRunExperiment: () => void;
  loading: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedPresetIds,
  onSelectedPresetIdsChange,
  onRunExperiment,
  loading,
}) => {
  const scenarioCount = selectedPresetIds.length;

  return (
    <div className="preset-selector">
      {/* your existing scenario toggle UI that calls onSelectedPresetIdsChange */}

      <button
        type="button"
        className="run-button"
        onClick={onRunExperiment}
        disabled={loading || scenarioCount === 0}
      >
        {scenarioCount === 0
          ? "Run experiment (select scenarios)"
          : `Run experiment (${scenarioCount} scenario${scenarioCount > 1 ? "s" : ""})`}
      </button>
    </div>
  );
};
