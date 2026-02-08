import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";

const emptyForm = { text: "", level: "info", active: true };

export default function AnnouncementsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements");
        if (!response.ok) return;
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn("Neuspjelo dohvaćanje obavijesti.", error);
      }
    };
    fetchAnnouncements();
  }, []);

  const activeCount = useMemo(
    () => items.filter((item) => item.active).length,
    [items]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.text.trim()) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: form.text.trim(),
          level: form.level,
          active: form.active,
        }),
      });
      if (!response.ok) {
        const message = await response.text();
        setErrorMsg(
          `Ne mogu spremiti obavijest. Provjerite postavke. (${message || "greška"})`
        );
        return;
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
      setForm(emptyForm);
      setErrorMsg("");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (id) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    const response = await fetch("/api/announcements", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates: { active: !target.active } }),
    });
    if (!response.ok) {
      const message = await response.text();
      setErrorMsg(
        `Ne mogu ažurirati obavijest. Provjerite postavke. (${message || "greška"})`
      );
      return;
    }
    const data = await response.json();
    setItems(Array.isArray(data) ? data : []);
    setErrorMsg("");
  };

  const removeItem = async (id) => {
    const response = await fetch(`/api/announcements?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const message = await response.text();
      setErrorMsg(
        `Ne mogu obrisati obavijest. Provjerite postavke. (${message || "greška"})`
      );
      return;
    }
    const data = await response.json();
    setItems(Array.isArray(data) ? data : []);
    setErrorMsg("");
  };

  return (
    <>
      <Head>
        <title>Upravljanje obavijestima</title>
      </Head>
      <div className="hr-appBg">
        <Header />
        <main className="hr-main">
          <div className="hr-container">
            <div className="hr-adminPanel">
              <h1>Upravljanje obavijestima</h1>
              <p>
                Aktivne obavijesti: <strong>{activeCount}</strong>
              </p>
              {errorMsg ? <p style={{ color: "#c00" }}>{errorMsg}</p> : null}

              <form className="hr-adminForm" onSubmit={handleSubmit}>
                <label>
                  Tekst obavijesti
                  <textarea
                    value={form.text}
                    onChange={(event) =>
                      setForm({ ...form, text: event.target.value })
                    }
                    rows={3}
                    placeholder="Upišite obavijest..."
                    required
                  />
                </label>

                <label>
                  Važnost
                  <select
                    value={form.level}
                    onChange={(event) =>
                      setForm({ ...form, level: event.target.value })
                    }
                  >
                    <option value="critical">Crvena - jako važna</option>
                    <option value="important">Zelena - važna</option>
                    <option value="info">Žuta - info</option>
                  </select>
                </label>

                <label className="hr-adminCheckbox">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm({ ...form, active: event.target.checked })
                    }
                  />
                  Aktivna obavijest
                </label>

                <button type="submit" disabled={isSaving}>
                  {isSaving ? "Spremam..." : "Dodaj obavijest"}
                </button>
              </form>

              <div className="hr-adminList">
                {items.length === 0 ? (
                  <p>Nema spremljenih obavijesti.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="hr-adminListItem">
                      <div>
                        <div className="hr-adminListMeta">
                          <span className={`hr-tag hr-tag--${item.level}`}>
                            {item.level === "critical"
                              ? "Crvena"
                              : item.level === "important"
                              ? "Zelena"
                              : "Žuta"}
                          </span>
                          <span>{item.active ? "Aktivna" : "Neaktivna"}</span>
                        </div>
                        <p>{item.text}</p>
                      </div>
                      <div className="hr-adminActions">
                        <button type="button" onClick={() => toggleActive(item.id)}>
                          {item.active ? "Deaktiviraj" : "Aktiviraj"}
                        </button>
                        <button type="button" onClick={() => removeItem(item.id)}>
                          Obriši
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
