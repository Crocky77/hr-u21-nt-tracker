// pages/team/[team]/dashboard.js
export async function getServerSideProps(ctx) {
  const team = String(ctx.params?.team || "").toLowerCase();
  return {
    redirect: {
      destination: `/team/${team}`,
      permanent: false,
    },
  };
}

export default function DeadDashboard() {
  return null;
}
