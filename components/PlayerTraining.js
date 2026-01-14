// components/PlayerTraining.js
import React from "react";

function labelForSkill(key) {
  const map = {
    gk: "Na vratima",
    defending: "Obrana",
    playmaking: "Kreiranje",
    winger: "Krilo",
    passing: "Proigravanje",
    scoring: "Napad",
    set_pieces: "Prekidi",
    stamina: "Izdržljivost",
    form: "Forma",
    experience: "Iskustvo",
    leadership: "Vodstvo",
  };
  return map[key] || key;
}

function getSkillValueFromSnapshot(snapshot, targetSkill) {
  if (!snapshot || !targetSkill) return null;

  // normalizacija: u bazi target_skill može biti "gk" ili "keeper" ili "winger" itd.
  const t = String(targetSkill).toLowerCase().trim();

  const aliases = {
    keeper: "gk",
    goalkeeping: "gk",
    wing: "winger",
    setpieces: "set_pieces",
    set_pieces: "set_pieces",
    sp: "set_pieces",
  };

  const key = aliases[t] || t;

  if (snapshot[key] === undefined || snapshot[key] === null) return null;
  return snapshot[key];
}

export default function PlayerTraining({ player, trainingSetting, latestSnapshot }) {
  // trainingSetting: red iz public.training_settings (za team_type + position)
  if (!trainingSetting) {
    return (
      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Preporuka treninga</h3>
        <div
          style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          Nema postavke u <code>training_settings</code> za ovaj tim/poziciju.
        </div>
      </div>
    );
  }

  const targetSkill = trainingSetting.target_skill;
  const currentValue = getSkillValueFromSnapshot(latestSnapshot, targetSkill);

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 8 }}>Preporuka treninga</h3>

      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        <div style={{ marginBottom: 6 }}>
          <b>Tim:</b> {player?.team_type || "-"} &nbsp; | &nbsp;
          <b>Pozicija:</b> {player?.position || "-"}
        </div>

        <div style={{ marginBottom: 6 }}>
          <b>Ciljani skill:</b> {labelForSkill(targetSkill)}
          {currentValue !== null ? (
            <>
              {" "}
              (trenutno: <b>{currentValue}</b>)
            </>
          ) : (
            <>
              {" "}
              (trenutno: <i>nema u snapshotu</i>)
            </>
          )}
        </div>

        <div style={{ marginBottom: 6 }}>
          <b>Min gain / tjedan:</b>{" "}
          {trainingSetting.min_gain_per_week !== null &&
          trainingSetting.min_gain_per_week !== undefined
            ? trainingSetting.min_gain_per_week
            : "-"}
        </div>

        <div style={{ marginBottom: 6 }}>
          <b>Max tjedana bez gain-a:</b>{" "}
          {trainingSetting.max_weeks_without_gain !== null &&
          trainingSetting.max_weeks_without_gain !== undefined
            ? trainingSetting.max_weeks_without_gain
            : "-"}
        </div>

        {trainingSetting.note ? (
          <div style={{ marginTop: 8 }}>
            <b>Napomena:</b> {trainingSetting.note}
          </div>
        ) : null}
      </div>
    </div>
  );
}
