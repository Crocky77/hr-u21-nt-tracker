import AppLayout from "./AppLayout";
import { useAuth } from "../utils/useAuth";

export default function RequestsClient() {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (role === "guest") {
    return (
      <AppLayout>
        <h2>Zahtjevi</h2>
        <p>Pristup samo za ovlaštene korisnike.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h2>Zahtjevi</h2>
      <p>Ovdje će biti filter builder za reprezentaciju.</p>
    </AppLayout>
  );
}
