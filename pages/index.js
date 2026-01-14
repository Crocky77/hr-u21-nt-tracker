// pages/index.js
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "24px 16px", maxWidth: 980, margin: "0 auto" }}>
      {/* HERO */}
      <div
        style={{
          background: "rgba(255,255,255,0.90)",
          border: "1px solid rgba(0,0,0,0.14)",
          borderRadius: 14,
          padding: 18,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background:
              "linear-gradient(135deg, rgba(190,0,0,0.9), rgba(255,255,255,0.9))",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
          aria-hidden="true"
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.1 }}>
            Hrvatski U21/NT Tracker
          </div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Javni pregled alata za praćenje hrvatskih reprezentativaca (U21 i NT).
            Gost može vidjeti strukturu i “preview”, ali su igrači i skilovi
            zaključani bez prijave.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="/api/auth/login"
            style={btnPrimary}
            aria-label="Prijava"
          >
            Prijava
          </a>
          <a
            href="/api/auth/logout"
            style={btnGhost}
            aria-label="Odjava"
          >
            Odjava
          </a>
        </div>
      </div>

      {/* MODULE A: Moji igrači */}
      <div
        style={{
          marginTop: 14,
          background: "rgba(255,255,255,0.88)",
          border: "1px solid rgba(0,0,0,0.14)",
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900 }}>
          Moji igrači u Hrvatskom trackeru
        </div>

        <div style={{ opacity: 0.78, marginTop: 8, lineHeight: 1.35 }}>
          Ukoliko želiš registrirati svoj klub i igrače u tracker, klikni na gumb
          ispod za prijavu. Autorizacijom daješ dozvolu aplikaciji da periodično
          skenira tvoj klub u potrazi za talentima.
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/api/auth/login" style={btnPrimary}>
            Prijava
          </a>
          <div style={{ fontSize: 12, opacity: 0.7, alignSelf: "center" }}>
            (CHPP spajanje dolazi kasnije — sada pripremamo UI + DB)
          </div>
        </div>
      </div>

      {/* U21 / NT cards */}
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <TeamCard title="Hrvatska U21" href="/team/u21" />
        <TeamCard title="Hrvatska NT" href="/team/nt" />
      </div>

      {/* Footer links - visoki kontrast */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/about" style={footerLink}>
          O alatu →
        </Link>
        <Link href="/help" style={footerLink}>
          Pomoć →
        </Link>
        <Link href="/donacije" style={footerLink}>
          Donacije →
        </Link>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.9)" }}>
        Napomena: u V1 gost vidi “preview” dashboarda, ali sve stranice koje prikazuju
        igrače/skilove traže prijavu.
      </div>
    </div>
  );
}

function TeamCard({ title, href }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(0,0,0,0.14)",
        borderRadius: 14,
        padding: 16,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          fontSize: 12,
          padding: "5px 10px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.12)",
          opacity: 0.9,
        }}
      >
        Preview
      </div>

      <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
      <div style={{ opacity: 0.75, marginTop: 8 }}>
        Pregled modula (preview). Igrači i skilovi su zaključani bez prijave.
      </div>

      <div style={{ marginTop: 12 }}>
        <Link href={href} style={openLink}>
          Otvori →
        </Link>
      </div>
    </div>
  );
}

const btnPrimary = {
  display: "inline-block",
  background: "rgba(0,0,0,0.88)",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 800,
  border: "1px solid rgba(0,0,0,0.25)",
};

const btnGhost = {
  display: "inline-block",
  background: "rgba(255,255,255,0.60)",
  color: "#111",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 800,
  border: "1px solid rgba(0,0,0,0.18)",
};

const openLink = {
  display: "inline-block",
  fontWeight: 900,
  textDecoration: "underline",
};

const footerLink = {
  color: "rgba(255,255,255,0.95)",
  fontWeight: 900,
  textDecoration: "underline",
};
