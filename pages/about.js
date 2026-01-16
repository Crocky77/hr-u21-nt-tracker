// pages/about.js
import AppLayout from "../components/AppLayout";

export default function About() {
  return (
    <AppLayout
      accent="global"
      title="Hrvatski U21/NT Tracker"
      subtitle="O alatu"
    >
      <div className="hr-header hr-headerAccentGlobal">
        <div className="hr-headerRow">
          <div>
            <h2 className="hr-title" style={{ fontSize: 22, margin: 0 }}>
              O alatu
            </h2>
            <p className="hr-subtitle">
              Ovo je privatni tracker za HR U21 i HR NT selektorski tim. Trenutno je prijava preko emaila (MVP),
              a nakon CHPP licence ide prijava preko Hattrick autorizacije.
            </p>
            <p className="hr-subtitle" style={{ marginTop: 10 }}>
              U planu: CHPP sync (skillovi, sub-skillovi, forma, stamina, trening, klub info),
              trening alarmi i bilješke po skautu.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
