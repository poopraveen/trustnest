import { getTranslations } from "next-intl/server";
import { brand } from "@/lib/brand";

export default async function LocaleLoading() {
  const t = await getTranslations("common");

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">
          {t("loading", { brand: brand.name })}
        </p>
      </div>
    </div>
  );
}
