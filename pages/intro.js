import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    // load lottie web component
    import("@lottiefiles/lottie-player");

    const timer = setTimeout(() => {
      router.replace("/");
    }, 5200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
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
  );
}
