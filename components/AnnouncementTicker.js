import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hr_announcements";
const defaultAnnouncements = [
  {
    id: "welcome",
    text: "Dobrodošli! Pratite novosti vezane za Hrvatski NT / U21 tracker.",
    level: "info",
    active: true,
  },
];

function loadAnnouncements() {
  if (typeof window === "undefined") return defaultAnnouncements;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAnnouncements;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.warn("Neuspjelo čitanje obavijesti.", error);
  }
  return defaultAnnouncements;
}

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);

  useEffect(() => {
    setAnnouncements(loadAnnouncements());
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setAnnouncements(loadAnnouncements());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const activeAnnouncements = useMemo(
    () => announcements.filter((item) => item.active),
    [announcements]
  );

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="hr-headerTicker">
      <div className="hr-headerTickerTrack">
        {activeAnnouncements.map((item) => (
          <span
            key={item.id}
            className={`hr-headerTickerItem hr-headerTickerItem--${item.level}`}
          >
            {item.text}
          </span>
        ))}
        {activeAnnouncements.map((item) => (
          <span
            key={`${item.id}-dup`}
            className={`hr-headerTickerItem hr-headerTickerItem--${item.level}`}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
