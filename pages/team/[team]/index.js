import Link from "next/link";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";

export default function TeamHome() {
  const router = useRouter();
  const team = String(router.query.team || "").toLowerCase();
  const title = team === "nt" ? "Hrvatska NT" : "Hrvatska U21";

  return (
    <AppLayout>
      <div className="card headerCard">
        <div className="row">
          <div>
            <h1 className="h1" style={{ fontSize: 32 }}>{title}</h1>
            <p className="p">
              Pregled modula. Igrači i skillovi su zaključani bez prijave (preview).
            </p>
          </div>
          <div className="actions">
            <Link className="btn" href="/">← Natrag na naslovnicu</Link>
            <Link className="btn btnPrimary" href={`/team/${team}/dashboard`}>Dashboard</Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="grid2">
        <div className="card tile">
          <div className="tileFooter" style={{ marginTop: 0 }}>
            <h3 className="tileTitle">Zahtjevi</h3>
            <span className="badge">Otvoreno</span>
          </div>
          <p className="tileText">Filter builder + spremanje upita + “dodaj u listu”.</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/zahtjevi`}>Otvori →</Link>
          </div>
        </div>

        <div className="card tile">
          <div className="tileFooter" style={{ marginTop: 0 }}>
            <h3 className="tileTitle">Popisi (Liste)</h3>
            <span className="badge">Otvoreno</span>
          </div>
          <p className="tileText">Organiziraj igrače po listama: DEF/IM/WING/FWD…</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/liste`}>Otvori →</Link>
          </div>
        </div>

        <div className="card tile">
          <div className="tileFooter" style={{ marginTop: 0 }}>
            <h3 className="tileTitle">Igrači</h3>
            <span className="badge">Otvoreno</span>
          </div>
          <p className="tileText">Lista igrača + detalji profila, snapshotovi, bilješke.</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/players`}>Otvori →</Link>
          </div>
        </div>

        <div className="card tile">
          <div className="tileFooter" style={{ marginTop: 0 }}>
            <h3 className="tileTitle">Upozorenja</h3>
            <span className="badge">Otvoreno</span>
          </div>
          <p className="tileText">Crveni karton, ozljede, krivi trening/stamina (skeleton).</p>
          <div className="tileFooter">
            <span />
            <Link className="link" href={`/team/${team}/alerts`}>Otvori →</Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
