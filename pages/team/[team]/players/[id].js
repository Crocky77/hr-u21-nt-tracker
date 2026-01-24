import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../../components/Layout";
import { supabase } from "../../../../utils/supabaseClient";

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { team, id } = router.query;

  const teamSlug = useMemo(() => {
    // fallback ako team nije definiran (ne bi se trebalo dogoditi, ali da ne puca)
    if (typeof team === "string" && team.length) return team;
    return "u21";
  }, [team]);

  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [tagsError, setTagsError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      // NOTE: id u URL-u je HT player id (u tvom kodu na listi linkaš row.ht_player_id)
      const htPlayerId = Number(id);

      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("ht_player_id", htPlayerId)
        .maybeSingle();

      if (!cancelled) {
        if (error) {
          console.error("Greška kod dohvaćanja igrača:", error);
          setPlayer(null);
        } else {
          setPlayer(data ?? null);
        }
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    let cancelled = false;

    async function loadTags() {
      setTagsLoading(true);
      setTagsError(null);

      const htPlayerId = Number(id);

      // Ako ovaj RPC ne postoji kod tebe, ovo neće srušiti stranicu – samo će prikazati error u UI.
      const { data, error } = await supabase.rpc("list_player_requirement_tags", {
        p_ht_player_id: htPlayerId,
      });

      if (!cancelled) {
        if (error) {
          setTags([]);
          setTagsError(error.message || "Greška kod dohvaćanja tagova.");
        } else {
          setTags(Array.isArray(data) ? data : []);
        }
        setTagsLoading(false);
      }
    }

    loadTags();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  function goBackToPlayers() {
    // KLJUČNO: ne router.back(), nego uvijek idi na listu za isti team!
    router.push(`/team/${teamSlug}/players`);
  }

  return (
    <Layout title="Detalji igrača">
      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <button
            onClick={goBackToPlayers}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ← Igrači
          </button>

          <button
            onClick={() => router.push("/")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Naslovna
          </button>
        </div>

        {loading ? (
          <div>Učitavam...</div>
        ) : !player ? (
          <div style={{ color: "crimson", fontWeight: 600 }}>
            Nema igrača za HT ID: {String(id)}
          </div>
        ) : (
          <>
            <h1 style={{ margin: "8px 0 12px 0" }}>{player.full_name || "Igrač"}</h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Osnovno</h3>
                <div><b>Interan ID:</b> {player.id}</div>
                <div><b>HT Player ID:</b> {player.ht_player_id}</div>
                <div><b>Poz:</b> {player.position || "-"}</div>
                <div><b>Status:</b> {player.status || "-"}</div>
              </div>

              <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Portal-style status (trenutno/uskoro)</h3>
                <div><b>Forma:</b> {player.form ?? "-"}</div>
                <div><b>Stamina:</b> {player.stamina ?? "-"}</div>
                <div><b>TSI:</b> {player.tsi ?? "-"}</div>
                <div><b>Trening:</b> {player.current_training ?? "-"}</div>
                <div><b>Intenzitet:</b> {player.intensity ?? "-"}</div>
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Zahtjevi (tagovi)</h3>

              {tagsLoading ? (
                <div>Učitavam tagove...</div>
              ) : tagsError ? (
                <div style={{ color: "crimson" }}>
                  Greška kod tagova: {tagsError}
                </div>
              ) : tags.length === 0 ? (
                <div>Nema tagova.</div>
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
    </Layout>
  );
}
