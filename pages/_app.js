import "../styles/globals.css";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // INTRO STRANICA — bez layouta
  if (router.pathname === "/intro") {
    return <Component {...pageProps} />;
  }

  // SVE OSTALE STRANICE — zajednički header + background logika
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
