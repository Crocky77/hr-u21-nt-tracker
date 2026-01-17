// pages/requests.js
import { useRouter } from "next/router";
import RequestsClient from "../components/RequestsClient";

export default function RequestsPage() {
  const router = useRouter();

  // Ako postoji team u query (npr ?team=u21), koristimo to.
  // Inače default u21.
  const team = (router.query.team === "nt" ? "nt" : "u21");

  return <RequestsClient team={team} />;
}
