import { useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  /* ===== UI STATE (bez logike) ===== */
  const [selectedColumns, setSelectedColumns] = useState({
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

  const toggleColumn = (key) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AppLayout>
      <div className="page">
        {/* ================= HEADER ================= */}
        <div className="pageHeader">
          <h1>Igrači</h1>
          <div className="pageHeaderRight">
            <div><strong>Ukupno:</strong> 0</div>
          </div>
        </div>

        {/* ================= FILTER PANEL ================= */}
        <div className="card mb-6">
          <h3 className="mb-3">Filteri</h3>

          {/* Requirements / personal */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <select>
              <option>The requirement to players</option>
            </select>
            <select>
              <option>Personal filter</option>
            </select>
            <select>
              <option>Speciality (any)</option>
            </select>
            <select>
              <option>Agreeability (any)</option>
            </select>
            <select>
              <option>Aggressiveness (any)</option>
            </select>
            <select>
              <option>Honesty (any)</option>
            </select>
          </div>

          {/* Age */}
          <div className="grid grid-cols-6 gap-3 mb-4">
            <input placeholder="Age min (years)" />
            <input placeholder="Age min (days)" />
            <input placeholder="Age max (years)" />
            <input placeholder="Age max (days)" />
          </div>

          {/* Skill minimums */}
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

          {/* Advanced */}
          <div className="grid grid-cols-4 gap-3">
            <input placeholder="TSI ≥" />
            <input placeholder="HTMS ≥" />
            <input placeholder="HTMS28 ≥" />
          </div>
        </div>

        {/* ================= COLUMN SELECTOR ================= */}
        <div className="card mb-6">
          <h3 className="mb-3">Select columns</h3>

          <div className="grid grid-cols-6 gap-2 text-sm">
            {Object.keys(selectedColumns).map((key) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedColumns[key]}
                  onChange={() => toggleColumn(key)}
                />
                {key.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex gap-3 mb-4">
          <button className="btn-primary" disabled>
            Add selected to list
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th></th>
                {selectedColumns.name && <th>Name</th>}
                {selectedColumns.age && <th>Age</th>}
                {selectedColumns.position && <th>Pos</th>}
                {selectedColumns.speciality && <th>Spec</th>}
                {selectedColumns.gk && <th>GK</th>}
                {selectedColumns.def && <th>DEF</th>}
                {selectedColumns.pm && <th>PM</th>}
                {selectedColumns.wing && <th>W</th>}
                {selectedColumns.pass && <th>PASS</th>}
                {selectedColumns.scor && <th>SC</th>}
                {selectedColumns.sp && <th>SP</th>}
                {selectedColumns.stamina && <th>STAM</th>}
                {selectedColumns.tsi && <th>TSI</th>}
                {selectedColumns.htms && <th>HTMS</th>}
                {selectedColumns.htms28 && <th>HTMS28</th>}
                {selectedColumns.agree && <th>AGR</th>}
                {selectedColumns.agg && <th>AGG</th>}
                {selectedColumns.hon && <th>HON</th>}
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
    </AppLayout>
  );
}
