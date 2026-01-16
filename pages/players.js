import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PlayersLegacy() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/team/u21/players");
  }, [router]);

  return null;
}
