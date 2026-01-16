// components/HrCard.js
import Link from "next/link";

export default function HrCard({
  title,
  description,
  badge,
  href,
  disabled = false,
  compact = false,
}) {
  const cardClass = `hr-card ${disabled ? "hr-disabled" : ""}`;
  const titleSize = compact ? 18 : 20;

  const inner = (
    <div>
      <div className="hr-cardTop">
        <div>
          <h3 className="hr-cardTitle" style={{ fontSize: titleSize }}>
            {title}
          </h3>
          {description ? <p className="hr-cardDesc">{description}</p> : null}
        </div>
        {badge ? <span className="hr-badge">{badge}</span> : null}
      </div>

      <span className="hr-openLink">
        Otvori <span aria-hidden="true">→</span>
      </span>
    </div>
  );

  // Disabled = nije klikabilno
  if (disabled || !href) {
    return <div className={cardClass}>{inner}</div>;
  }

  // Cijela kartica klikabilna (3D modul)
  return (
    <Link href={href} className={cardClass} style={{ display: "block" }}>
      {inner}
    </Link>
  );
}
