"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                Rz
              </span>
              <span className="text-lg font-bold tracking-tight">
                Rezervk<span className="text-primary">.lt</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("app.tagline")}
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold">{t("landing.footer_product")}</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("landing.nav_features")}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("landing.nav_pricing")}
                </a>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-semibold">{t("landing.footer_company")}</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">
                  {t("landing.footer_privacy")}
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  {t("landing.footer_terms")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Rezervk.lt. {t("landing.footer_rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
