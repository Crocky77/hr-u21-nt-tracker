import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 5200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <>
      <div className="intro">
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
          background: linear-gradient(180deg, #0b3d2e, #1e7f43);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial,
            sans-serif;
        }

        .ball {
          position: absolute;
          bottom: -80px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle at 30% 30%, #ffffff, #cccccc);
          border-radius: 50%;
          animation: kick 2.2s ease-out forwards;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
        }

        @keyframes kick {
          from {
            transform: translateY(0) scale(1);
          }
          to {
            transform: translateY(-420px) scale(0.85);
          }
        }

        .text {
          text-align: center;
          color: #ffffff;
        }

        h1 {
          font-size: 48px;
          margin: 0;
          opacity: 0;
          animation: titleIn 1.2s ease-out 0.6s forwards;
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
        }
      `}</style>
    </>
  );
}
