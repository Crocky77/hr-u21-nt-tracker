import { useEffect } from "react";
import { useRouter } from "next/router";
import Lottie from "lottie-react";
import animationData from "../public/intro.json";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 5200); // 5.2 sekunde

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1E7F43",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
