import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function IntroPage() {
  const router = useRouter();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 4800);
    const redirectTimer = setTimeout(() => router.replace("/"), 5200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <>
      <div className={`intro ${fade ? "fade-out" : ""}`}>
        {/* GOAL */}
        <div className="goal">
          <div className="net" />
        </div>

        {/* SPARKS */}
        <div className="sparks">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        {/* BALL */}
        <div className="ball" />

        {/* TEXT */}
        <div className="text">
          <h1>Hrvatski U21/NT Tracker</h1>
          <p>powered by Croatia NT Staff</p>
        </div>

        {/* OPTIONAL SOUND (muted by default) */}
        <audio src="/kick.mp3" muted autoPlay />
      </div>

      <style jsx>{`
        .intro {
          position: fixed;
          inset: 0;
          background-color: #ffffff;
          background-image:
            linear-gradient(90deg, rgba(212, 0, 0, 0.06) 50%, transparent 50%),
            linear-gradient(rgba(212, 0, 0, 0.06) 50%, transparent 50%);
          background-size: 80px 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial,
            sans-serif;
          transition: opacity 0.4s ease;
        }

        .fade-out {
          opacity: 0;
        }

        /* GOAL */
        .goal {
          position: absolute;
          bottom: 80px;
          width: 420px;
          height: 220px;
          border: 3px solid rgba(0, 0, 0, 0.2);
          border-bottom: none;
        }

        .net {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              rgba(0, 0, 0, 0.08) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }

        /* BALL */
        .ball {
          position: absolute;
          bottom: -90px;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background-image:
            linear-gradient(90deg, #ffffff 50%, #d40000 50%),
            linear-gradient(#ffffff 50%, #d40000 50%);
          background-size: 30px 30px;
          animation: kick 2.4s ease-out forwards,
            spin 2.8s linear infinite;
          box-shadow:
            0 15px 30px rgba(0, 0, 0, 0.35);
        }

        @keyframes kick {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-380px);
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

        /* SPARKS */
        .sparks span {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(212, 0, 0, 0.7);
          border-radius: 50%;
          animation: spark 1.4s ease-out infinite;
        }

        .sparks span:nth-child(n) {
          left: 50%;
          bottom: 180px;
        }

        @keyframes spark {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(
              calc(-100px + 200px * random()),
              -120px
            );
            opacity: 0;
          }
        }

        /* TEXT */
        .text {
          position: absolute;
          top: 30%;
          text-align: center;
          color: #111;
        }

        h1 {
          font-size: 48px;
          margin: 0;
          opacity: 0;
          animation: titleIn 1.2s ease-out 0.6s forwards;
        }

        p {
          margin-top: 12px;
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
        }
      `}</style>
    </>
  );
}
