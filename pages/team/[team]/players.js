import Link from "next/link";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";

export default function PlayersPage() {
  const router = useRouter();
  const team = String(router.query.team || "").toLowerCase();
  const title = team === "nt" ? "Igrači – NT" : "Igrači – U21";

  // NOTE: OVDJE kasnije vratiš svoje postojeće supabase fetchove.
  // Ja sada dajem čisti UI + link fix (da ne vodi na /dashboard).
  const demoRows = team === "nt"
    ? [
        { name: "Alan Andrović", pos: "W", status: "watch", ht: "453285255" },
        { name: "Bruno Novosel", pos: "IM", status: "watch", ht: "777888" },
      ]
    : [
        { name: "Ante Antić", pos: "DEF", status: "rotation", ht: "—" },
        { name: "Ivan Horvat", pos: "IM", status: "core", ht: "—" },
      ];

  return (
    <AppLayout>
      <div className="card headerCard">
        <div className="row">
          <div>
            <h1 className="h1" style={{ fontSize: 34 }}>{title}</h1>
            <p className="p">Search i tablica moraju biti čitljivi. Background nema ovdje.</p>
          </div>
          <div className="actions">
            <button className="btn" type="button" onClick={() => router.replace(router.asPath)}>Osvježi</button>
            <Link className="btn btnPrimary" href={`/team/${team}/dashboard`}>Dashboard</Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <input className="input" placeholder="Search: ime, HT ID, pozicija, status..." />
      </div>

      <div style={{ marginTop: 12 }} className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Ime</th>
              <th>Poz</th>
              <th>Status</th>
              <th>HT ID</th>
              <th>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {demoRows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.pos}</td>
                <td>{r.status}</td>
                <td>{r.ht}</td>
                <td><span className="link" style={{ cursor: "pointer" }}>Detalji →</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
