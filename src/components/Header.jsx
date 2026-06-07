import React from "react";
export default function Header() {
  return (
    <header className="header">
      <div>
        <h1>Vulcan AI</h1>
        <p>Safety-Governed FieldOps Copilot for Refinery Pump Failures</p>
      </div>
      <div className="header-right">
        <span>🎙 Voice Enabled</span>
        <span className="user">Technician</span>
      </div>
    </header>
  );
}