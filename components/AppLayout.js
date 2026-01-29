import Header from './Header';

/**
 * AppLayout:
 * - "home" varijanta: crvena teksturirana pozadina + centrirani sadržaj
 * - "light" varijanta: bijela pozadina (za module/tablice)
 */
export default function AppLayout({
  children,
  fullWidth = false,
  variant = 'light',
  headerTitle = 'Hrvatski U21/NT Tracker',
  showHeaderNav = true,
}) {
  const bgClass = variant === 'home' ? 'hr-homeBg' : 'hr-lightBg';

  return (
    <div className={bgClass}>
      <Header title={headerTitle} showNav={showHeaderNav} />

      <main className="hr-main" style={{ padding: fullWidth ? 0 : '20px 18px' }}>
        {fullWidth ? children : <div className="hr-container">{children}</div>}
      </main>
    </div>
  );
}
