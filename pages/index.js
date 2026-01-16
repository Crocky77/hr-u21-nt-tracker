import Link from "next/link";
import AppLayout from "../components/AppLayout";

export default function Home() {
  return (
    <AppLayout variant="home">
      <div className="card headerCard" style={{ maxWidth: 980, margin: "16px auto 14px" }}>
        <div className="row">
          <div>
            <h1 className="h1">Hrvatski U21/NT Tracker</h1>
            <p className="p">
              Javni pregled strukture i “preview”. Igrači i skillovi su zaključani bez prijave.
            </p>
          </div>

          <div className="actions">
            {/* Ovdje ostavi svoje postojeće auth gumbe ako ih imaš drugdje.
                Za sada: samo linkovi na timove */}
            <Link className="btn" href="/team/u21">Hrvatska U21</Link>
            <Link className="btn" href="/team/nt">Hrvatska NT</Link>
          </div>
        </div>
      </div>

      <div className="card headerCard" style={{ maxWidth: 980, margin: "0 auto 14px" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Moji igrači u Hrvatskom trackeru</h2>
        <p className="p" style={{ marginTop: 6 }}>
          CHPP spajanje dolazi kasnije. Za sada pripremamo UI + DB za “moji igrači” u globalnom trackeru.
        </p>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" type="button" disabled>
            Prijava (CHPP kasnije)
          </button>
        </div>
      </div>

      {/* Manji, pregledniji “widgeti” */}
      <div style={{ maxWidth: 980, margin: "0 auto" }} className="grid2">
        <div className="card tile">
          <div className="tileFooter" style={{ marginTop: 0 }}>
            <h3 className="tileTitle">Hrvatska U21</h3>
            <span className="badge">Preview</span>
          </div>
          <p className="tileText">
            Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
          </p>
          <div className="tileFooter">
            <span className="tileText" style={{ margin: 0 }} />
            <Link className="link" href="/team/u21">
              Otvori →
            </Link>
          </div>
        </div>

        <div className="card tile">
          <div className="tileFooter" style={{ marginTop: 0 }}>
            <h3 className="tileTitle">Hrvatska NT</h3>
            <span className="badge">Preview</span>
          </div>
          <p className="tileText">
            Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
          </p>
          <div className="tileFooter">
            <span className="tileText" style={{ margin: 0 }} />
            <Link className="link" href="/team/nt">
              Otvori →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
