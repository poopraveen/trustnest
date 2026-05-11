import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Youtube, ExternalLink } from "lucide-react";
import { brand } from "@/lib/brand";

const NAV_HREFS = [
  ["/expenditure", "expenditure"],
  ["/scorecards", "scorecards"],
  ["/projects", "projects"],
  ["/schemes", "schemes"],
  ["/grievances", "grievances"],
  ["/tenders", "tenders"],
] as const;

const OPEN_DATA = [
  ["budgetData", "https://tnbudget.tn.gov.in"],
  ["pfmsPortal", "https://pfms.nic.in"],
  ["grievancePortal", "https://pgportal.gov.in"],
  ["tnTenders", "https://tenders.tn.gov.in"],
  ["eGramSwaraj", "https://egramswaraj.gov.in"],
] as const;

export default async function Footer() {
  const t = await getTranslations("footerGov");
  const tn = await getTranslations("navGov");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                TN<span className="text-blue-400">Vettri</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4 max-w-xs">
              {t("description")}
            </p>
            <p className="text-xs text-slate-500 font-tamil">
              {t("taglineTamil")}
            </p>
            <div className="flex gap-3 mt-4">
              {brand.social.facebook && brand.social.facebook !== "" && (
                <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-primary-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {brand.social.twitter && brand.social.twitter !== "" && (
                <a href={brand.social.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-primary-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-700 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {brand.social.youtube && brand.social.youtube !== "" && (
                <a href={brand.social.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-primary-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-700 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {t("explore")}
            </h3>
            <ul className="space-y-2.5">
              {NAV_HREFS.map(([href, key]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {tn(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {t("openDataSources")}
            </h3>
            <ul className="space-y-2.5">
              {OPEN_DATA.map(([key, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {t("contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">{brand.officeAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {brand.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href={`mailto:${brand.supportEmail}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {brand.supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-900 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            {t("copyright", { year, brand: brand.name })}
          </p>
          <div className="flex gap-6">
            {[
              ["privacy", "/privacy"],
              ["terms", "/terms"],
              ["openData", "/opendata"],
            ].map(([key, href]) => (
              <Link key={href} href={href} className="text-xs text-slate-500 hover:text-white transition-colors">
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
