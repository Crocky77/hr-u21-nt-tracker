import Link from "next/link";
import { useRouter } from "next/router";

export default function TransfersPage() {
  const router = useRouter();
  const team = router.query.team || "nt";

  return (
    <div className="page">
      <div className="page__card">
        <h1 className="page__title">Transfer lista</h1>
        <p className="page__text">
          Tim: <b>{team === "u21" ? "Hrvatska U21" : "Hrvatska NT"}</b>
        </p>

        <div className="page__actions">
          <Link href={`/team/${team}`} className="btn">
            ← Natrag na module
          </Link>
          <Link href="/" className="btn btn--ghost">
            Naslovnica
          </Link>
        </div>

        <div className="notice">
          <h3 className="notice__title">Privremeno nedostupno</h3>
          <p className="notice__text">
            Transfer modul je privremeno isključen. Aktivirat će se nakon dobivanja
            službene <b>CHPP licence</b> (službeni izvor podataka).
          </p>
        </div>

        <p className="page__hint">
          (Napomena: “scraping” izvori tipa Toxttrick ne rade pouzdano jer se transfer lista učitava dinamički.)
        </p>
      </div>
    </div>
  );
}
