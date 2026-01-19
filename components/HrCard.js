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

  // Auto-detect: ako je ovo "transfer" kartica, oboji je HR bojama (suptilno)
  const isTransfer =
    typeof title === "string" && /transfer/i.test(title || "");

  const transferStyle = isTransfer
    ? {
        // suptilna HR traka + lagani “wash” u pozadini (ne mijenja layout)
        borderTop: "4px solid transparent",
        borderImage:
          "linear-gradient(90deg, #c8102e 0%, #ffffff 50%, #012169 100%) 1",
        background:
          "linear-gradient(135deg, rgba(200,16,46,0.06) 0%, rgba(255,255,255,0.00) 45%, rgba(1,33,105,0.06) 100%)",
      }
    : null;

  const inner = (
    <div>
      <div className="hr-cardTop">
        <div>
          <h3 className="hr-cardTitle" style={{ fontSize: titleSize }}>
            {title}
          </h3>
          {description ? <p className="hr-cardDesc">{description}</p> : null}
        </div>

        {badge ? (
          <span
            className="hr-badge"
            style={
              isTransfer
                ? {
                    // da badge lagano prati HR temu, bez rušenja postojeće stilizacije
                    border: "1px solid rgba(200,16,46,0.35)",
                  }
                : undefined
            }
          >
            {badge}
          </span>
        ) : null}
      </div>

      <span className="hr-openLink">
        Otvori <span aria-hidden="true">→</span>
      </span>
    </div>
  );

  // Disabled = nije klikabilno
  if (disabled || !href) {
    return (
      <div className={cardClass} style={transferStyle || undefined}>
        {inner}
      </div>
    );
  }

  // Cijela kartica klikabilna (3D modul)
  return (
    <Link
      href={href}
      className={cardClass}
      style={{ display: "block", ...(transferStyle || {}) }}
    >
      {inner}
    </Link>
  );
}
