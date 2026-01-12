import AppLayout from "../components/AppLayout";

export default function Donate() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker" subtitle="Donacije">
      <div style={box}>
        <h2 style={{ marginTop: 0 }}>Donacije</h2>
        <p>
          Ovdje ćemo kasnije dodati sustav donacija (npr. “support” za troškove hostinga) i eventualne premium opcije.
        </p>
        <p style={{ opacity: 0.75 }}>
          Za V1: samo informativno – bez naplate.
        </p>
      </div>
    </AppLayout>
  );
}
const box = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:16 };
