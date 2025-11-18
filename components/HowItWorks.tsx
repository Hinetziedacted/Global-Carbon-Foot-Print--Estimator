import React from "react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      label: "01 · Zone & data",
      text: "User draws a polygon. We resolve roads, airports and fleet factors for that region.",
    },
    {
      label: "02 · Physics core",
      text: "Speed curves, grade, HVAC and grid intensity feed a COPERT-style fuel model.",
    },
    {
      label: "03 · Scenario lab",
      text: "Policy levers tweak EV share, speeds and flights, re-running the same deterministic engine.",
    },
    {
      label: "04 · Uncertainty bands",
      text: "Module-aware Q-flags build a composition-weighted CO₂e band for each scenario.",
    },
  ];

  return (
    <section className="how">
      <div className="how-inner">
        <h2>How the engine works</h2>
        <p className="how-tagline">
          Not a black box. A chain of physics-based steps you can defend in a methods section.
        </p>
        <div className="how-grid">
          {steps.map((s) => (
            <div key={s.label} className="how-card">
              <span className="how-label">{s.label}</span>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
