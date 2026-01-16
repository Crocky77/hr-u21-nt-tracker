import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardLegacy() {
  const router = useRouter();

  useEffect(() => {
    // default: u21 dashboard
    router.replace("/team/u21/dashboard");
  }, [router]);

  return null;
}
