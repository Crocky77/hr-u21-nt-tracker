import AppLayout from "../components/AppLayout";

export default function Requests() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker" subtitle="Zahtjevi">
      <div style={box}>
        <h2 style={{ marginTop: 0 }}>Zahtjevi</h2>
        <p>Stub (V1). Ovdje će ići: zahtjevi za praćenje igrača, zahtjevi prema skautovima, statusi izvršenja.</p>
      </div>
    </AppLayout>
  );
}
const box = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:16 };
