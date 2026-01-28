import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 5200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Script
        src="https://unpkg.com/@lottiefiles/lottie-player@2.0.5/dist/lottie-player.js"
        strategy="beforeInteractive"
      />

      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#1E7F43",
          overflow: "hidden",
        }}
      >
        <lottie-player
          src="/intro.json"
          autoplay
          loop={false}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </>
  );
}
