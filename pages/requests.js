import dynamic from "next/dynamic";

const RequestsPage = dynamic(
  () => import("../components/RequestsClient"),
  { ssr: false }
);

export default function RequestsWrapper() {
  return <RequestsPage />;
}
