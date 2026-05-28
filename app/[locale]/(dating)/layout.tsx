import NavbarDating from "@/components/dating/NavbarDating";

export default function DatingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarDating />
      <main>{children}</main>
    </>
  );
}
