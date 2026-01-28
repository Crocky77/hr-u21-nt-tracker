import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function IntroPage() {
  const router = useRouter();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 4700);
    const redirectTimer = setTimeout(() => router.replace("/"), 5200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <>
      <div className={`intro ${fade ? "fade-out" : ""}`}>
        <div className="ball" />

        <div className="text">
          <h1>Hrvatski U21/NT Tracker</h1>
          <p>powered by Croatia NT Staff</p>
        </div>
      </div>

      <style jsx>{`
        .intro {
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, #0b3d2e, #1e7f43, #0b3d2e);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial,
            sans-serif;
          transition: opacity 0.5s ease;
        }

        .fade-out {
          opacity: 0;
        }

        /* FOOTBALL BALL */
        .ball {
          position: absolute;
          bottom: -100px;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background:
            repeating-linear-gradient(
              45deg,
              #ffffff,
              #ffffff 12px,
              #d40000 12px,
              #d40000 24px
            );
          animation: kick 2.2s ease-out forwards,
            spin 1.2s linear infinite;
          box-shadow:
            0 0 25px rgba(255, 255, 255, 0.35),
            0 20px 40px rgba(0, 0, 0, 0.45);
        }

        @keyframes kick {
          from {
            transform: translateY(0) scale(1);
          }
          to {
            transform: translateY(-420px) scale(0.85);
          }
        }

        @keyframes spin {
          from {
            rotate: 0deg;
          }
          to {
            rotate: 360deg;
          }
        }

        /* TEXT */
        .text {
          text-align: center;
          color: #ffffff;
          z-index: 1;
        }

        h1 {
          font-size: 48px;
          margin: 0;
          opacity: 0;
          animation: titleIn 1.2s ease-out 0.6s forwards;
          text-shadow: 0 4px 14px rgba(0, 0, 0, 0.55);
        }

        p {
          margin-top: 14px;
          font-size: 18px;
          opacity: 0;
          animation: fadeIn 1s ease-out 1.6s forwards;
        }

        @keyframes titleIn {
          from {
            transform: scale(0.85);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 32px;
          }
          p {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}
