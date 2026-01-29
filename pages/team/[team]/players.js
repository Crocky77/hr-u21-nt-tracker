import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import AppLayout from "../../../components/AppLayout";

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [error, setError] = useState(null);

  useEffect(() => {
    // FAZA 1: layout-only
    // Backend / RPC će se rješavati u FAZI 2
    setError(
      "Greška: Could not find the function public.list_team_players(team_slug) in the schema cache"
    );
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Igrači</h1>
        </div>

        {/* Filters placeholder (ostaje kakav je bio logički) */}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <select className="border rounded px-3 py-2">
              <option>Requirement to players</option>
            </select>

            <select className="border rounded px-3 py-2">
              <option>Personal filter</option>
            </select>

            <select className="border rounded px-3 py-2">
              <option>Speciality (all)</option>
            </select>

            <select className="border rounded px-3 py-2">
              <option>Agreeability</option>
            </select>

            <select className="border rounded px-3 py-2">
              <option>Aggressiveness</option>
            </select>

            <select className="border rounded px-3 py-2">
              <option>Honesty</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="Search: ime / HTID / pozicija..."
            />

            <select className="border rounded px-3 py-2">
              <option>Pozicija (sve)</option>
            </select>

            <input
              className="border rounded px-3 py-2 w-32"
              placeholder="Age min"
            />
            <input
              className="border rounded px-3 py-2 w-32"
              placeholder="Age max"
            />
          </div>
        </div>

        {/* Error box (expected in FAZA 1) */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
