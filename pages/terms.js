import AppLayout from "../components/AppLayout";

export default function TermsPage() {
  return (
    <AppLayout title="Uvjeti korištenja (Terms)">
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
          Korištenjem HR U21/NT Trackera prihvaćate ove uvjete.
        </p>

        <h3 style={{ marginBottom: 6 }}>1) Namjena</h3>
        <p style={{ marginTop: 0 }}>
          Alat služi za organizaciju i praćenje reprezentativnih procesa (liste, statusi,
          bilješke, upozorenja) uz poštivanje Hattrick pravila i CHPP uvjeta (kada bude aktivno).
        </p>

        <h3 style={{ marginBottom: 6 }}>2) Zabranjeno ponašanje</h3>
        <ul style={{ marginTop: 0 }}>
          <li>pokušaj neovlaštenog pristupa podacima drugih korisnika</li>
          <li>scraping, kopiranje ili masovno preuzimanje sadržaja bez dopuštenja</li>
          <li>objava privatnih podataka (emailovi, identiteti, tajni ključevi, itd.)</li>
        </ul>

        <h3 style={{ marginBottom: 6 }}>3) Autorska prava</h3>
        <p style={{ marginTop: 0 }}>
          © {new Date().getFullYear()} HR U21/NT Tracker. <b>Sva prava pridržana.</b> Zabranjeno kopiranje,
          dijeljenje i distribucija bez pisanog dopuštenja autora.
        </p>

        <h3 style={{ marginBottom: 6 }}>4) Odricanje od odgovornosti</h3>
        <p style={{ marginTop: 0 }}>
          Alat je u razvoju. Podaci i izračuni (npr. alerti i formule) mogu biti netočni.
          Korisnik sam donosi odluke u igri.
        </p>

        <h3 style={{ marginBottom: 6 }}>5) Prekid pristupa</h3>
        <p style={{ marginTop: 0 }}>
          Administratori mogu ograničiti ili ukinuti pristup u slučaju zloupotrebe ili kršenja pravila.
        </p>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.8 }}>
          Zadnje ažuriranje: {new Date().toISOString().slice(0, 10)}
        </div>
      </div>
    </AppLayout>
  );
}
