import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 5200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="intro-root">
      {/* FOOTBALL FIELD LINES */}
      <div className="field-lines" />

      {/* BALL */}
      <div className="ball" />

      {/* CONTENT */}
      <div className="content">
        <h1>Hrvatski U21/NT Tracker</h1>
        <p>powered by Croatia NT Staff</p>
      </div>

      <style>{`
        .intro-root {
          position: fixed;
          inset: 0;
          background: linear-gradient(
            180deg,
            #0b3d2e 0%,
            #1e7f43 60%,
            #0b3d2e 100%
          );
          overflow: hidden;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        }

        /* FIELD */
        .field-lines {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(255,255,255,0.25);
        }

        .field-lines::before,
        .field-lines::after {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          border: 2px solid rgba(255,255,255,0.25);
        }

        .field-lines::before {
          top: 0;
          height: 100%;
          width: 0;
        }

        .field-lines::after {
          top: 50%;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        /* BALL */
        .ball {
          position: absolute;
          bottom: -80px;
          left: 50%;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle at 30% 30%, #fff, #ccc);
          border-radius: 50%;
          transform: translateX(-50%);
          animation: kick 2.2s ease-out forwards;
          box-shadow: 0 20px 40px rgba(0,0,0,0.35);
        }

        @keyframes kick {
          0% {
            transform: translate(-50%, 0) scale(1);
          }
          60% {
            transform: translate(-50%, -420px) scale(0.85);
          }
          100% {
            transform: translate(-50%, -360px) scale(0.9);
          }
        }

        /* CONTENT */
        .content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          pointer-events: none;
        }

        h1 {
          font-size: 48px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin: 0;
          opacity: 0;
          animation: titleIn 1.2s ease-out 0.6s forwards;
          text-shadow: 0 4px 12px rgba(0,0,0,0.45);
        }

        p {
          margin-top: 14px;
          font-size: 18px;
          opacity: 0;
