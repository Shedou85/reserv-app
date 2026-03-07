"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  CalendarCheck,
  Calendar,
  CreditCard,
  Bell,
  Users,
  Languages,
  UserPlus,
  Settings,
  Share2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/layout/landing-header";
import { LandingFooter } from "@/components/layout/landing-footer";

const FEATURES = [
  { icon: CalendarCheck, key: "booking" },
  { icon: Calendar, key: "calendar" },
  { icon: CreditCard, key: "payments" },
  { icon: Bell, key: "notifications" },
  { icon: Users, key: "clients" },
  { icon: Languages, key: "multilang" },
];

const STEPS = [
  { icon: UserPlus, key: "step1" },
  { icon: Settings, key: "step2" },
  { icon: Share2, key: "step3" },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <LandingHeader />

      {/* Hero */}
      <section className="bg-booking-gradient">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28 md:py-36">
          <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-sm">
            {t("app.name")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {t("landing.hero_title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            {t("landing.hero_subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full rounded-xl px-8 text-base sm:w-auto">
                {t("landing.hero_cta")}
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="w-full rounded-xl px-8 text-base sm:w-auto">
                {t("landing.hero_cta_secondary")}
              </Button>
            </a>
          </div>

          {/* Hero visual — glass booking card mockup */}
          <div className="mx-auto mt-12 max-w-md sm:mt-16">
            <div className="glass-strong rounded-2xl p-6 text-left shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t("app.name")}</p>
                  <p className="text-xs text-muted-foreground">{t("booking.select_service")}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {["Kirpimas · 30 min. · €15", "Dažymas · 90 min. · €45", "Manikiūras · 60 min. · €25"].map((item) => (
                  <div key={item} className="glass rounded-xl px-4 py-3 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {t("landing.features_title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">
              {t("landing.features_subtitle")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="glass rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {t(`landing.feature_${key}`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t(`landing.feature_${key}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {t("landing.how_title")}
            </h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              {t("landing.how_subtitle")}
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, key }, index) => (
              <div key={key} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-1 text-xs font-bold text-primary">
                  {index + 1}
                </div>
                <h3 className="mt-3 text-lg font-semibold">
                  {t(`landing.how_${key}_title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`landing.how_${key}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {t("landing.pricing_title")}
            </h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              {t("landing.pricing_subtitle")}
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {/* Free plan */}
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold">{t("landing.pricing_free")}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{t("landing.pricing_free_price")}</span>
                <span className="text-muted-foreground">{t("landing.pricing_free_period")}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {["f1", "f2", "f3", "f4"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {t(`landing.pricing_free_${f}`)}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 block">
                <Button variant="outline" className="w-full rounded-xl">
                  {t("landing.pricing_cta_free")}
                </Button>
              </Link>
            </div>

            {/* Premium plan */}
            <div className="glass-strong relative rounded-2xl border-2 border-primary p-6 sm:p-8">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3">
                {t("landing.pricing_popular")}
              </Badge>
              <h3 className="text-lg font-semibold">{t("landing.pricing_premium")}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{t("landing.pricing_premium_price")}</span>
                <span className="text-muted-foreground">{t("landing.pricing_premium_period")}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {["f1", "f2", "f3", "f4", "f5"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {t(`landing.pricing_premium_${f}`)}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 block">
                <Button className="w-full rounded-xl">
                  {t("landing.pricing_cta_premium")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-booking-gradient py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="glass-strong mx-auto max-w-2xl rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.cta_title")}
            </h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              {t("landing.cta_subtitle")}
            </p>
            <Link href="/register" className="mt-8 inline-block">
              <Button size="lg" className="rounded-xl px-8 text-base">
                {t("landing.hero_cta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
