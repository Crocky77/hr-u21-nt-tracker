import { useRouter } from "next/router";

import AppLayout from "../../../components/AppLayout";
import TrackerSidebar from "../../../components/TrackerSidebar";

export default function AlertsPage() {
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
          <div className="card">
            <div className="h">Upozorenja</div>
            <div className="p">
              Ovdje će biti: kartoni, ozljede, krivi trening/stamina, highlight redova u tablici i slanje obavijesti.
            </div>
            <div className="note">(skeleton placeholder)</div>
          </div>
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

        .card {
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }
        .h {
          font-weight: 900;
          font-size: 18px;
        }
        .p {
          margin-top: 6px;
          opacity: 0.85;
        }
        .note {
          margin-top: 10px;
          font-size: 12px;
          opacity: 0.7;
        }
      `}</style>
    </AppLayout>
  );
}
