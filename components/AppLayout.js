import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout({ children, user = null }) {
  return (
    <>
      <Header user={user} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
