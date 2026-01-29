import { useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  // UI-only state (bez logike)
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
    sp: false,
    stamina: false,
    tsi: false,
    htms: false,
    htms28: false,
    agree: false,
    agg: false,
    hon: false,
  });

  const toggleCol = (k) =>
    setColumns((p) => ({ ...p, [k]: !p[k] }));

  return (
    <AppLayout>
      {/* ===== ISTI SHELL KAO ZAHTJEVI / UPOZORENJA ===== */}
      <div className="contentWrap">
        {/* ===== HEADER / ACTION BAR ===== */}
        <div className="contentHeader">
          <div className="contentHeaderLeft">
            <button
              className="btn-link"
              onClick={() => router.back()}
            >
              ← Natrag
            </button>
            <h1>Igrači</h1>
          </div>

          <div className="contentHeaderRight">
            <button
              className="btn-secondary"
              onClick={() => router.push("/")}
            >
              Naslovnica
            </button>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="contentBody">
          {/* ===== FILTERI ===== */}
          <div className="card mb-6">
            <h3 className="mb-3">Filteri</h3>

            <div className="grid grid-cols-6 gap-3 mb-4">
              <select><option>The requirement to players</option></select>
              <select><option>Personal filter</option></select>
              <select><option>Speciality (any)</option></select>
              <select><option>Agreeability (any)</option></select>
              <select><option>Aggressiveness (any)</option></select>
              <select><option>Honesty (any)</option></select>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <input placeholder="Age min (years)" />
              <input placeholder="Age min (days)" />
              <input placeholder="Age max (years)" />
              <input placeholder="Age max (days)" />
            </div>

            <div className="grid grid-cols-8 gap-2 mb-4">
              <input placeholder="GK ≥" />
              <input placeholder="DEF ≥" />
              <input placeholder="PM ≥" />
              <input placeholder="W ≥" />
              <input placeholder="PASS ≥" />
              <input placeholder="SC ≥" />
              <input placeholder="SP ≥" />
              <input placeholder="STAM ≥" />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <input placeholder="TSI ≥" />
              <input placeholder="HTMS ≥" />
              <input placeholder="HTMS28 ≥" />
            </div>
          </div>

          {/* ===== KOLONE ===== */}
          <div className="card mb-6">
            <h3 className="mb-3">Select columns</h3>
            <div className="grid grid-cols-8 gap-2 text-sm">
              {Object.keys(columns).map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={columns[k]}
                    onChange={() => toggleCol(k)}
                  />
                  {k.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* ===== AKCIJE ===== */}
          <div className="mb-4">
            <button className="btn-primary" disabled>
              Add selected to list
            </button>
          </div>

          {/* ===== TABLICA ===== */}
          <div className="card">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th></th>
                  {columns.name && <th>Name</th>}
                  {columns.age && <th>Age</th>}
                  {columns.position && <th>Pos</th>}
                  {columns.speciality && <th>Spec</th>}
                  {columns.gk && <th>GK</th>}
                  {columns.def && <th>DEF</th>}
                  {columns.pm && <th>PM</th>}
                  {columns.wing && <th>W</th>}
                  {columns.pass && <th>PASS</th>}
                  {columns.scor && <th>SC</th>}
                  {columns.sp && <th>SP</th>}
                  {columns.stamina && <th>STAM</th>}
                  {columns.tsi && <th>TSI</th>}
                  {columns.htms && <th>HTMS</th>}
                  {columns.htms28 && <th>HTMS28</th>}
                  {columns.agree && <th>AGR</th>}
                  {columns.agg && <th>AGG</th>}
                  {columns.hon && <th>HON</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="20" className="text-center py-6 text-gray-500">
                    No players loaded (UI skeleton)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
