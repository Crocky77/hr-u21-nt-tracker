import TopBar from "./TopBar";

export default function AppLayout({ children, fullWidth = false }) {
  return (
    <div className="hr-appBg">
      <TopBar />

      <main className="hr-main" style={{ padding: fullWidth ? 0 : "20px 18px" }}>
        {fullWidth ? children : <div className="hr-container">{children}</div>}
      </main>
    </div>
  );
}
