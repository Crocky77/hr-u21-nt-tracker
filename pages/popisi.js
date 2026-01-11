import AppLayout from "../components/AppLayout";

export default function PopisiPage() {
  return (
    <AppLayout title="Popisi">
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Popisi (uskoro)</h2>
        <p>
          Ovdje ćemo raditi liste igrača (shortlist, core, rotation, watchlist, opponent-specific list…).
        </p>
      </div>
    </AppLayout>
  );
}
