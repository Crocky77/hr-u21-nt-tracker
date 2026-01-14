// pages/index.js
import Link from "next/link";
import { HrHero, HrCardLink, HrCard } from "../components/HrCard";

export default function Home() {
  return (
    <div style={{ padding: "24px 16px", maxWidth: 980, margin: "0 auto" }}>
      <HrHero
        title="Hrvatski U21/NT Tracker"
        subtitle="Javni pregled alata za praćenje hrvatskih reprezentativaca (U21 i NT). Gost može vidjeti strukturu i “preview”, ali su igrači i skilovi zaključani bez prijave."
        right={
          <>
            <a href="/api/auth/login" style={btnPrimary}>
              Prijava
            </a>
            <a href="/api/auth/logout" style={btnGhost}>
              Odjava
            </a>
          </>
        }
      />

      {/* Modul: Moji igrači */}
      <div style={{ marginTop: 14 }}>
        <HrCard
          title="Moji igrači u Hrvatskom trackeru"
          subtitle="Ukoliko želiš registrirati svoj klub i igrače u tracker, klikni na gumb ispod za prijavu. Autorizacijom daješ dozvolu aplikaciji da periodično skenira tvoj klub u potrazi za talentima."
          tag={null}
        />
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/api/auth/login" style={btnPrimary}>
            Prijava
          </a>
          <div style={{ fontSize: 12, opacity: 0.75, alignSelf: "center" }}>
            (CHPP spajanje dolazi kasnije — sada pripremamo UI + DB)
          </div>
        </div>
      </div>

      {/* U21 / NT kartice: klik na cijelu karticu */}
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <HrCardLink
          title="Hrvatska U21"
          subtitle="Pregled modula (preview). Igrači i skilovi su zaključani bez prijave."
          tag="Preview"
          href="/team/u21"
        />
        <HrCardLink
          title="Hrvatska NT"
          subtitle="Pregled modula (preview). Igrači i skilovi su zaključani bez prijave."
          tag="Preview"
          href="/team/nt"
        />
      </div>

      {/* Footer links - kontrast */}
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

      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.92)" }}>
        Napomena: u V1 gost vidi “preview” dashboarda, ali sve stranice koje prikazuju igrače/skilove traže prijavu.
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
  textDecoration: "none",
};

const btnGhost = {
  display: "inline-block",
  background: "rgba(255,255,255,0.60)",
  color: "#111",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 800,
  border: "1px solid rgba(0,0,0,0.18)",
  textDecoration: "none",
};

const footerLink = {
  color: "rgba(255,255,255,0.95)",
  fontWeight: 900,
  textDecoration: "underline",
};
