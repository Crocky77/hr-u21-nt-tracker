import AppLayout from "../components/AppLayout";

export default function Clubs() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker" subtitle="Klubovi">
      <div style={box}>
        <h2 style={{ marginTop: 0 }}>Klubovi</h2>
        <p>Stub (V1). Kasnije: trener lvl, asistenti, osoblje, fokus treninga (iz CHPP), liga info, itd.</p>
      </div>
    </AppLayout>
  );
}
const box = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:16 };
