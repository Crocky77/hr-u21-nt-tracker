import AppLayout from "../components/AppLayout";

export default function UpozorenjaPage() {
  return (
    <AppLayout title="Upozorenja">
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Upozorenja (uskoro)</h2>
        <p>
          Ovdje idu automatska upozorenja: U21 eligibility (21g+111d), stagnacija treninga, pad forme, rizik ozljede…
        </p>
      </div>
    </AppLayout>
  );
}
