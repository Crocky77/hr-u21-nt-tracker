import AppLayout from "../components/AppLayout";

export default function About() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker" subtitle="O alatu">
      <div style={box}>
        <h2 style={{ marginTop: 0 }}>O alatu</h2>
        <p>
          Ovo je privatni tracker za HR U21 i HR NT selektorski tim. Trenutno je prijava preko emaila (MVP),
          a nakon CHPP licence ide prijava preko Hattrick autorizacije.
        </p>
        <p style={{ opacity: 0.75 }}>
          U planu: CHPP sync (skillovi, sub-skillovi, forma, stamina, trening, klub info), trening alarmi i bilješke po skautu.
        </p>
      </div>
    </AppLayout>
  );
}
const box = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:16 };
