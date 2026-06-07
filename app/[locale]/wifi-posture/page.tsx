import type { Metadata } from "next";
import WifiPostureClient from "@/components/wifi-posture/WifiPostureClient";

export const metadata: Metadata = {
  title: "WiFi Body Posture Detection | TrustNest",
  description:
    "Detect human body posture in real time using WiFi CSI signals and deep learning — no camera, no wearable, just AI.",
  openGraph: {
    title: "WiFi Body Posture Detection | TrustNest",
    description:
      "No Camera. No Wearable. Just WiFi Signals + AI — 24 body regions mapped through walls.",
  },
};

export default function WifiPosturePage() {
  return <WifiPostureClient />;
}
