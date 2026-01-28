import Head from "next/head";

export default function IntroNew() {
  return (
    <>
      <Head>
        <title>Hrvatski U21/NT Tracker</title>
      </Head>

      <div className="intro-root">
        <div className="overlay" />

        <div className="content">
          <img
            src="/intro/logo.png"
            alt="HT U21/NT Tracker"
            className="logo"
          />

          <h1>Hrvatski U21/NT Tracker</h1>
          <p>powered by Croatia NT Staff</p>
        </div>
      </div>

      <style jsx>{`
        .intro-root {
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
          background: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 0.25) 0%,
            rgba(0, 0, 0, 0.65) 100%
          );
        }

        .content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: #ffffff;
          padding: 40px;
        }

        .logo {
          width: 320px;
          max-width: 80vw;
          margin-bottom: 28px;
          filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.6));
        }

        h1 {
          font-size: 36px;
          font-weight: 800;
          margin: 0;
          letter-spacing: 0.5px;
        }

        p {
          margin-top: 10px;
          font-size: 14px;
          opacity: 0.85;
          letter-spacing: 0.3px;
        }

        @media (max-width: 600px) {
          .logo {
            width: 220px;
          }

          h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </>
  );
}
