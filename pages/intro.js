import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 5200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#1E7F43",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          fontWeight: 800,
          animation: "scaleIn 1.2s ease-out forwards",
        }}
      >
        Hrvatski U21/NT Tracker
      </h1>

      <p
        style={{
          marginTop: "16px",
          fontSize: "18px",
          opacity: 0,
          animation: "fadeIn 1s ease-out 1.2s forwards",
        }}
      >
        powered by Croatia NT Staff
      </p>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.85); opacity: 0 }
          to   { transform: scale(1); opacity: 1 }
        }
        @keyframes fadeIn {
          to { opacity: 1 }
        }
      `}</style>
    </div>
  );
}
