import { useRouter } from "next/router";

import AppLayout from "../../../components/AppLayout";
import TrackerSidebar from "../../../components/TrackerSidebar";
import RequestsClient from "../../../components/RequestsClient";

export default function RequestsPage() {
  const router = useRouter();
  const { team } = router.query;

  if (!team) return null;

  return (
    <AppLayout fullWidth>
      <div className="shell">
        <div className="sidebar">
          <TrackerSidebar />
        </div>

        <div className="main">
          <RequestsClient />
        </div>
      </div>

      <style jsx>{`
        .shell {
          display: flex;
          width: 100%;
          min-height: calc(100vh - 60px);
        }
        .sidebar {
          padding: 14px 0 18px 0;
        }
        .main {
          flex: 1;
          padding: 14px 18px 24px 18px;
        }
      `}</style>
    </AppLayout>
  );
}
