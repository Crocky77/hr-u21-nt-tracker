import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroNew() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 6200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="root">
      <div className="bg" />
      <div className="fire" />

      <div className="content">
        <img
          src="/intro/logo.png"
          alt="Hrvatski U21/NT Tracker"
          className="logo"
        />

        <h1 className="title">
          <span>Hrvatski U21/NT Tracker</span>
        </h1>

        <p className="subtitle">powered by Croatia NT Staff</p>
      </div>

      <style jsx>{`
        .root {
          position: fixed;
          inset: 0;
          background: #000;
          overflow: hidden;
        }

        /* BACKGROUND */
        .bg {
          position: absolute;
          inset: 0;
          background: url("/intro/bg.jpg") center / cover no-repeat;
          opacity: 0;
          animation: bgIn 0.8s ease forwards;
        }

        /* FIRE GLOW */
        .fire {
          position: absolute;
          inset: -15%;
          background: radial-gradient(
            35% 30% at 50% 55%,
            rgba(255, 90, 20, 0.55),
            rgba(255, 90, 20, 0.15) 40%,
            transparent 65%
          );
          opacity: 0;
          animation: fireIn 1.4s ease forwards;
          animation-delay: 0.6s;
        }

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

          animation: fadeOut 0.6s ease forwards;
          animation-delay: 5.2s;
        }

        /* LOGO – EMERGE */
        .logo {
          width: 300px;
          max-width: 70vw;
          opacity: 0;
          transform: scale(0.88);
          filter: blur(10px)
            drop-shadow(0 0 0 rgba(255, 120, 40, 0));

          animation: logoIn 1.4s
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.8s;
        }

        /* TITLE – SCRATCH REVEAL */
        .title {
          margin-top: 28px;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 0.3px;
          overflow: hidden;
        }

        .title span {
          display: inline-block;
          transform: translateY(100%);
          animation: scratchUp 1.2s ease forwards;
          animation-delay: 2.4s;
        }

        /* SUBTITLE – FORGE HIT */
        .subtitle {
          margin-top: 10px;
          font-size: 14px;
          opacity: 0;
          transform: scale(0.96);
          animation: forgeIn 0.6s ease forwards;
          animation-delay: 3.9s;
        }

        /* ANIMATIONS */
        @keyframes bgIn {
          to { opacity: 1; }
        }

        @keyframes fireIn {
          to { opacity: 1; }
        }

        @keyframes logoIn {
          0% {
            opacity: 0;
            transform: scale(0.88);
            filter: blur(10px)
              drop-shadow(0 0 0 rgba(255, 120, 40, 0));
          }
          70% {
            opacity: 1;
            transform: scale(1.02);
            filter: blur(2px)
              drop-shadow(0 18px 36px rgba(255, 120, 40, 0.6));
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0)
              drop-shadow(0 22px 44px rgba(0, 0, 0, 0.75));
          }
        }

        @keyframes scratchUp {
          to { transform: translateY(0); }
        }

        @keyframes forgeIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeOut {
          to { opacity: 0; }
        }

        @media (max-width: 600px) {
          .logo { width: 220px; }
          .title { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}
