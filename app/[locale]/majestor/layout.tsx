import { Syne, DM_Sans } from "next/font/google";
import TopBar from "@/components/majestor/layout/TopBar";
import MajesNavbar from "@/components/majestor/layout/MajesNavbar";
import MajesFooter from "@/components/majestor/layout/Footer";
import CartDrawer from "@/components/majestor/layout/CartDrawer";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });

export default function MajestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${syne.variable} ${dmSans.variable} bg-[#0a0c10] min-h-screen`}
      style={{ fontFamily: "var(--font-dm), sans-serif" }}>
      <TopBar />
      <MajesNavbar />
      <CartDrawer />
      <main>{children}</main>
      <MajesFooter />
    </div>
  );
}
