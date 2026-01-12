import AppLayout from "../components/AppLayout";

export default function Alerts() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker" subtitle="Upozorenja">
      <div style={box}>
        <h2 style={{ marginTop: 0 }}>Upozorenja</h2>
        <p>
          Skeleton (V1). Ovdje ćemo ubaciti trening alarmi / stagnacija / odstupanje od idealnog treninga,
          te U21 “izlazi uskoro” / “ispao”.
        </p>
      </div>
    </AppLayout>
  );
}
const box = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:16 };
