"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
} from "date-fns";
import { lt, ru, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  services: { name: string } | null;
};

const DATE_LOCALES = { lt, ru, en: enUS };
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);
  const locale = DATE_LOCALES[i18n.language as keyof typeof DATE_LOCALES] || lt;

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)),
    [currentWeek]
  );
  const weekEnd = useMemo(() => addDays(currentWeek, 7), [currentWeek]);
  const today = useMemo(() => new Date(), []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .single();

    if (!business) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*, services(name)")
      .eq("business_id", business.id)
      .gte("start_at", currentWeek.toISOString())
      .lt("start_at", weekEnd.toISOString())
      .neq("status", "cancelled")
      .order("start_at", { ascending: true });

    if (!error && data) setBookings(data as Booking[]);
    setLoading(false);
  }, [supabase, currentWeek, weekEnd]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function getBookingsForDayAndHour(day: Date, hour: number): Booking[] {
    return bookings.filter((b) => {
      const start = parseISO(b.start_at);
      return isSameDay(start, day) && start.getHours() === hour;
    });
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 border-yellow-300 text-yellow-800",
    confirmed: "bg-blue-100 border-blue-300 text-blue-800",
    completed: "bg-green-100 border-green-300 text-green-800",
    no_show: "bg-red-100 border-red-300 text-red-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("dashboard.calendar")}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))
            }
          >
            {t("dashboard.today")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <div className="min-w-[700px]">
            {/* Header — days of week */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
              <div className="border-r p-2" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`border-r p-2 text-center ${
                    isSameDay(day, today) ? "bg-primary/5" : ""
                  }`}
                >
                  <p className="text-xs text-muted-foreground">
                    {format(day, "EEE", { locale })}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isSameDay(day, today)
                        ? "flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </p>
                </div>
              ))}
            </div>

            {/* Time grid */}
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">{t("common.loading")}</p>
              </div>
            ) : (
              HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[60px_repeat(7,1fr)] border-b"
                >
                  <div className="border-r p-1 text-right">
                    <span className="text-xs text-muted-foreground">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                  {weekDays.map((day) => {
                    const dayBookings = getBookingsForDayAndHour(day, hour);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[48px] border-r p-0.5 ${
                          isSameDay(day, today) ? "bg-primary/5" : ""
                        }`}
                      >
                        {dayBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className={`rounded border p-1 text-xs ${
                              statusColors[booking.status] || "bg-gray-100"
                            }`}
                          >
                            <p className="font-medium truncate">
                              {booking.services?.name || "—"}
                            </p>
                            <p className="truncate">{booking.client_name}</p>
                            <p className="text-[10px]">
                              {format(parseISO(booking.start_at), "HH:mm")}–
                              {format(parseISO(booking.end_at), "HH:mm")}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
