import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Intro() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 3000); // 3 sekunde

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="intro">
      <div className="overlay" />

      <div className="content">
        <img
          src="/intro/logo.png"
          alt="Hrvatski U21/NT Tracker"
          className="logo"
        />

        <h1>Hrvatski U21/NT Tracker</h1>
        <p>powered by Croatia NT Staff</p>
      </div>

      <style jsx>{`
        .intro {
          position: fixed;
          inset: 0;
          background-image: url("/intro/bg.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
        }

        .content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: #ffffff;
        }

        .logo {
          width: 240px;
          max-width: 70%;
          margin-bottom: 28px;
          opacity: 0;
          animation: fadeScale 1.6s ease-out forwards;
        }

        h1 {
          font-size: 36px;
          font-weight: 800;
          margin: 0;
          opacity: 0;
          animation: fadeUp 1.6s ease-out forwards;
          animation-delay: 0.4s;
        }

        p {
          margin-top: 12px;
          font-size: 16px;
          opacity: 0;
          animation: fadeUp 1.6s ease-out forwards;
          animation-delay: 0.8s;
          color: #e6e6e6;
        }

        @keyframes fadeScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
