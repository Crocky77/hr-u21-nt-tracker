// pages/help.js
import AppLayout from "../components/AppLayout";

export default function Help() {
  return (
    <AppLayout
      accent="global"
      title="Hrvatski U21/NT Tracker"
      subtitle="Pomoć"
    >
      <div className="hr-header hr-headerAccentGlobal">
        <div className="hr-headerRow">
          <div>
            <h2 className="hr-title" style={{ fontSize: 22, margin: 0 }}>
              Pomoć
            </h2>
            <p className="hr-subtitle">
              V1 je fokusiran na stabilnost i team-based routing. CHPP dolazi kasnije.
            </p>
            <p className="hr-subtitle" style={{ marginTop: 10 }}>
              Ako nešto nije klikabilno ili je “razbijen” layout, pošalji screenshot + URL.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
