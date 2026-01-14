// components/HrCard.js
import Link from "next/link";

export function HrHero({ title, subtitle, right }) {
  return (
    <div style={styles.heroWrap}>
      <div style={styles.hrStripe} aria-hidden="true" />
      <div style={styles.heroInner}>
        <div style={styles.badge} aria-hidden="true" />
        <div style={{ flex: 1 }}>
          <div style={styles.heroTitle}>{title}</div>
          {subtitle ? <div style={styles.heroSub}>{subtitle}</div> : null}
        </div>
        {right ? <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{right}</div> : null}
      </div>
    </div>
  );
}

export function HrCardLink({ href, title, subtitle, tag }) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{ ...styles.card, cursor: "pointer" }}>
        {tag ? <div style={styles.tag}>{tag}</div> : null}
        <div style={styles.cardTitle}>{title}</div>
        {subtitle ? <div style={styles.cardSub}>{subtitle}</div> : null}
        <div style={styles.open}>Otvori →</div>
      </div>
    </Link>
  );
}

export function HrCard({ title, subtitle, tag }) {
  return (
    <div style={styles.card}>
      {tag ? <div style={styles.tag}>{tag}</div> : null}
      <div style={styles.cardTitle}>{title}</div>
      {subtitle ? <div style={styles.cardSub}>{subtitle}</div> : null}
    </div>
  );
}

const styles = {
  heroWrap: {
    background: "rgba(255,255,255,0.90)",
    border: "1px solid rgba(0,0,0,0.14)",
    borderRadius: 14,
    overflow: "hidden",
  },
  hrStripe: {
    height: 8,
    background:
      "linear-gradient(90deg, #c8102e 0%, #c8102e 33%, #ffffff 33%, #ffffff 66%, #0a3d91 66%, #0a3d91 100%)",
  },
  heroInner: {
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  // Suptilna “šahovnica” ikonica
  badge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)",
    backgroundImage:
      "linear-gradient(45deg, rgba(200,16,46,0.95) 25%, transparent 25%, transparent 75%, rgba(200,16,46,0.95) 75%, rgba(200,16,46,0.95)), linear-gradient(45deg, rgba(200,16,46,0.95) 25%, transparent 25%, transparent 75%, rgba(200,16,46,0.95) 75%, rgba(200,16,46,0.95))",
    backgroundSize: "12px 12px",
    backgroundPosition: "0 0, 6px 6px",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  heroTitle: { fontSize: 32, fontWeight: 900, lineHeight: 1.1 },
  heroSub: { opacity: 0.78, marginTop: 6, lineHeight: 1.35 },

  card: {
    position: "relative",
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(0,0,0,0.14)",
    borderRadius: 14,
    padding: 18,
    minHeight: 120, // veće
    boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
  },
  tag: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 12,
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.85)",
    color: "#fff",
  },
  cardTitle: { fontSize: 22, fontWeight: 900 },
  cardSub: { opacity: 0.78, marginTop: 8, lineHeight: 1.35 },
  open: { marginTop: 12, fontWeight: 900, textDecoration: "underline" },
};
