import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import RequestsClient from "../../../components/RequestsClient";

export default function TeamRequestsPage() {
  const router = useRouter();
  const { team } = router.query;

  if (!team) return null;

  return (
    <AppLayout title="Zahtjevi">
      <RequestsClient team={team} />
    </AppLayout>
  );
}
