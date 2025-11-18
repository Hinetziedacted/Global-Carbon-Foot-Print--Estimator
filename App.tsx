// App.tsx
import React, { useState } from "react";
import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { LabSection } from "./components/LabSection";

import {
  computeZoneEmissions,
  runZoneExperiment,
} from "./services/orchestrator";

import type {
  ZoneEmissionsInput,
  ZoneEmissionsResponse,
  ZoneExperimentInput,
  ZoneExperimentResponse,
  ScenarioPresetId,
  ExperimentLogEntry,
  PolygonGeoJSON, // whatever you call this in types.ts
} from "./types";

export default function App() {
  // geometry & inputs
  const [polygon, setPolygon] = useState<PolygonGeoJSON | null>(null);
  const [factorsPackId, setFactorsPackId] = useState<string>("IN_2024"); // adjust default
  const [timeWindowMinutes, setTimeWindowMinutes] = useState<number>(60);
  const [selectedPresetIds, setSelectedPresetIds] = useState<ScenarioPresetId[]>([]);

  // results
  const [currentResult, setCurrentResult] =
    useState<ZoneEmissionsResponse | null>(null);
  const [currentExperiment, setCurrentExperiment] =
    useState<ZoneExperimentResponse | null>(null);
  const [experimentLog, setExperimentLog] = useState<ExperimentLogEntry[]>([]);

  // UI flags
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const togglePreset = (id: ScenarioPresetId) => {
    setSelectedPresetIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const appendLog = (entry: Omit<ExperimentLogEntry, "id">) => {
    setExperimentLog((prev) => [
      ...prev,
      {
        id:
          (crypto as any).randomUUID?.() ??
          String(Date.now()) + "-" + Math.random().toString(16).slice(2),
        ...entry,
      },
    ]);
  };

  const handleRunBaseline = async () => {
    console.log("[RUN BASELINE] clicked", { polygon, factorsPackId, timeWindowMinutes });

    if (!polygon) {
      setUiError("Draw a zone on the map first.");
      return;
    }

    const input: ZoneEmissionsInput = {
      polygon,
      factorsPackId,
      timeWindowMinutes,
    };

    try {
      setLoading(true);
      setUiError(null);
      const result = await computeZoneEmissions(input);
      console.log("[RUN BASELINE] result", result);

      setCurrentResult(result);
      setCurrentExperiment(null);

      appendLog({
        timestampIso: new Date().toISOString(),
        kind: "baseline",
        factorsPackId,
        scenarioPresetIds: [],
        result,
        experiment: null,
      });
    } catch (err) {
      console.error("[RUN BASELINE] failed", err);
      setUiError("Something went wrong while computing emissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunExperiment = async () => {
    console.log("[RUN EXPERIMENT] clicked", {
      polygon,
      factorsPackId,
      timeWindowMinutes,
      presets: selectedPresetIds,
    });

    if (!polygon) {
      setUiError("Draw a zone on the map first.");
      return;
    }
    if (selectedPresetIds.length === 0) {
      setUiError("Select at least one policy lever or scenario preset.");
      return;
    }

    const input: ZoneExperimentInput = {
      polygon,
      factorsPackId,
      timeWindowMinutes,
      scenarioPresetIds: selectedPresetIds,
    };

    try {
      setLoading(true);
      setUiError(null);
      const experiment = await runZoneExperiment(input);
      console.log("[RUN EXPERIMENT] experiment", experiment);

      setCurrentExperiment(experiment);
      setCurrentResult(null);

      appendLog({
        timestampIso: new Date().toISOString(),
        kind: "experiment",
        factorsPackId,
        scenarioPresetIds: selectedPresetIds,
        result: null,
        experiment,
      });
    } catch (err) {
      console.error("[RUN EXPERIMENT] failed", err);
      setUiError("Something went wrong while computing emissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLogEntry = (entry: ExperimentLogEntry) => {
    // replay: show the experiment from the log
    if (entry.experiment) {
      setCurrentExperiment(entry.experiment);
      setCurrentResult(null);
    } else if (entry.result) {
      setCurrentResult(entry.result);
      setCurrentExperiment(null);
    }
  };

  return (
    <div className="app-root">
      <HeroSection />
      <HowItWorks />
      <LabSection
        polygon={polygon}
        onPolygonChange={setPolygon}
        factorsPackId={factorsPackId}
        onFactorsPackChange={setFactorsPackId}
        timeWindowMinutes={timeWindowMinutes}
        onTimeWindowChange={setTimeWindowMinutes}
        selectedPresetIds={selectedPresetIds}
        onTogglePreset={togglePreset}
        result={currentResult}
        experiment={currentExperiment}
        experimentLog={experimentLog}
        onRunBaseline={handleRunBaseline}
        onRunExperiment={handleRunExperiment}
        loading={loading}
        uiError={uiError}
        onSelectExperiment={handleSelectLogEntry}
      />
    </div>
  );
}
