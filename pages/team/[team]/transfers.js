import Link from "next/link";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";

export default function TransfersPage() {
  const router = useRouter();
  const { team } = router.query;

  const teamLabel = team === "u21" ? "Hrvatska U21" : "Hrvatska NT";

  return (
    <AppLayout>
      <section className="hr-homePanel" style={{ maxWidth: 980 }}>
        <h1 className="hr-homeTitle">Transfer lista</h1>
        <p className="hr-homeSub">Tim: <b>{teamLabel}</b></p>

        <div className="hr-transferCard">
          <h2 className="hr-transferTitle">Privremeno nedostupno</h2>
          <p className="hr-transferText">
            Transfer modul je privremeno isključen. Aktivirat će se nakon dobivanja službene
            <b> CHPP licence</b> (službeni izvor podataka).
          </p>
          <p className="hr-transferNote">
            (Napomena: “scraping” izvori tipa Toxttrick ne rade pouzdano jer se transfer lista učitava dinamički.)
          </p>

          <div className="hr-transferActions">
            <Link className="hr-pill" href="/">← Natrag na naslovnicu</Link>
            <Link className="hr-pill" href={`/team/${team || "nt"}`}>Natrag na module</Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
