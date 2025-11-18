// components/InputForm.tsx
import React from "react";

interface InputFormProps {
  factorsPackId: string;
  timeWindowMinutes: number;
  onFactorsPackChange: (id: string) => void;
  onTimeWindowChange: (minutes: number) => void;
  onRunBaseline: () => void;
  loading: boolean;
  uiError: string | null;
}

export const InputForm: React.FC<InputFormProps> = ({
  factorsPackId,
  timeWindowMinutes,
  onFactorsPackChange,
  onTimeWindowChange,
  onRunBaseline,
  loading,
  uiError,
}) => {
  return (
    <div className="input-form">
      {/* your existing inputs for factorsPackId + timeWindowMinutes */}

      <button
        type="button"
        className="run-button"
        onClick={onRunBaseline}
        disabled={loading}
      >
        Run baseline only
      </button>

      {uiError && (
        <div className="run-error">
          {uiError}
        </div>
      )}
    </div>
  );
};
