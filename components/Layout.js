import Header from "./Header";
import Footer from "./Footer";

export default function Layout({
  title,
  children,
  mode = "hero", // hero | data
  showNavLinks = false,
}) {
  return (
    <div className={`page ${mode}`}>
      <Header title={title} showNavLinks={showNavLinks} />

      <main className="content">{children}</main>

      <Footer />

      <style jsx>{`
        .page.hero {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.55),
              rgba(0, 0, 0, 0.9)
            ),
            url("/backgrounds/hero-bg.jpg") center top / cover no-repeat;
          color: #ffffff;
        }

        .page.data {
          min-height: 100vh;
          background: #ffffff;
          color: #111111;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 32px;
        }
      `}</style>
    </div>
  );
}
