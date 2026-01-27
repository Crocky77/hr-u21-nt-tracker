import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import TrackerSidebar from "../../../components/TrackerSidebar";
import { supabase } from "../../../lib/supabaseClient";

// NOTE: This file intentionally contains UI + data logic for Players page.
// We are currently standardizing the LEFT MENU. Player table fixes come after menu is finished.

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query; // slug: "nt" or "u21"

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  // filters
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("all");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [compact, setCompact] = useState(true);
  const [wrap, setWrap] = useState(false);

  // min skills
  const [minGK, setMinGK] = useState("");
  const [minDEF, setMinDEF] = useState("");
  const [minWING, setMinWING] = useState("");
  const [minPM, setMinPM] = useState("");
  const [minPASS, setMinPASS] = useState("");
  const [minSCOR, setMinSCOR] = useState("");
  const [minSP, setMinSP] = useState("");

  // columns picker
  const [showColumns, setShowColumns] = useState(false);
  const defaultColumns = useMemo(
    () => ({
      name: true,
      htid: true,
      speciality: true,
      gk: true,
      def: true,
      wing: true,
      pm: true,
      pass: true,
      scor: true,
      sp: true,
      pos: true,
      age: true,
      form: false,
      stamina: false,
      tsi: false,
      salary: false,
      agree: false,
      agg: false,
      hon: false,
      lead: false,
      xp: false,
      stp: false,
      updated: false,
      tr: false,
      last_tr: false,
      club: false,
    }),
    []
  );
  const [cols, setCols] = useState(defaultColumns);

  useEffect(() => {
    if (!team) return;

    let alive = true;
    setLoading(true);
    setErr("");

    const run = async () => {
      try {
        // expects RPC: public.list_team_players(team_slug)
        const { data, error } = await supabase.rpc("list_team_players", { team_slug: team });

        if (error) throw error;
        if (!alive) return;

        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || String(e));
        setRows([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [team]);

  const totalCount = rows?.length || 0;

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return (rows || [])
      .filter((r) => {
        if (!r) return false;

        // text search
        if (qq) {
          const blob = `${r.name || ""} ${r.htid || ""} ${r.position || ""}`.toLowerCase();
          if (!blob.includes(qq)) return false;
        }

        // position filter
        if (pos !== "all") {
          const p = String(r.position || "").toLowerCase();
          if (p !== String(pos).toLowerCase()) return false;
        }

        // age filter
        const a = Number(r.age || 0);
        if (ageMin !== "" && a < Number(ageMin)) return false;
        if (ageMax !== "" && a > Number(ageMax)) return false;

        // min skills
        const gk = Number(r.gk || 0);
        const df = Number(r.def || 0);
        const wg = Number(r.wing || 0);
        const pmv = Number(r.pm || 0);
        const pas = Number(r.pass || 0);
        const sco = Number(r.scor || 0);
        const spv = Number(r.sp || 0);

        if (minGK !== "" && gk < Number(minGK)) return false;
        if (minDEF !== "" && df < Number(minDEF)) return false;
        if (minWING !== "" && wg < Number(minWING)) return false;
        if (minPM !== "" && pmv < Number(minPM)) return false;
        if (minPASS !== "" && pas < Number(minPASS)) return false;
        if (minSCOR !== "" && sco < Number(minSCOR)) return false;
        if (minSP !== "" && spv < Number(minSP)) return false;

        return true;
      })
      .map((r, idx) => ({ ...r, __idx: idx }));
  }, [rows, q, pos, ageMin, ageMax, minGK, minDEF, minWING, minPM, minPASS, minSCOR, minSP]);

  const onApply = () => {
    // the UI is already live-filtering; keep button for UX parity
  };

  const teamTitle = team === "u21" ? "Hrvatska U21" : "Hrvatska NT";
  const pageTitle = `${teamTitle} — Igrači`;

  return (
    <AppLayout title={pageTitle} fullWidth>
      <div className="pageWrap">
        {/* LEFT MENU (shared component, same on every module) */}
        <aside className="sidebarWrap">
          <TrackerSidebar />
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="headerRow">
            <h1 className="h1">Moduli</h1>
            <div className="count">Ukupno: {totalCount}</div>
            <div className="toggles">
              <label>
                <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /> Kompaktno
              </label>
              <label>
                <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} /> Wrap
              </label>
            </div>
          </div>

          <section className="card">
            <div className="filtersTop">
              <select className="control" defaultValue="Requirement to players">
                <option>Requirement to players</option>
              </select>

              <select className="control" defaultValue="Personal filter">
                <option>Personal filter</option>
              </select>

              <select className="control" defaultValue="Speciality (all)">
                <option>Speciality (all)</option>
              </select>

              <select className="control" defaultValue="Agreeability">
                <option>Agreeability</option>
              </select>

              <select className="control" defaultValue="Aggressiveness">
                <option>Aggressiveness</option>
              </select>

              <select className="control" defaultValue="Honesty">
                <option>Honesty</option>
              </select>
            </div>

            <div className="filtersMid">
              <input
                className="control wide"
                placeholder="Search: ime / HTID / pozicija..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <select className="control" value={pos} onChange={(e) => setPos(e.target.value)}>
                <option value="all">Pozicija (sve)</option>
                <option value="w">W</option>
              </select>

              <input className="control" placeholder="Age min" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
              <input className="control" placeholder="Age max" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
            </div>

            <div className="minSkills">
              <div className="label">Min skilovi</div>
              <input className="minIn" placeholder="GK" value={minGK} onChange={(e) => setMinGK(e.target.value)} />
              <input className="minIn" placeholder="DEF" value={minDEF} onChange={(e) => setMinDEF(e.target.value)} />
              <input className="minIn" placeholder="WING" value={minWING} onChange={(e) => setMinWING(e.target.value)} />
              <input className="minIn" placeholder="PM" value={minPM} onChange={(e) => setMinPM(e.target.value)} />
              <input className="minIn" placeholder="PASS" value={minPASS} onChange={(e) => setMinPASS(e.target.value)} />
              <input className="minIn" placeholder="SCOR" value={minSCOR} onChange={(e) => setMinSCOR(e.target.value)} />
              <input className="minIn" placeholder="SP" value={minSP} onChange={(e) => setMinSP(e.target.value)} />
              <button className="btn" onClick={onApply}>
                Primijeni
              </button>
              <button className="btnGhost" onClick={() => setShowColumns((v) => !v)}>
                Kolone
              </button>
            </div>

            {showColumns && (
              <div className="colsBox">
                <div className="colsTitle">Odaberi kolone (Portal-style, gdje nema podatka prikazuje “—”)</div>
                <div className="colsGrid">
                  {Object.keys(cols).map((k) => (
                    <label key={k} className="colChk">
                      <input
                        type="checkbox"
                        checked={!!cols[k]}
                        onChange={(e) => setCols((prev) => ({ ...prev, [k]: e.target.checked }))}
                      />
                      <span>{k}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="tableWrap">
              {err ? (
                <div className="err">Greška: {err}</div>
              ) : loading ? (
                <div className="loading">Učitavanje...</div>
              ) : (
                <table className={`table ${compact ? "compact" : ""} ${wrap ? "wrap" : ""}`}>
                  <thead>
                    <tr>
                      {cols.name && <th>Ime</th>}
                      {cols.htid && <th>HTID</th>}
                      {cols.speciality && <th>Specka</th>}
                      {cols.gk && <th>GK</th>}
                      {cols.def && <th>DEF</th>}
                      {cols.wing && <th>WING</th>}
                      {cols.pm && <th>PM</th>}
                      {cols.pass && <th>PASS</th>}
                      {cols.scor && <th>SCOR</th>}
                      {cols.sp && <th>SP</th>}
                      {cols.pos && <th>Poz</th>}
                      {cols.age && <th>Age</th>}
                      {cols.form && <th>Forma</th>}
                      {cols.stamina && <th>Stamina</th>}
                      {cols.tsi && <th>TSI</th>}
                      {cols.salary && <th>Plaća</th>}
                      {cols.agree && <th>Agree</th>}
                      {cols.agg && <th>Agr</th>}
                      {cols.hon && <th>Hon</th>}
                      {cols.lead && <th>Lead</th>}
                      {cols.xp && <th>XP</th>}
                      {cols.stp && <th>St %</th>}
                      {cols.tr && <th>TR</th>}
                      {cols.last_tr && <th>Last TR</th>}
                      {cols.club && <th>Klub</th>}
                      {cols.updated && <th>Updated</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={`${r.htid || "x"}-${r.__idx}`}>
                        {cols.name && <td className="tdName">{r.name ?? "—"}</td>}
                        {cols.htid && <td>{r.htid ?? "—"}</td>}
                        {cols.speciality && <td>{r.speciality ?? "—"}</td>}
                        {cols.gk && <td>{r.gk ?? "—"}</td>}
                        {cols.def && <td>{r.def ?? "—"}</td>}
                        {cols.wing && <td>{r.wing ?? "—"}</td>}
                        {cols.pm && <td>{r.pm ?? "—"}</td>}
                        {cols.pass && <td>{r.pass ?? "—"}</td>}
                        {cols.scor && <td>{r.scor ?? "—"}</td>}
                        {cols.sp && <td>{r.sp ?? "—"}</td>}
                        {cols.pos && <td>{r.position ?? "—"}</td>}
                        {cols.age && <td>{r.age ?? "—"}</td>}
                        {cols.form && <td>{r.form ?? "—"}</td>}
                        {cols.stamina && <td>{r.stamina ?? "—"}</td>}
                        {cols.tsi && <td>{r.tsi ?? "—"}</td>}
                        {cols.salary && <td>{r.salary ?? "—"}</td>}
                        {cols.agree && <td>{r.agreeability ?? "—"}</td>}
                        {cols.agg && <td>{r.aggressiveness ?? "—"}</td>}
                        {cols.hon && <td>{r.honesty ?? "—"}</td>}
                        {cols.lead && <td>{r.leadership ?? "—"}</td>}
                        {cols.xp && <td>{r.experience ?? "—"}</td>}
                        {cols.stp && <td>{r.st_percent ?? "—"}</td>}
                        {cols.tr && <td>{r.current_training ?? "—"}</td>}
                        {cols.last_tr && <td>{r.last_training ?? "—"}</td>}
                        {cols.club && <td>{r.club ?? "—"}</td>}
                        {cols.updated && <td>{r.updated_at ?? "—"}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        .pageWrap{
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 18px;
          align-items: start;
          padding: 18px;
        }

        .sidebarWrap{
          position: sticky;
          top: 12px;
          align-self: start;
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 12px;
          backdrop-filter: blur(10px);
        }

        .sbTeam{
          font-weight: 900;
          font-size: 16px;
          margin-bottom: 6px;
          color: #111;
        }

        .sbSectionHeader{
          margin: 10px 0 6px;
          padding: 6px 10px;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #fff;
          background: #111827;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          width: 100%;
          box-sizing: border-box;
        }

        .sbSectionHeaderSmall{
          font-size: 11px;
          padding: 6px 10px;
          margin-top: 8px;
          margin-bottom: 6px;
          background: #1f2937;
        }

        .sbSponsor {
          font-size: 13px;
          padding: 6px 8px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px;
          color: #111;
          margin-bottom: 8px;
        }

        .sbNav{
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 8px;
        }
        .sbNav a{
          text-decoration: none;
          color: #111;
          padding: 6px 8px;
          border-radius: 10px;
          border: 1px solid transparent;
        }
        .sbNav a:hover{
          background: rgba(0,0,0,0.04);
          border-color: rgba(0,0,0,0.06);
        }
        .sbNav a.active{
          background: rgba(17,24,39,0.08);
          border-color: rgba(17,24,39,0.18);
          font-weight: 700;
        }

        .sbNote{
          font-size: 11px;
          color: rgba(0,0,0,0.55);
          margin-top: 10px;
        }

        .main{
          min-width: 0;
        }

        .headerRow{
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .h1{
          margin: 0;
          font-size: 22px;
          font-weight: 900;
        }
        .count{
          font-size: 13px;
          color: rgba(0,0,0,0.6);
          font-weight: 700;
        }
        .toggles{
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: rgba(0,0,0,0.75);
          align-items: center;
        }
        .toggles label{
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .card{
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 12px;
          backdrop-filter: blur(10px);
        }

        .filtersTop{
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 10px;
        }
        .filtersMid{
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }

        .control{
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.8);
          outline: none;
          font-size: 13px;
        }
        .wide{
          width: 100%;
        }

        .minSkills{
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 6px;
          padding-bottom: 10px;
          border-top: 1px solid rgba(0,0,0,0.06);
        }
        .label{
          font-weight: 800;
          color: rgba(0,0,0,0.75);
          margin-right: 8px;
        }
        .minIn{
          width: 86px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.8);
          outline: none;
          font-size: 13px;
        }
        .btn{
          margin-left: 6px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.16);
          background: #111;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }
        .btnGhost{
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.16);
          background: rgba(255,255,255,0.85);
          color: #111;
          font-weight: 800;
          cursor: pointer;
        }

        .colsBox{
          margin-top: 10px;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          padding: 10px;
          background: rgba(255,255,255,0.7);
        }
        .colsTitle{
          font-weight: 800;
          margin-bottom: 8px;
          color: rgba(0,0,0,0.75);
        }
        .colsGrid{
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }
        .colChk{
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(0,0,0,0.8);
        }

        .tableWrap{
          margin-top: 10px;
          overflow: auto;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.75);
        }
        .table{
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        th, td{
          padding: 10px 10px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          text-align: left;
          white-space: nowrap;
        }
        .table.wrap th, .table.wrap td{
          white-space: normal;
        }
        th{
          position: sticky;
          top: 0;
          background: rgba(255,255,255,0.9);
          z-index: 1;
          font-weight: 900;
        }
        .table.compact th, .table.compact td{
          padding: 7px 10px;
        }
        .tdName{
          font-weight: 800;
          color: #111;
        }

        .err{
          padding: 10px 12px;
          color: #7f1d1d;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.24);
          border-radius: 12px;
          margin: 10px;
          font-weight: 700;
        }
        .loading{
          padding: 14px;
          color: rgba(0,0,0,0.65);
        }

        @media (max-width: 1100px){
          .filtersTop{
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .colsGrid{
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 900px){
          .pageWrap{
            grid-template-columns: 1fr;
          }
          .sidebarWrap{
            position: relative;
            top: 0;
          }
          .filtersMid{
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}
