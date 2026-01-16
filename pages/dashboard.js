// pages/dashboard.js
export async function getServerSideProps() {
  return {
    redirect: { destination: "/team/u21", permanent: false },
  };
}
export default function DeadDashboard() {
  return null;
}
