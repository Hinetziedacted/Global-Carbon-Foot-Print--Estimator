import React from 'react';

interface ScenarioControlsProps {
  values: {
    evShareDelta: number;
    urbanSpeedDeltaKmh: number;
    shortHaulFlightReduction: number;
  };
  onChange: (newValues: ScenarioControlsProps['values']) => void;
}

const ScenarioControls: React.FC<ScenarioControlsProps> = ({ values, onChange }) => {
  const handleChange = (field: keyof ScenarioControlsProps['values'], value: number) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="slider-group">
      <h3 className="card-title" style={{fontSize: '1rem', marginBottom: '1.5rem'}}>Scenario Controls (Optional)</h3>
      
      <div>
        <label className="slider-label">
          <span>EV Share Change</span>
          <span>{values.evShareDelta > 0 ? '+' : ''}{(values.evShareDelta * 100).toFixed(0)}%</span>
        </label>
        <input 
          type="range" 
          min="-0.2" 
          max="0.4" 
          step="0.05"
          value={values.evShareDelta}
          onChange={e => handleChange('evShareDelta', parseFloat(e.target.value))}
        />
      </div>

      <div style={{marginTop: '1.25rem'}}>
        <label className="slider-label">
          <span>Urban Speed Change</span>
          <span>{values.urbanSpeedDeltaKmh > 0 ? '+' : ''}{values.urbanSpeedDeltaKmh.toFixed(0)} km/h</span>
        </label>
        <input 
          type="range" 
          min="-20" 
          max="10" 
          step="2"
          value={values.urbanSpeedDeltaKmh}
          onChange={e => handleChange('urbanSpeedDeltaKmh', parseInt(e.target.value, 10))}
        />
      </div>

      <div style={{marginTop: '1.25rem'}}>
        <label className="slider-label">
          <span>Short-Haul Flights Removed</span>
          <span>{(values.shortHaulFlightReduction * 100).toFixed(0)}%</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="0.5" 
          step="0.05"
          value={values.shortHaulFlightReduction}
          onChange={e => handleChange('shortHaulFlightReduction', parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default ScenarioControls;
