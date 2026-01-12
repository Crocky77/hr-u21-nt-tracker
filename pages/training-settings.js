import AppLayout from "../components/AppLayout";

export default function TrainingSettings() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker" subtitle="Postavke treninga">
      <div style={box}>
        <h2 style={{ marginTop: 0 }}>Postavke treninga</h2>
        <p>Stub (V1). Ovdje ćemo definirati “idealne profile” po pozicijama i trening formulu / očekivani rast.</p>
      </div>
    </AppLayout>
  );
}
const box = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:16 };
