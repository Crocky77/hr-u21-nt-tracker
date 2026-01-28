import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroNew() {
  const router = useRouter();

  useEffect(() => {
    // Redirect after full sequence (~6.8s)
    const t = setTimeout(() => router.replace("/"), 6800);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="root">
      {/* Background */}
      <div className="bg" />
      {/* Fire glow layers */}
      <div className="fire fire-1" />
      <div className="fire fire-2" />

      {/* Content */}
      <div className="content">
        {/* LOGO */}
        <img
          src="/intro/logo.png"
          alt="Hrvatski U21/NT Tracker"
          className="logo"
        />

        {/* TITLE */}
        <h1 className="title">Hrvatski U21/NT Tracker</h1>

        {/* SUBTITLE */}
        <p className="subtitle">powered by Croatia NT Staff</p>
      </div>

      <style jsx>{`
        /* ROOT */
        .root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: #000;
        }

        /* BACKGROUND */
        .bg {
          position: absolute;
          inset: 0;
          background-image: url("/intro/bg.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: saturate(0.95);
          animation: bgIn 1.1s ease-out forwards;
        }

        /* FIRE GLOW (SIMULATED) */
        .fire {
          position: absolute;
          inset: -20%;
          pointer-events: none;
          opacity: 0;
          mix-blend-mode: screen;
        }

        .fire-1 {
          background: radial-gradient(
            40% 35% at 50% 55%,
            rgba(255, 80, 0, 0.55),
            rgba(255, 80, 0, 0.15) 35%,
            rgba(0, 0, 0, 0) 60%
          );
          animation: firePulse 1.2s ease-out forwards;
          animation-delay: 0.4s;
        }

        .fire-2 {
          background: radial-gradient(
            30% 28% at 50% 52%,
            rgba(255, 160, 60, 0.45),
            rgba(255, 160, 60, 0.12) 30%,
            rgba(0, 0, 0, 0) 55%
          );
          animation: firePulse 1.1s ease-out forwards;
          animation-delay: 0.55s;
        }

        /* CONTENT */
        .content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-align: center;

          /* CLEAN FADE-OUT (short) */
          animation: fadeOut 0.7s ease forwards;
          animation-delay: 5.9s;
        }

        /* LOGO – THEATRICAL ENTRY */
        .logo {
          width: 300px;
          max-width: 70vw;
          height: auto;

          opacity: 0;
          transform: scale(0.86);
          filter: blur(14px)
            drop-shadow(0 0 0 rgba(255, 120, 40, 0));

          animation: logoImpact 1.35s
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.7s;
        }

        /* TITLE */
        .title {
          margin-top: 26px;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 0.3px;

          opacity: 0;
          transform: translateY(10px);
          animation: textIn 0.8s ease forwards;
          animation-delay: 2.3s;
        }

        /* SUBTITLE */
        .subtitle {
          margin-top: 8px;
          font-size: 14px;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards;
          animation-delay: 3.1s;
        }

        /* ANIMATIONS */
        @keyframes bgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes firePulse {
          0% { opacity: 0; }
          60% { opacity: 1; }
          100% { opacity: 0.65; }
        }

        @keyframes logoImpact {
          0% {
            opacity: 0;
            transform: scale(0.86);
            filter: blur(14px)
              drop-shadow(0 0 0 rgba(255, 120, 40, 0));
          }
          65% {
            opacity: 1;
            transform: scale(1.02);
            filter: blur(2px)
              drop-shadow(0 18px 40px rgba(255, 120, 40, 0.65));
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0)
              drop-shadow(0 22px 48px rgba(0, 0, 0, 0.75));
          }
        }

        @keyframes textIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          to { opacity: 0; }
        }

        /* RESPONSIVE */
        @media (max-width: 600px) {
          .logo { width: 220px; }
          .title { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}
