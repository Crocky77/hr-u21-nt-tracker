import { useRouter } from "next/router";
import DashboardU21 from "../../dashboard_u21";
import DashboardNT from "../../dashboard_nt";

export default function TeamDashboard() {
  const router = useRouter();
  const { team } = router.query;

  if (!team) return <div style={{ padding: 40 }}>Učitavam...</div>;

  const t = String(team).toLowerCase();

  if (t === "u21") return <DashboardU21 />;
  if (t === "nt") return <DashboardNT />;

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h2>Neispravan team</h2>
      <p>Koristi /team/u21/dashboard ili /team/nt/dashboard</p>
    </main>
  );
}
