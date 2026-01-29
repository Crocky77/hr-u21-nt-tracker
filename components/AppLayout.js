// components/AppLayout.js
import Header from "./Header";

export default function AppLayout({
  children,
  variant = "home", // "home" ili "module"
  headerTitle = "Hrvatski U21/NT Tracker",
}) {
  const pageClass = variant === "home" ? "hr-homePage" : "";

  return (
    <div className={`hr-app ${pageClass}`}>
      <Header title={headerTitle} />
      {children}
    </div>
  );
}
