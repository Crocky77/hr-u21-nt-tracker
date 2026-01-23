// pages/team/[team]/players/[id].js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../../lib/supabaseClient";

function toMaybeNumber(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  // allow only digits for numeric
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { team, id } = router.query;

  const [loading, setLoading] = useState(true);
  const [teamRow, setTeamRow] = useState(null);
  const [player, setPlayer] = useState(null);
  const [tags, setTags] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const htPlayerId = useMemo(() => toMaybeNumber(id), [id]);

  useEffect(() => {
    if (!team || !id) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setErrorMsg("");
      setTeamRow(null);
      setPlayer(null);
      setTags([]);

      // 1) team by slug
      const teamRes = await supabase
        .from("teams")
        .select("id, slug, name")
        .eq("slug", team)
        .maybeSingle();

      if (cancelled) return;

      if (teamRes.error) {
        setErrorMsg(`Greška: ne mogu učitati tim (teams). ${teamRes.error.message}`);
        setLoading(false);
        return;
      }
      if (!teamRes.data) {
        setErrorMsg("Tim nije pronađen (krivi slug).");
        setLoading(false);
        return;
      }

      const t = teamRes.data;
      setTeamRow(t);

      // 2) player lookup (robust)
      //    a) try by ht_player_id (BIGINT) if URL id is numeric
      //    b) fallback: try by internal uuid id
      let p = null;

      if (htPlayerId !== null) {
        const pRes = await supabase
          .from("players")
          .select("*")
          .eq("team_id", t.id)
          .eq("ht_player_id", htPlayerId)
          .maybeSingle();

        if (cancelled) return;

        if (pRes.error) {
          setErrorMsg(`Greška: ne mogu učitati igrača (players by ht_player_id). ${pRes.error.message}`);
          setLoading(false);
          return;
        }
        p = pRes.data || null;
      }

      if (!p) {
        const pRes2 = await supabase
          .from("players")
          .select("*")
          .eq("team_id", t.id)
          .eq("id", id)
          .maybeSingle();

        if (cancelled) return;

        if (pRes2.error) {
          setErrorMsg(`Greška: ne mogu učitati igrača (players by id). ${pRes2.error.message}`);
          setLoading(false);
          return;
        }
        p = pRes2.data || null;
      }

      if (!p) {
        setErrorMsg("Igrač nije pronađen (krivi ID ili ne pripada ovom timu).");
        setLoading(false);
        return;
      }

      setPlayer(p);

      // 3) requirement tags (optional) - only if ht_player_id exists
      //    (ovo neće rušiti stranicu ako RPC još nije spreman)
      const htIdForTags = p.ht_player_id ?? htPlayerId;
      if (htIdForTags != null) {
        const tagsRes = await supabase.rpc("list_player_requirement_tags", {
          p_team_id: t.id,
          p_ht_player_id: htIdForTags,
        });

        if (!cancelled) {
          if (!tagsRes.error && Array.isArray(tagsRes.data)) {
            setTags(tagsRes.data);
          }
          // ako baci grešku, samo ignoriramo (ne rušimo UI)
        }
      }

      setLoading(false);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [team, id, htPlayerId]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={() => router.back()}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
        >
          ← Natrag na igrače
        </button>
        <button
          onClick={() => router.push("/")}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
        >
          Naslovnica
        </button>
        <div style={{ marginLeft: "auto", opacity: 0.75 }}>
          {teamRow ? `Tim: ${teamRow.name || teamRow.slug}` : ""}
        </div>
      </div>

      <h1 style={{ fontSize: 28, margin: "6px 0 12px" }}>Detalji igrača</h1>

      {loading && (
        <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 12, background: "#fafafa" }}>
          Učitavam...
        </div>
      )}

      {!loading && errorMsg && (
        <div style={{ padding: 14, border: "1px solid #f3c2c2", borderRadius: 12, background: "#fff5f5" }}>
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && player && (
        <>
          <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 12, background: "#fff" }}>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              <div style={{ minWidth: 260 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{player.full_name || player.name || "—"}</div>
                <div style={{ opacity: 0.75, marginTop: 4 }}>
                  HT ID: <b>{player.ht_player_id ?? "—"}</b>
                </div>
                <div style={{ opacity: 0.75, marginTop: 4 }}>
                  Dob: <b>{player.age ?? "—"}</b>
                </div>
                <div style={{ opacity: 0.75, marginTop: 4 }}>
                  Pozicija: <b>{player.position ?? player.pos ?? "—"}</b>
                </div>
              </div>

              <div style={{ minWidth: 320 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Skillovi</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(90px, 1fr))", gap: 10 }}>
                  <div>GK: <b>{player.gk ?? player.skill_gk ?? "—"}</b></div>
                  <div>DEF: <b>{player.def ?? player.skill_def ?? "—"}</b></div>
                  <div>PM: <b>{player.pm ?? player.skill_pm ?? "—"}</b></div>
                  <div>WING: <b>{player.wing ?? player.skill_wing ?? "—"}</b></div>
                  <div>PASS: <b>{player.pass ?? player.skill_pass ?? "—"}</b></div>
                  <div>SCOR: <b>{player.score ?? player.skill_score ?? "—"}</b></div>
                  <div>SP: <b>{player.sp ?? player.skill_sp ?? "—"}</b></div>
                  <div>STAM: <b>{player.stamina ?? player.skill_stamina ?? "—"}</b></div>
                  <div>TSI: <b>{player.tsi ?? "—"}</b></div>
                </div>
              </div>

              <div style={{ minWidth: 260 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>HTMS</div>
                <div>HTMS (Ability): <b>{player.htms ?? player.htms_points ?? "—"}</b></div>
                <div style={{ marginTop: 6 }}>HTMS28 (Potential): <b>{player.htms28 ?? player.htms28_points ?? "—"}</b></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 14, border: "1px solid #eee", borderRadius: 12, background: "#fff" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Zadovoljava uvjete (tagovi)</div>

            {tags.length === 0 ? (
              <div style={{ opacity: 0.7 }}>
                Nema tagova (ili RPC još nije spreman / nema definiranih zahtjeva).
              </div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {tags.map((t, idx) => (
                  <li key={t.requirement_id || idx}>
                    <b>{t.requirement_name ?? "Zahtjev"}</b>{" "}
                    {typeof t.is_match === "boolean" ? (t.is_match ? "✅" : "❌") : ""}
                    {typeof t.rules_count === "number" && typeof t.matched_rules === "number"
                      ? ` (${t.matched_rules}/${t.rules_count})`
                      : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
