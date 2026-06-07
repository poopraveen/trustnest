import type { Metadata } from "next";
import MeshChatClient from "@/components/mesh-chat/MeshChatClient";

export const metadata: Metadata = {
  title: "Mesh Chat | TrustNest",
  description: "Offline-capable local WiFi chat — works within 1km range with no internet",
};

export default function MeshChatPage() {
  return <MeshChatClient />;
}
