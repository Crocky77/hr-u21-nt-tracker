import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../lib/supabaseClient";

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [pos, setPos] = useState("all");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [compact, setCompact] = useState(true);
  const [wrap, setWrap] = useState(false);

  const [minGK, setMinGK] = useState("");
  const [minDEF, setMinDEF] = useState("");
  const [minWING, setMinWING] = useState("");
  const [minPM, setMinPM] = useState("");
  const [minPASS, setMinPASS] = useState("");
  const [minSCOR, setMinSCOR] = useState("");
  const [minSP, setMinSP] = useState("");

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
        const { data, error } = await supabase.rpc("list_team_players", {
          team_slug: team,
        });

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

        if (qq) {
          const blob = `${r.name || ""} ${r.htid || ""} ${r.position || ""}`.toLowerCase();
          if (!blob.includes(qq)) return false;
        }

        if (pos !== "all") {
          const p = String(r.position || "").toLowerCase();
          if (p !== String(pos).toLowerCase()) return false;
        }

        const a = Number(r.age || 0);
        if (ageMin !== "" && a < Number(ageMin)) return false;
        if (ageMax !== "" && a > Number(ageMax)) return false;

        if (minGK !== "" && Number(r.gk || 0) < Number(minGK)) return false;
        if (minDEF !== "" && Number(r.def || 0) < Number(minDEF)) return false;
        if (minWING !== "" && Number(r.wing || 0) < Number(minWING)) return false;
        if (minPM !== "" && Number(r.pm || 0) < Number(minPM)) return false;
        if (minPASS !== "" && Number(r.pass || 0) < Number(minPASS)) return false;
        if (minSCOR !== "" && Number(r.scor || 0) < Number(minSCOR)) return false;
        if (minSP !== "" && Number(r.sp || 0) < Number(minSP)) return false;

        return true;
      })
      .map((r, idx) => ({ ...r, __idx: idx }));
  }, [rows, q, pos, ageMin, ageMax, minGK, minDEF, minWING, minPM, minPASS, minSCOR, minSP]);

  const pageTitle = team === "u21" ? "Hrvatska U21 — Igrači" : "Hrvatska NT — Igrači";

  return (
    <AppLayout title={pageTitle} fullWidth>
      <div className="pageWrap">
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
            {/* ostatak koda ostaje 1:1 kao prije */}
            {err && <div className="err">Greška: {err}</div>}
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
