import Link from "next/link";

export default function MyPlayers() {
  return (
    <div className="page">
      <div className="page__card">
        <h1 className="page__title">Moji igrači</h1>
        <p className="page__text">
          Ovdje će biti tvoja privatna stranica s igračima nakon CHPP prijave.
        </p>

        <p className="page__text">
          <b>Kako će raditi (koncept):</b>
        </p>
        <ul className="page__list">
          <li>Klikneš “Prijava (CHPP)”</li>
          <li>Tracker preko CHPP-a učita tvoje igrače u bazu</li>
          <li>Otvori se tvoja privatna lista igrača (samo tebi vidljiva)</li>
        </ul>

        <div className="page__actions">
          <button className="btn btn--ghost" disabled>
            Prijava (CHPP) — uskoro
          </button>
          <Link href="/" className="btn">
            ← Nazad na naslovnicu
          </Link>
        </div>
      </div>
    </div>
  );
}
