import AppLayout from "../components/AppLayout";

export default function PrivacyPage() {
  return (
    <AppLayout title="Privatnost (Privacy Policy)">
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          padding: 16,
          lineHeight: 1.55,
        }}
      >
        <p style={{ marginTop: 0 }}>
          Ovaj projekt je u razvoju (MVP). Cilj je omogućiti praćenje hrvatskih U21/NT
          igrača uz stroga pravila privatnosti.
        </p>

        <h3 style={{ marginBottom: 6 }}>1) Što prikupljamo</h3>
        <ul style={{ marginTop: 0 }}>
          <li>
            Podatke potrebne za prijavu (Supabase Auth), npr. identifikator korisnika.
            Email se <b>ne prikazuje</b> javno u aplikaciji.
          </li>
          <li>
            Podatke koje korisnik ručno unese u tracker (npr. bilješke, statusi, liste).
          </li>
          <li>
            Kada CHPP bude aktivan: podatke samo za korisnike koji eksplicitno autoriziraju
            aplikaciju (njihovi igrači/klub), uz ograničenja vidljivosti.
          </li>
        </ul>

        <h3 style={{ marginBottom: 6 }}>2) Vidljivost i zaštita podataka</h3>
        <ul style={{ marginTop: 0 }}>
          <li>
            Neregistrirani korisnici mogu vidjeti samo javne dijelove portala (bez
            detalja i bez skillova).
          </li>
          <li>
            Registrirani korisnici vide samo ono što im dopuštaju role i pravila pristupa
            (RLS).
          </li>
          <li>
            Skillovi i osjetljivi podaci drugih managera nisu javno dostupni.
          </li>
        </ul>

        <h3 style={{ marginBottom: 6 }}>3) Kolačići (Cookies)</h3>
        <p style={{ marginTop: 0 }}>
          Aplikacija koristi tehničke kolačiće/sessions potrebne za prijavu i sigurnost.
        </p>

        <h3 style={{ marginBottom: 6 }}>4) Kontakt</h3>
        <p style={{ marginTop: 0 }}>
          Za upite oko privatnosti javite se administratoru projekta (kontakt se može
          objaviti na forumu/federaciji).
        </p>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.8 }}>
          Zadnje ažuriranje: {new Date().toISOString().slice(0, 10)}
        </div>
      </div>
    </AppLayout>
  );
}
