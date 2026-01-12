import AppLayout from "../components/AppLayout";

export default function Lists() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker" subtitle="Popisi">
      <div style={box}>
        <h2 style={{ marginTop: 0 }}>Popisi</h2>
        <p>Stub (V1). Ovdje će ići liste (core/rotation/watch), shortlist, longlist, itd.</p>
      </div>
    </AppLayout>
  );
}
const box = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:16 };
