import Header from './Header'
import Footer from './Footer'

export default function Layout({
  title,
  children,
  mode = 'hero', // 'hero' | 'data'
  showNavLinks = false
}) {
  return (
    <div className={`page ${mode}`}>
      <Header title={title} showNavLinks={showNavLinks} />

      <main className="content">
        {children}
      </main>

      <Footer />

      <style jsx>{`
        .page.hero {
          min-height: 100vh;
          background:
            linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.85)),
            url('/backgrounds/hero-bg.jpg') center / cover no-repeat;
          color: #fff;
        }

        .page.data {
          min-height: 100vh;
          background: #ffffff;
          color: #111;
        }

        .content {
          padding: 40px 32px;
        }
      `}</style>
    </div>
  )
}
