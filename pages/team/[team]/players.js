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

  const [compact, setCompact] = useState(true);
  const [wrap, setWrap] = useState(false);

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

  return (
    <AppLayout>
      <div className="page">
        <div className="pageHeader">
          <h1>Moduli</h1>

          <div className="pageHeaderRight">
            <div>Ukupno: {rows.length}</div>

            <label>
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
              />{" "}
              Kompaktno
            </label>

            <label>
              <input
                type="checkbox"
                checked={wrap}
                onChange={(e) => setWrap(e.target.checked)}
              />{" "}
              Wrap
            </label>
          </div>
        </div>

        <div className="pageContent">
          {err && (
            <div className="err">
              Greška: {err}
            </div>
          )}

          {!err && loading && <div>Učitavanje...</div>}
        </div>
      </div>
    </AppLayout>
  );
}
