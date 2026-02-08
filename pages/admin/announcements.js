import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";

const STORAGE_KEY = "hr_announcements";
const emptyForm = { text: "", level: "info", active: true };

function loadAnnouncements() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.warn("Neuspjelo čitanje obavijesti.", error);
  }
  return [];
}

function saveAnnouncements(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function AnnouncementsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setItems(loadAnnouncements());
  }, []);

  const activeCount = useMemo(
    () => items.filter((item) => item.active).length,
    [items]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.text.trim()) return;
    const next = [
      {
        id: `${Date.now()}`,
        text: form.text.trim(),
        level: form.level,
        active: form.active,
      },
      ...items,
    ];
    setItems(next);
    saveAnnouncements(next);
    setForm(emptyForm);
  };

  const toggleActive = (id) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, active: !item.active } : item
    );
    setItems(next);
    saveAnnouncements(next);
  };

  const removeItem = (id) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    saveAnnouncements(next);
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

                <button type="submit">Dodaj obavijest</button>
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
