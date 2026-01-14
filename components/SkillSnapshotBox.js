// components/SkillSnapshotBox.js
import React from "react";

function fmtDate(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

export default function SkillSnapshotBox({ snapshot }) {
  if (!snapshot) {
    return (
      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Skill snapshot (zadnji)</h3>
        <div
          style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          Nema skill snapshot-a za ovog igrača.
        </div>
      </div>
    );
  }

  // Očekivani stupci iz tvoje tablice player_skill_snapshots:
  // snapshot_date, inserted_at, source, category, stamina, defending, winger, scoring,
  // form, experience, leadership, gk, playmaking, passing, set_pieces, tsi
  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Skill snapshot (zadnji)</h3>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          background: "#fafafa",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <div>
            <b>Snapshot date:</b> {fmtDate(snapshot.snapshot_date)}
          </div>
          <div>
            <b>Inserted:</b> {snapshot.inserted_at ? String(snapshot.inserted_at) : "-"}
          </div>
          <div>
            <b>Source:</b> {snapshot.source || "-"}
          </div>
          <div>
            <b>Kategorija:</b> {snapshot.category || "-"}
          </div>
          <div>
            <b>Reprezentativac:</b>{" "}
            {snapshot.is_international !== undefined && snapshot.is_international !== null
              ? snapshot.is_international
                ? "1"
                : "0"
              : "-"}
          </div>
          <div>
            <b>Caps NT:</b> {snapshot.caps_nt ?? "-"} | <b>Caps U21:</b> {snapshot.caps_u21 ?? "-"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div>
              <b>Izdržljivost:</b> {snapshot.stamina ?? "-"}
            </div>
            <div>
              <b>Obrana:</b> {snapshot.defending ?? "-"}
            </div>
            <div>
              <b>Krilo:</b> {snapshot.winger ?? "-"}
            </div>
            <div>
              <b>Napad:</b> {snapshot.scoring ?? "-"}
            </div>
            <div>
              <b>Forma:</b> {snapshot.form ?? "-"}
            </div>
            <div>
              <b>Iskustvo:</b> {snapshot.experience ?? "-"}
            </div>
          </div>

          <div>
            <div>
              <b>Na vratima:</b> {snapshot.gk ?? "-"}
            </div>
            <div>
              <b>Kreiranje:</b> {snapshot.playmaking ?? "-"}
            </div>
            <div>
              <b>Proigravanje:</b> {snapshot.passing ?? "-"}
            </div>
            <div>
              <b>Prekidi:</b> {snapshot.set_pieces ?? "-"}
            </div>
            <div>
              <b>TSI:</b> {snapshot.tsi ?? "-"}
            </div>
            <div>
              <b>Vodstvo:</b> {snapshot.leadership ?? "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
