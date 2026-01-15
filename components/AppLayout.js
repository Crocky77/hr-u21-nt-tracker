// components/AppLayout.js

export default function AppLayout({ children }) {
  return (
    <div className="appShell">
      <div className="contentZone">{children}</div>
    </div>
  );
}
