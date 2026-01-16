import Link from "next/link";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";

export default function TeamDashboard() {
  const router = useRouter();
  const team = String(router.query.team || "").toLowerCase();
  const title = team === "nt" ? "Dashboard – NT" : "Dashboard – U21";

  return (
    <AppLayout>
      <div className="card headerCard">
        <div className="row">
          <div>
            <div style={{ fontWeight: 800, color: "#6b7280", fontSize: 12 }}>HR Tracker</div>
            <h1 className="h1" style={{ fontSize: 34 }}>{title}</h1>
            <p className="p">Svi moduli dostupni (ovisno o roli).</p>
          </div>
          <div className="actions">
            <Link className="btn" href="/">Naslovna</Link>
            <button className="btn btnPrimary" type="button" onClick={() => router.replace(router.asPath)}>
              Osvježi
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="grid2">
        <div className="card tile">
          <h3 className="tileTitle">Zahtjevi</h3>
          <p className="tileText">Pretraživanje baze po kriterijima i dodavanje u liste.</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/zahtjevi`}>Otvori →</Link>
          </div>
        </div>

        <div className="card tile">
          <h3 className="tileTitle">Popisi (Liste)</h3>
          <p className="tileText">Organiziraj igrače po listama: DEF/IM/WING/FWD…</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/liste`}>Otvori →</Link>
          </div>
        </div>

        <div className="card tile">
          <h3 className="tileTitle">Igrači</h3>
          <p className="tileText">Lista igrača + detalji profila, snapshotovi, bilješke.</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/players`}>Otvori →</Link>
          </div>
        </div>

        <div className="card tile">
          <h3 className="tileTitle">Upozorenja</h3>
          <p className="tileText">Crveni karton, ozljede, krivi trening/stamina (skeleton).</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/alerts`}>Otvori →</Link>
          </div>
        </div>

        <div className="card tile">
          <h3 className="tileTitle">Kalendar natjecanja</h3>
          <p className="tileText">Pregled ciklusa i datuma (Euro / SP / Kup nacija).</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/calendar`}>Otvori →</Link>
          </div>
        </div>

        <div className="card tile">
          <h3 className="tileTitle">Postavke treninga</h3>
          <p className="tileText">Ciljevi treninga po poziciji i procjena odstupanja (skeleton).</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/training`}>Otvori →</Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
