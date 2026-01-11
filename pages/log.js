import AppLayout from "../components/AppLayout";

export default function LogPage() {
  return (
    <AppLayout title="Log">
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Log (uskoro)</h2>
        <p>
          Audit log: tko je dodao/uređivao igrača, promjene statusa, bilješke, sync eventovi (kad dođe CHPP).
        </p>
      </div>
    </AppLayout>
  );
}
