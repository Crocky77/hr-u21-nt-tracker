import Header from "./Header";

export default function AppLayout({ children }) {
  return (
    <div className="hr-homeBg">
      <Header />
      <main className="hr-main">{children}</main>
    </div>
  );
}
