// pages/donate.js
import AppLayout from "../components/AppLayout";

export default function Donate() {
  return (
    <AppLayout
      accent="global"
      title="Hrvatski U21/NT Tracker"
      subtitle="Donacije"
    >
      <div className="hr-header hr-headerAccentGlobal">
        <div className="hr-headerRow">
          <div>
            <h2 className="hr-title" style={{ fontSize: 22, margin: 0 }}>
              Donacije
            </h2>
            <p className="hr-subtitle">
              Ovdje će biti info za podršku projektu. (Za sada placeholder.)
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
