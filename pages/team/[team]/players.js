import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import supabase from "../../../lib/supabaseClient";

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  const [columns, setColumns] = useState({
    name: true,
    age: true,
    position: true,
    speciality: true,
    gk: true,
    def: true,
    pm: true,
    wing: true,
    pass: true,
    scor: true,
  });

  /* ================= DATA LOAD ================= */

  useEffect(() => {
    if (!team) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc(
        "list_team_players",
        { team_slug: team }
      );

      if (error) {
        setError(error.message);
        setPlayers([]);
      } else {
        setPlayers(data || []);
      }

      setLoading(false);
    };

    load();
  }, [team]);

  /* ================= FILTERED PLAYERS ================= */

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (
        search &&
        !p.full_name?.toLowerCase().includes(search.toLowerCase())
      )
        return false;

      if (position && p.position !== position) return false;

      if (ageMin && p.age < Number(ageMin)) return false;
      if (ageMax && p.age > Number(ageMax)) return false;

      return true;
    });
  }, [players, search, position, ageMin, ageMax]);

  const toggleColumn = (key) =>
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ================= RENDER ================= */

  return (
    <AppLayout>
      {/* === IDENTIČAN SHELL KAO ZAHTJEVI / UPOZORENJA === */}
      <div className="team-page">

        {/* ===== HEADER ===== */}
        <div className="team-page-header">
          <div className="team-page-header-left">
            <button
              className="btn-link"
              onClick={() => router.back()}
            >
              ← Natrag
            </button>
            <h1>Igrači</h1>
          </div>

          <div className="team-page-header-right">
            <button
              className="btn-secondary"
              onClick={() => router.push("/")}
            >
              Naslovnica
            </button>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="team-page-content">

          {/* FILTERI */}
          <div className="card mb-6">
            <h3>Filteri</h3>

            <div className="grid grid-cols-4 gap-3 mt-3">
              <input
                placeholder="Pretraga (ime)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <input
                placeholder="Pozicija"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
              <input
                placeholder="Dob min"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
              />
              <input
                placeholder="Dob max"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
              />
            </div>
          </div>

          {/* KOLONE */}
          <div className="card mb-6">
            <h3>Kolone</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              {Object.keys(columns).map((k) => (
                <label key={k} className="flex gap-1 items-center text-sm">
                  <input
                    type="checkbox"
                    checked={columns[k]}
                    onChange={() => toggleColumn(k)}
                  />
                  {k.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* TABLICA */}
          <div className="card">
            {error && (
              <div className="text-red-600 mb-2">
                Greška: {error}
              </div>
            )}

            {loading ? (
              <div>Učitavanje...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {columns.name && <th>Ime</th>}
                    {columns.age && <th>Dob</th>}
                    {columns.position && <th>Poz</th>}
                    {columns.speciality && <th>Spec</th>}
                    {columns.gk && <th>GK</th>}
                    {columns.def && <th>DEF</th>}
                    {columns.pm && <th>PM</th>}
                    {columns.wing && <th>W</th>}
                    {columns.pass && <th>PASS</th>}
                    {columns.scor && <th>SC</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 && (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        Nema igrača
                      </td>
                    </tr>
                  )}

                  {filteredPlayers.map((p) => (
                    <tr
                      key={p.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        router.push(`/player/${p.id}`)
                      }
                    >
                      {columns.name && <td>{p.full_name}</td>}
                      {columns.age && <td>{p.age}</td>}
                      {columns.position && <td>{p.position}</td>}
                      {columns.speciality && <td>{p.speciality}</td>}
                      {columns.gk && <td>{p.gk}</td>}
                      {columns.def && <td>{p.defending}</td>}
                      {columns.pm && <td>{p.playmaking}</td>}
                      {columns.wing && <td>{p.winger}</td>}
                      {columns.pass && <td>{p.passing}</td>}
                      {columns.scor && <td>{p.scoring}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
