"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { lt, ru, enUS } from "date-fns/locale";
import {
  CalendarCheck,
  Users,
  Star,
  TrendingUp,
  Calendar,
  Plus,
  Settings,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  services: { name: string; price: number } | null;
};

const DATE_LOCALES = { lt, ru, en: enUS };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  completed: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
  no_show: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface Stats {
  totalBookings: number;
  todayRevenue: number;
  totalClients: number;
  avgRating: number | null;
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    todayRevenue: 0,
    totalClients: 0,
    avgRating: null,
  });
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);
  const locale =
    DATE_LOCALES[i18n.language as keyof typeof DATE_LOCALES] || lt;

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    // Get business ID
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .single();

    if (!business) {
      setLoading(false);
      return;
    }

    const now = new Date();
    const dayStart = startOfDay(now).toISOString();
    const dayEnd = endOfDay(now).toISOString();

    // Fetch all data in parallel
    const [
      bookingsResult,
      todayResult,
      upcomingResult,
      reviewsResult,
    ] = await Promise.all([
      // Total bookings count
      supabase
        .from("bookings")
        .select("id, client_email", { count: "exact" })
        .eq("business_id", business.id),

      // Today's bookings with service info
      supabase
        .from("bookings")
        .select("*, services(name, price)")
        .eq("business_id", business.id)
        .gte("start_at", dayStart)
        .lt("start_at", dayEnd)
        .neq("status", "cancelled")
        .order("start_at", { ascending: true }),

      // Upcoming bookings (next 5, after now)
      supabase
        .from("bookings")
        .select("*, services(name, price)")
        .eq("business_id", business.id)
        .gte("start_at", now.toISOString())
        .neq("status", "cancelled")
        .order("start_at", { ascending: true })
        .limit(5),

      // Average rating from reviews
      supabase
        .from("reviews")
        .select("rating")
        .eq("business_id", business.id)
        .eq("is_published", true),
    ]);

    // Calculate stats
    const allBookings = bookingsResult.data || [];
    const uniqueClients = new Set(allBookings.map((b) => b.client_email)).size;

    const todayData = (todayResult.data || []) as Booking[];
    const todayRevenue = todayData
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.services?.price || 0), 0);

    const reviews = reviewsResult.data || [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    setStats({
      totalBookings: bookingsResult.count || 0,
      todayRevenue,
      totalClients: uniqueClients,
      avgRating,
    });
    setTodayBookings(todayData);
    setUpcomingBookings((upcomingResult.data || []) as Booking[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: t("dashboard.total_bookings"),
      value: stats.totalBookings.toString(),
      icon: CalendarCheck,
      description: t("dashboard.period_all_time"),
    },
    {
      title: t("dashboard.total_revenue"),
      value: `€${stats.todayRevenue}`,
      icon: TrendingUp,
      description: t("dashboard.period_today"),
    },
    {
      title: t("dashboard.total_clients"),
      value: stats.totalClients.toString(),
      icon: Users,
      description: t("dashboard.period_all_time"),
    },
    {
      title: t("dashboard.rating"),
      value: stats.avgRating ? stats.avgRating.toFixed(1) : "—",
      icon: Star,
      description:
        stats.avgRating ? `★ ${stats.avgRating.toFixed(1)} / 5` : "",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t("dashboard.today_bookings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : todayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.no_bookings_today")}
              </p>
            ) : (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {booking.client_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(booking.start_at), "HH:mm", {
                          locale,
                        })}{" "}
                        · {booking.services?.name}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`ml-2 shrink-0 ${STATUS_STYLES[booking.status] || ""}`}
                    >
                      {t(`dashboard.status_${booking.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              {t("dashboard.upcoming_next")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.no_upcoming")}
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {booking.client_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(booking.start_at), "MMM d, HH:mm", {
                          locale,
                        })}{" "}
                        · {booking.services?.name}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`ml-2 shrink-0 ${STATUS_STYLES[booking.status] || ""}`}
                    >
                      {t(`dashboard.status_${booking.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quick_actions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard/calendar">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Calendar className="h-4 w-4" />
                {t("dashboard.view_calendar")}
              </Button>
            </Link>
            <Link href="/dashboard/services">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Plus className="h-4 w-4" />
                {t("dashboard.add_service")}
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Settings className="h-4 w-4" />
                {t("dashboard.settings")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
