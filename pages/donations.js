// pages/donations.js
import AppLayout from "../components/AppLayout";

export default function Donations() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker">
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 18
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>Donacije</h1>
        <p style={{ marginTop: 10, opacity: 0.8, lineHeight: 1.5 }}>
          Ovdje ćemo staviti info o troškovima (hosting, domena, vrijeme razvoja) i opcije doniranja.
        </p>

        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: "#f9fafb"
          }}
        >
          <div style={{ fontWeight: 900 }}>V1 (placeholder)</div>
          <ul style={{ marginTop: 8, opacity: 0.85 }}>
            <li>Kasnije: linkovi za podršku (Boosty / PayPal / sl.)</li>
            <li>Kasnije: transparentan popis troškova</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
