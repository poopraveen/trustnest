import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { Home, Search } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-primary-100 mb-2">404</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t("title")}</h1>
        <p className="text-slate-500 mb-6">
          {t("description")}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            {t("goHome")}
          </Link>
          <Link href="/properties" className="btn-secondary">
            <Search className="w-4 h-4" />
            {t("browseProperties")}
          </Link>
        </div>
      </div>
    </div>
  );
}
