import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="hero-inner">
        <div className="hero-title-row">
          <span className="hero-label">ZONE EMISSIONS LAB</span>
          <span className="hero-pill">Physics Engine · Research Draft</span>
        </div>

        <h1 className="hero-heading">
          Where you see a city, <br />
          we see <span className="hero-accent">real-time carbon math</span>.
        </h1>

        <p className="hero-subtitle">
          Draw any zone on the planet. We pull traffic, fleets and aviation,
          run them through a COPERT-style physics core, and give you a
          research-grade CO₂ snapshot with uncertainty bands.
        </p>

        <div className="hero-meta-row">
          <div className="hero-meta-item">
            <span className="hero-meta-label">Engine</span>
            <span className="hero-meta-value">Speed curves · Grade · HVAC</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Resolution</span>
            <span className="hero-meta-value">Zone-level · 60-min window</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Uncertainty</span>
            <span className="hero-meta-value">Module-aware Q1–Q3 bands</span>
          </div>
        </div>

        <button
          className="hero-cta"
          onClick={() => {
            const el = document.getElementById("lab-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Open the lab
        </button>
      </div>
    </section>
  );
};
