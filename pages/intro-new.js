import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroNew() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

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
          overflow: hidden;
        }

        /* Tamni cinematic overlay */
        .overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.85)
          );
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: #ffffff;
          animation: fadeIn 1.6s ease-out;
        }

        .logo {
          width: 340px;
          max-width: 80vw;
          height: auto;
          margin-bottom: 28px;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.7));
        }

        h1 {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin: 0;
        }

        p {
          margin-top: 12px;
          font-size: 16px;
          opacity: 0.85;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
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
