import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { supabase } from "../../../lib/supabaseClient";

/* ---------- helpers ---------- */
const ALL_COLUMNS = {
  full_name: true,
  pos: true,
  age: true,
  ht_id: true,
  form: true,
  stamina: true,
  gk: true,
  def: true,
  pm: true,
  wing: true,
  pass: true,
  scor: true,
  sp: true,
};
const colLabels = {
  full_name: "Ime",
  pos: "Poz",
  age: "God",
  ht_id: "HTID",
  form: "Fo",
  stamina: "St",
  gk: "GK",
  def: "DE",
  pm: "PM",
  wing: "WG",
  pass: "PS",
  scor: "SC",
  sp: "SP",
};
const nrm = (v) => String(v ?? "").toLowerCase().trim();
const nnum = (v) => (v === "" || v == null ? null : Number(v));

async function rpcList(team) {
  // prefer p_team_slug, fallback team_slug
  let r = await supabase.rpc("list_team_players", { p_team_slug: team });
  if (!r.error) return r;
  return supabase.rpc("list_team_players", { team_slug: team });
}

/* ---------- sidebar ---------- */
function Sidebar({ team }) {
  const nt = team === "nt";
  const u21 = team === "u21";
  return (
    <aside className="sidebar">
      <div className="sb-card">
        <div className="sb-title">Hrvatska</div>

        <div className="sb-group">
          <div className="sb-label">Sponzori</div>
          <div className="sb-sponsor">test</div>
        </div>

        <div className="sb-group">
          <div className="sb-label">NT</div>
          <ul>
            <li><Link href="/team/nt/requests">Zahtjevi</Link></li>
            <li className="disabled">Popisi</li>
            <li className={nt ? "active" : ""}><Link href="/team/nt/players">Igrači</Link></li>
            <li className="disabled">Upozorenja</li>
            <li className="disabled">Kalendar natjecanja</li>
            <li className="disabled">Postavke treninga</li>
          </ul>
        </div>

        <div className="sb-group">
          <div className="sb-label">Hrvatska U21</div>
          <ul>
            <li><Link href="/team/u21/requests">Zahtjevi</Link></li>
            <li className="disabled">Popisi</li>
            <li className={u21 ? "active" : ""}><Link href="/team/u21/players">Igrači</Link></li>
            <li className="disabled">Upozorenja</li>
            <li className="disabled">Kalendar natjecanja</li>
            <li className="disabled">Postavke treninga</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

/* ---------- page ---------- */
export default function TeamPlayers() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  // filters
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("all");
  const [aMin, setAMin] = useState("");
  const [aMax, setAMax] = useState("");

  // extra (UI only)
  const [reqUI, setReqUI] = useState("all");
  const [persUI, setPersUI] = useState("all");

  // columns
  const [cols, setCols] = useState(ALL_COLUMNS);
  const [showCols, setShowCols] = useState(false);

  useEffect(() => {
    if (!team) return;
    setLoading(true);
    setError("");
    rpcList(team).then(({ data, error }) => {
      if (error) setError(error.message || "Greška.");
      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [team]);

  const posOptions = useMemo(() => {
    const s = new Set();
    rows.forEach(r => (r.pos || r.position) && s.add(r.pos || r.position));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = nrm(q);
    const amin = nnum(aMin), amax = nnum(aMax);
    return rows.filter(r => {
      const name = nrm(r.full_name || r.name);
      const ht = nrm(r.ht_id || r.htid);
      const p = (r.pos || r.position || "");
      const age = nnum(r.age);
      if (qq && !(`${name} ${ht} ${p}`.includes(qq))) return false;
      if (pos !== "all" && p !== pos) return false;
      if (amin != null && age != null && age < amin) return false;
      if (amax != null && age != null && age > amax) return false;
      return true;
    });
  }, [rows, q, pos, aMin, aMax]);

  const title = team === "nt" ? "Igrači – NT" : "Igrači – U21";

  return (
    <Layout>
      {/* HEADER */}
      <div className="hero">
        <div className="hero-inner">
          <h1>{title}</h1>
          <div className="hero-actions">
            <Link href={`/team/${team}/dashboard`} className="btn big">Moduli</Link>
            <Link href="/" className="btn big ghost">Naslovnica</Link>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="wrap">
        <Sidebar team={team} />

        <main className="main">
          {/* FILTERS */}
          <div className="filters">
            <select value={reqUI} onChange={e=>setReqUI(e.target.value)}>
              <option value="all">Requirement to players</option>
              <option value="x">UI placeholder</option>
            </select>
            <select value={persUI} onChange={e=>setPersUI(e.target.value)}>
              <option value="all">Personal filter</option>
              <option value="x">UI placeholder</option>
            </select>

            <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
            <select value={pos} onChange={e=>setPos(e.target.value)}>
              <option value="all">Pozicija</option>
              {posOptions.map(p=> <option key={p} value={p}>{p}</option>)}
            </select>
            <input placeholder="Age min" value={aMin} onChange={e=>setAMin(e.target.value)} />
            <input placeholder="Age max" value={aMax} onChange={e=>setAMax(e.target.value)} />
            <button className="btn" onClick={()=>{}}>Primijeni</button>
            <button className="btn ghost" onClick={()=>setShowCols(v=>!v)}>Kolone</button>
          </div>

          {showCols && (
            <div className="cols">
              {Object.keys(ALL_COLUMNS).map(k=>(
                <label key={k}>
                  <input type="checkbox" checked={!!cols[k]} onChange={()=>setCols(c=>({...c,[k]:!c[k]}))}/>
                  {colLabels[k]}
                </label>
              ))}
            </div>
          )}

          {error && <div className="err">{error}</div>}
          {loading && <div className="muted">Učitavanje…</div>}

          {/* TABLE */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {Object.keys(cols).filter(k=>cols[k]).map(k=><th key={k}>{colLabels[k]}</th>)}
                </tr>
              </thead>
              <tbody>
                {!loading && filtered.length===0 && (
                  <tr><td colSpan={20} className="muted">Nema podataka.</td></tr>
                )}
                {filtered.map(p=>{
                  const pid = p.id || p.player_id;
                  const href = pid ? `/players/${pid}?team=${team}` : "#";
                  return (
                    <tr key={`${pid||""}_${p.ht_id||""}`}>
                      {cols.full_name && <td><Link href={href}>{p.full_name||p.name||"-"}</Link></td>}
                      {cols.pos && <td>{p.pos||p.position||"-"}</td>}
                      {cols.age && <td>{p.age||"-"}</td>}
                      {cols.ht_id && <td>{p.ht_id||p.htid||"-"}</td>}
                      {cols.form && <td>{p.form||p.fo||"-"}</td>}
                      {cols.stamina && <td>{p.stamina||p.st||"-"}</td>}
                      {cols.gk && <td>{p.gk||"-"}</td>}
                      {cols.def && <td>{p.def||p.de||"-"}</td>}
                      {cols.pm && <td>{p.pm||"-"}</td>}
                      {cols.wing && <td>{p.wing||p.wg||"-"}</td>}
                      {cols.pass && <td>{p.pass||p.ps||"-"}</td>}
                      {cols.scor && <td>{p.scor||p.sc||"-"}</td>}
                      {cols.sp && <td>{p.sp||"-"}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .hero{background:linear-gradient(135deg,#0a3cff,#0bbcd6);color:#fff}
        .hero-inner{max-width:1400px;margin:0 auto;padding:18px 16px;display:flex;align-items:center;justify-content:space-between}
        .btn{background:#111;color:#fff;border:1px solid #111;border-radius:10px;padding:10px 14px;font-weight:800}
        .btn.big{padding:12px 18px}
        .btn.ghost{background:#fff;color:#111}
        .wrap{display:flex;gap:16px;max-width:1600px;margin:0 auto;padding:12px}
        .sidebar{width:260px}
        .sb-card{background:#fff;border:1px solid #e6e6e6;border-radius:12px;padding:12px}
        .sb-title{font-weight:900;margin-bottom:8px}
        .sb-label{opacity:.7;font-size:12px;margin:8px 0}
        .sb-sponsor{background:#fafafa;border:1px solid #eee;border-radius:8px;padding:8px}
        .sb-group ul{list-style:none;padding:0;margin:0}
        .sb-group li{padding:6px 8px;border-radius:8px}
        .sb-group li.active{background:#eef3ff;font-weight:800}
        .sb-group li.disabled{opacity:.4}
        .main{flex:1}
        .filters{display:flex;flex-wrap:wrap;gap:8px;background:#fff;border:1px solid #e6e6e6;border-radius:12px;padding:10px}
        .filters input,.filters select{border:1px solid #ddd;border-radius:8px;padding:9px}
        .cols{background:#fff;border:1px solid #e6e6e6;border-radius:12px;padding:10px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px}
        .table-wrap{background:#fff;border:1px solid #e6e6e6;border-radius:12px;overflow:visible;margin-top:10px}
        table{width:100%;border-collapse:collapse}
        th,td{padding:10px;border-bottom:1px solid #f0f0f0;white-space:nowrap}
        th{background:#fafafa;font-weight:900}
        .err{background:#fff2f2;border:1px solid #ffd0d0;border-radius:10px;padding:10px;margin-top:8px}
        .muted{opacity:.7;padding:8px}
      `}</style>
    </Layout>
  );
}
