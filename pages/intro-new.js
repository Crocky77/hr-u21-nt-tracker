import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroNew() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push("/");
    }, 5200);

    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.background} />

      <img
        src="/intro/logo.png"
        alt="HT U21/NT Tracker"
        style={styles.logo}
      />

      <h1 style={styles.title}>Hrvatski U21/NT Tracker</h1>
      <p style={styles.subtitle}>powered by Croatia NT Staff</p>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url('/intro/bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.35,
    zIndex: 0,
  },
  logo: {
    width: "220px",
    height: "auto",
    zIndex: 1,
    animation: "fadeInScale 1.2s ease-out forwards",
  },
  title: {
    marginTop: "24px",
    fontSize: "36px",
    fontWeight: "800",
    color: "#111",
    zIndex: 1,
    animation: "fadeIn 1.5s ease-out forwards",
  },
  subtitle: {
    marginTop: "8px",
    fontSize: "16px",
    color: "#444",
    zIndex: 1,
    animation: "fadeIn 2s ease-out forwards",
  },
};
