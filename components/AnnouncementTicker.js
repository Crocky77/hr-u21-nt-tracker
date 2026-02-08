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
  const [currentIndex, setCurrentIndex] = useState(0);
  const rotationMs = 14000;

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

  useEffect(() => {
    if (activeAnnouncements.length <= 1) {
      setCurrentIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, rotationMs);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length, rotationMs]);

  if (activeAnnouncements.length === 0) return null;

  const currentAnnouncement =
    activeAnnouncements[currentIndex % activeAnnouncements.length];

  return (
    <div className="hr-headerTicker">
      <div className="hr-headerTickerTrack">
        <span
          key={`${currentAnnouncement.id}-${currentIndex}`}
          className={`hr-headerTickerItem hr-headerTickerItem--${currentAnnouncement.level}`}
        >
          {currentAnnouncement.text}
        </span>
      </div>
    </div>
  );
}
