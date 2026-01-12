import AppLayout from "../components/AppLayout";

export default function Help() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker" subtitle="Pomoć">
      <div style={box}>
        <h2 style={{ marginTop: 0 }}>Pomoć</h2>
        <ul>
          <li>Prijava: trenutno email link (MVP).</li>
          <li>Pristup: samo odobreni korisnici u tablici <b>users</b>.</li>
          <li>Igrači: admin dodaje igrače, ostali trenutno čitaju (MVP).</li>
        </ul>
        <p style={{ opacity: 0.75 }}>
          Ako nešto ne radi, javi izborniku (ili adminu) – skupit ćemo bugove i složiti “Upozorenja” tab.
        </p>
      </div>
    </AppLayout>
  );
}
const box = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:16 };
