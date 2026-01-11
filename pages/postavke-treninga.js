import AppLayout from "../components/AppLayout";

export default function PostavkeTreningaPage() {
  return (
    <AppLayout title="Postavke treninga">
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Postavke treninga (uskoro)</h2>
        <p>
          Ovdje će biti trening formula i parametri: tip treninga, intenzitet, stamina share, trener/assistant bonus…
        </p>
      </div>
    </AppLayout>
  );
}
