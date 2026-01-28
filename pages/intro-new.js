import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroNew() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 7500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="intro">
      <div className="content">
        <img
          src="/intro/logo.png"
          alt="HT U21/NT Tracker"
          className="logo"
        />

        <h1 className="title">Hrvatski U21/NT Tracker</h1>
        <p className="subtitle">powered by Croatia NT Staff</p>
      </div>

      <style jsx>{`
        .intro {
          position: fixed;
          inset: 0;
          background-image: url("/intro/bg.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          animation: bgFadeIn 1.5s ease forwards;
        }

        .content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }

        /* LOGO */
        .logo {
          width: 380px;
          max-width: 80vw;
          opacity: 0;
          transform: scale(0.85);
          animation: logoIn 1.5s ease forwards;
          animation-delay: 1.5s;
          background: transparent;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.7));
        }

        /* TITLE */
        .title {
          margin-top: 32px;
          font-size: 42px;
          font-weight: 800;
          opacity: 0;
          animation: textIn 1.2s ease forwards;
          animation-delay: 3.5s;
        }

        /* SUBTITLE */
        .subtitle {
          margin-top: 12px;
          font-size: 16px;
          opacity: 0;
          animation: textIn 1.2s ease forwards;
          animation-delay: 5s;
        }

        /* FADE OUT EVERYTHING */
        .content {
          animation: fadeOut 0.8s ease forwards;
          animation-delay: 6.7s;
        }

        @keyframes bgFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes logoIn {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
