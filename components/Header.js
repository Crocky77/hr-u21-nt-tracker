import Image from "next/image";

export default function Header({ user }) {
  return (
    <header style={styles.wrapper}>
      <div style={styles.inner}>
        <div style={styles.left}>
          <Image
            src="/logo.png"
            alt="Hrvatski U21/NT Tracker"
            width={48}
            height={48}
          />
          <span style={styles.title}>
            Hrvatski U21/NT Tracker
          </span>
        </div>

        <div style={styles.right}>
          {user ? (
            <span style={styles.user}>
              Dobrodošao: {user.email} <strong>(admin)</strong>
            </span>
          ) : (
            <span style={styles.user}>Nisi prijavljen</span>
          )}
        </div>
      </div>

      {/* crvena linija */}
      <div style={styles.divider} />
    </header>
  );
}

const styles = {
  wrapper: {
    background: "linear-gradient(90deg, #120000, #3a0000)",
  },
  inner: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  title: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  right: {
    color: "#ddd",
    fontSize: "14px",
  },
  user: {
    opacity: 0.9,
  },
  divider: {
    height: "2px",
    background: "#c40000",
  },
};
