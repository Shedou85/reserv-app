"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "lt", label: "LT" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export function LandingHeader() {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            Rz
          </span>
          <span className="text-lg font-bold tracking-tight">
            Rezervk<span className="text-primary">.lt</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <a href="#features" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("landing.nav_features")}
          </a>
          <a href="#pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("landing.nav_pricing")}
          </a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
              <Globe className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={i18n.language === lang.code ? "font-bold" : ""}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t("auth.login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              {t("landing.start_free")}
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t("landing.nav_features")}
            </a>
            <a
              href="#pricing"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t("landing.nav_pricing")}
            </a>
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            {/* Language pills */}
            <div className="flex gap-1 px-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    i18n.language === lang.code
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">
                {t("auth.login")}
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <Button className="w-full">
                {t("landing.start_free")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
