// components/TransfersWidget.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function formatAsking(askingPrice) {
  if (!askingPrice) return "—";
  // Toxttrick često daje npr 3.450.000
  return `${askingPrice}`;
}

function sliceWindow(arr, start, size) {
  if (!arr.length) return [];
  const out = [];
  for (let i = 0; i < size; i++) {
    out.push(arr[(start + i) % arr.length]);
  }
  return out;
}

export default function TransfersWidget({
  title = "Hrvatski U21/NT igrači na transfer listi",
  rotateMs = 6000,
  pageSize = 3,
}) {
  const [active, setActive] = useState("u21"); // "u21" | "nt"
  const [loading, setLoading] = useState(true);
  const [u21, setU21] = useState([]);
  const [nt, setNt] = useState([]);
  const [err, setErr] = useState("");
  const [idx, setIdx] = useState(0);

  const list = active === "u21" ? u21 : nt;

  const visible = useMemo(() => sliceWindow(list, idx, pageSize), [list, idx, pageSize]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const [r1, r2] = await Promise.all([
          fetch("/api/transfers/u21").then((r) => r.json()),
          fetch("/api/transfers/nt").then((r) => r.json()),
        ]);

        if (cancelled) return;

        if (r1?.error) throw new Error(`U21: ${r1.error}`);
        if (r2?.error) throw new Error(`NT: ${r2.error}`);

        setU21(Array.isArray(r1?.players) ? r1.players : []);
        setNt(Array.isArray(r2?.players) ? r2.players : []);
      } catch (e) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // reset rotacije kad promijeniš tab ili listu
  useEffect(() => {
    setIdx(0);
  }, [active]);

  // auto-rotacija
  useEffect(() => {
    if (!list.length) return;
    const t = setInterval(() => setIdx((x) => x + pageSize), rotateMs);
    return () => clearInterval(t);
  }, [list.length, pageSize, rotateMs]);

  const countU21 = u21.length;
  const countNT = nt.length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 1000, fontSize: 14 }}>{title}</div>
          <div style={{ marginTop: 4, opacity: 0.8, fontSize: 12 }}>
            Live (privremeno): Toxttrick scraping · samo hrvatski igrači · rotacija svakih{" "}
            {Math.round(rotateMs / 1000)}s
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setActive("u21")}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.10)",
              background: active === "u21" ? "rgba(30, 64, 175, 0.92)" : "rgba(255,255,255,0.85)",
              color: active === "u21" ? "#fff" : "rgba(0,0,0,0.85)",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            U21 ({countU21})
          </button>

          <button
            type="button"
            onClick={() => setActive("nt")}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.10)",
              background: active === "nt" ? "rgba(3, 105, 161, 0.92)" : "rgba(255,255,255,0.85)",
              color: active === "nt" ? "#fff" : "rgba(0,0,0,0.85)",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            NT ({countNT})
          </button>

          <Link
            href={`/team/${active}/transfers`}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255,255,255,0.85)",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            Otvori popis →
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? (
          <div style={{ opacity: 0.75, fontSize: 13 }}>Učitavam transfer listu…</div>
        ) : err ? (
          <div style={{ color: "crimson", fontWeight: 900, fontSize: 13 }}>Greška: {err}</div>
        ) : !list.length ? (
          <div style={{ opacity: 0.75, fontSize: 13 }}>Nema hrvatskih igrača na TL (po izvoru).</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 8,
            }}
          >
            {visible.map((p) => (
              <div
                key={`${active}-${p.htId}`}
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.85)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 1000, lineHeight: "1.1rem" }}>{p.name || "—"}</div>
                  <div style={{ marginTop: 3, fontSize: 12, opacity: 0.8 }}>
                    ID:{" "}
                    <a
                      href={p.toxttrickPlayerUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "underline", fontWeight: 900 }}
                    >
                      {p.htId}
                    </a>
                    {p.ageYears != null ? ` · Dob: ${p.ageYears}` : ""}
                    {p.deadline ? ` · Deadline: ${p.deadline}` : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 1000, fontSize: 13 }}>
                    Traži: {formatAsking(p.askingPrice)}
                  </div>

                  <a
                    href={p.toxttrickPlayerUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,0.10)",
                      background: "rgba(255,255,255,0.90)",
                      textDecoration: "none",
                      fontWeight: 900,
                      fontSize: 12,
                    }}
                  >
                    HT profil →
                  </a>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Prikazujem {Math.min(pageSize, list.length)} / {list.length} (rotira se automatski)
              </div>
              <button
                type="button"
                onClick={() => setIdx((x) => x + pageSize)}
                style={{
                  padding: "7px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.10)",
                  background: "rgba(255,255,255,0.90)",
                  fontWeight: 900,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Sljedeći →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
