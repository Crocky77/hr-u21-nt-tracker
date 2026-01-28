import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroNew() {
  const router = useRouter();

  useEffect(() => {
    // Redirect after full cinematic sequence (≈7s)
    const timer = setTimeout(() => {
      router.replace("/");
    }, 7000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="intro-root">
      {/* Background */}
      <div className="bg" />

      {/* Content */}
      <div className="content">
        {/* Logo */}
        <img
          src="/intro/logo.png"
          alt="HT U21/NT Tracker"
          className="logo"
        />

        {/* Title */}
        <h1 className="title">Hrvatski U21/NT Tracker</h1>

        {/* Subtitle */}
        <p className="subtitle">powered by Croatia NT Staff</p>
      </div>

      <style jsx>{`
        .intro-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: #000;
        }

        /* Background image */
        .bg {
          position: absolute;
          inset: 0;
          background-image: url("/intro/bg.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        }

        /* Centered content */
        .content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-align: center;

          /* Global fade-out */
          animation: fadeOut 0.9s ease forwards;
          animation-delay: 5.8s;
        }

        /* Logo animation */
        .logo {
          width: 280px;
          max-width: 60vw;
          height: auto;
          opacity: 0;
          transform: scale(0.92);

          animation: logoIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.6s;
        }

        /* Title */
        .title {
          margin-top: 28px;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 0.3px;
          opacity: 0;
          transform: translateY(8px);

          animation: textIn 0.8s ease forwards;
          animation-delay: 2s;
        }

        /* Subtitle */
        .subtitle {
          margin-top: 8px;
          font-size: 14px;
          opacity: 0;

          animation: fadeIn 0.6s ease forwards;
          animation-delay: 2.9s;
        }

        /* Animations */
        @keyframes logoIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
          }
        }

        /* Responsive */
        @media (max-width: 600px) {
          .logo {
            width: 200px;
          }

          .title {
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  );
}
