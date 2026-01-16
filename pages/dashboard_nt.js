// pages/dashboard_nt.js
export async function getServerSideProps() {
  return {
    redirect: { destination: "/team/nt", permanent: false },
  };
}
export default function DeadDashboardNT() {
  return null;
}
