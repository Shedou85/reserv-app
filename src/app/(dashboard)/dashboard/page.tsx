"use client";

import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Users, Star, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();

  const stats = [
    {
      title: t("dashboard.total_bookings"),
      value: "0",
      icon: CalendarCheck,
      description: t("dashboard.today"),
    },
    {
      title: t("dashboard.total_revenue"),
      value: "€0",
      icon: TrendingUp,
      description: t("dashboard.today"),
    },
    {
      title: t("dashboard.total_clients"),
      value: "0",
      icon: Users,
      description: "",
    },
    {
      title: t("dashboard.rating"),
      value: "—",
      icon: Star,
      description: "",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.upcoming_bookings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.no_bookings_today")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
