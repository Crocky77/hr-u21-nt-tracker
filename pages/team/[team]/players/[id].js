import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * OVA STRANICA JE SAMO REDIRECT.
 * Pravi detalj igrača je na: /players/[id].js
 * Ovdje samo preusmjeravamo: /team/:team/players/:id  ->  /players/:id?team=:team
 */
export default function TeamPlayerRedirect() {
  const router = useRouter();
  const { team, id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    const safeTeam = team === "nt" ? "nt" : "u21";
    router.replace(`/players/${id}?team=${safeTeam}`);
  }, [router.isReady, team, id]);

  return null;
}
