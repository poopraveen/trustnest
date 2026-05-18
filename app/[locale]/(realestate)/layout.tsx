import NavbarRealEstate from "@/components/NavbarRealEstate";
import Footer from "@/components/FooterRealEstate";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/contexts/CartContext";

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <NavbarRealEstate />
      {children}
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
