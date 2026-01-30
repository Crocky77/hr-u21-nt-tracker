import Link from "next/link";

export default function Footer() {
  return (
    <footer style={styles.wrapper}>
      <div style={styles.inner}>
        <Link href="/about" style={styles.link}>O alatu</Link>
        <Link href="/help" style={styles.link}>Pomoć</Link>
        <Link href="/donations" style={styles.link}>Donacije</Link>
        <Link href="/privacy" style={styles.link}>Privacy</Link>
        <Link href="/terms" style={styles.link}>Terms</Link>
      </div>
    </footer>
  );
}

const styles = {
  wrapper: {
    marginTop: "40px",
    padding: "18px 0",
    background: "rgba(30,30,30,0.85)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  inner: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
    gap: "28px",
  },
  link: {
    color: "#cccccc",
    fontSize: "14px",
    textDecoration: "none",
    opacity: 0.85,
  },
};
