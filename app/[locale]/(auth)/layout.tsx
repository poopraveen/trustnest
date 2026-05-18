import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { Home } from "lucide-react";
import { BrandWordmark } from "@/components/BrandWordmark";
import OAuthSetupHint from "@/components/OAuthSetupHint";
import { brand } from "@/lib/brand";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("authLayout");
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex flex-col">
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <BrandWordmark className="text-xl text-white" prefixClassName="text-white" />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <OAuthSetupHint />
        {children}
      </main>

      <footer className="p-4 text-center text-xs text-primary-300">
        {t("copyright", { year, brand: brand.name })}
      </footer>
    </div>
  );
}
