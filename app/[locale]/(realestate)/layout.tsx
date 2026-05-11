import NavbarRealEstate from "@/components/NavbarRealEstate";
import Footer from "@/components/FooterRealEstate";

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarRealEstate />
      {children}
      <Footer />
    </>
  );
}
