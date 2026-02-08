import { useEffect, useMemo, useState } from "react";

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const rotationMs = 14000;

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements");
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted) setAnnouncements(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn("Neuspjelo dohvaćanje obavijesti.", error);
      }
    };
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
