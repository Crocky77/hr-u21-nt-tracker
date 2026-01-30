import Header from "./Header";

export default function AppLayout({ children, user = null }) {
  return (
    <>
      <Header user={user} />
      <main>{children}</main>
    </>
  );
}
