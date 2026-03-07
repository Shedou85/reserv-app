"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, addDays, startOfDay, setHours, setMinutes, isBefore, addMinutes } from "date-fns";
import { lt, ru, enUS } from "date-fns/locale";
import { CalendarCheck, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type WorkingHour = Database["public"]["Tables"]["working_hours"]["Row"];

interface BookingWidgetProps {
  business: Business;
  services: Service[];
  workingHours: WorkingHour[];
}

type Step = "service" | "date" | "time" | "details" | "confirmed";

const DATE_LOCALES = { lt, ru, en: enUS };

export function BookingWidget({ business, services, workingHours }: BookingWidgetProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const locale = DATE_LOCALES[i18n.language as keyof typeof DATE_LOCALES] || lt;

  // Generate next 14 days
  const today = startOfDay(new Date());
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  function getWorkingHoursForDay(date: Date): WorkingHour | undefined {
    const dayOfWeek = date.getDay();
    return workingHours.find((wh) => wh.day_of_week === dayOfWeek && wh.is_working);
  }

  function generateTimeSlots(date: Date): string[] {
    const wh = getWorkingHoursForDay(date);
    if (!wh) return [];

    const [startH, startM] = wh.start_time.split(":").map(Number);
    const [endH, endM] = wh.end_time.split(":").map(Number);
    const duration = selectedService?.duration_minutes || 60;

    const slots: string[] = [];
    let current = setMinutes(setHours(date, startH), startM);
    const end = setMinutes(setHours(date, endH), endM);

    const now = new Date();

    while (isBefore(addMinutes(current, duration), end) || addMinutes(current, duration).getTime() === end.getTime()) {
      // Skip past time slots for today
      if (!isBefore(current, now)) {
        slots.push(format(current, "HH:mm"));
      }
      current = addMinutes(current, 30); // 30-min intervals
    }

    return slots;
  }

  function handleSelectService(service: Service) {
    setSelectedService(service);
    setStep("date");
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  }

  function handleSelectTime(time: string) {
    setSelectedTime(time);
    setStep("details");
  }

  function handleBack() {
    if (step === "date") setStep("service");
    else if (step === "time") setStep("date");
    else if (step === "details") setStep("time");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setBookingError(false);

    const [h, m] = selectedTime.split(":").map(Number);
    const startAt = setMinutes(setHours(selectedDate, h), m);
    const endAt = addMinutes(startAt, selectedService.duration_minutes);

    const { error } = await supabase.from("bookings").insert({
      business_id: business.id,
      service_id: selectedService.id,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone || null,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: "pending",
      stripe_payment_id: null,
      notes: null,
    });

    setSubmitting(false);

    if (error) {
      setBookingError(true);
      return;
    }

    setStep("confirmed");
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {step !== "confirmed" && (
        <div className="flex items-center gap-2">
          {step !== "service" && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex gap-1.5">
            {(["service", "date", "time", "details"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 w-8 rounded-full ${
                  i <= ["service", "date", "time", "details"].indexOf(step)
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select service */}
      {step === "service" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("booking.select_service")}</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <Card
                key={service.id}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => handleSelectService(service)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {service.duration_minutes} {t("services.minutes")}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    €{service.price.toFixed(2)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select date */}
      {step === "date" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("booking.select_date")}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableDates.map((date) => {
              const wh = getWorkingHoursForDay(date);
              const isAvailable = !!wh;

              return (
                <Button
                  key={date.toISOString()}
                  variant={isAvailable ? "outline" : "ghost"}
                  className={`h-auto flex-col py-3 ${!isAvailable ? "opacity-40" : ""}`}
                  disabled={!isAvailable}
                  onClick={() => handleSelectDate(date)}
                >
                  <span className="text-xs text-muted-foreground">
                    {format(date, "EEEE", { locale })}
                  </span>
                  <span className="text-lg font-semibold">
                    {format(date, "d", { locale })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(date, "MMM", { locale })}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Select time */}
      {step === "time" && selectedDate && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("booking.select_time")}</h2>
          <p className="text-muted-foreground">
            {format(selectedDate, "EEEE, d MMMM", { locale })}
          </p>
          {(() => {
            const slots = generateTimeSlots(selectedDate);
            if (slots.length === 0) {
              return (
                <p className="text-muted-foreground">
                  {t("booking.no_available_times")}
                </p>
              );
            }
            return (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    onClick={() => handleSelectTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Step 4: Contact details */}
      {step === "details" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("booking.your_details")}</h2>

          {/* Summary */}
          <Card>
            <CardContent className="p-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {selectedDate && format(selectedDate, "EEEE, d MMMM", { locale })} {t("booking.at")} {selectedTime}
              </p>
              <p className="text-muted-foreground">
                {selectedService?.duration_minutes} {t("services.minutes")} — €{selectedService?.price.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">{t("booking.client_name")}</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t("booking.client_name_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">{t("booking.client_email")}</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder={t("booking.client_email_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">{t("booking.client_phone")}</Label>
              <Input
                id="clientPhone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder={t("booking.client_phone_placeholder")}
              />
            </div>

            {bookingError && (
              <p className="text-sm text-destructive">{t("common.error")}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t("common.loading") : t("booking.confirm_booking")}
            </Button>
          </form>
        </div>
      )}

      {/* Step 5: Confirmation */}
      {step === "confirmed" && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">{t("booking.booking_confirmed")}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("booking.confirmation_message")}
            </p>
            <div className="mt-6 text-sm">
              <p className="font-medium">{selectedService?.name}</p>
              <p className="text-muted-foreground">
                {selectedDate && format(selectedDate, "EEEE, d MMMM", { locale })} {t("booking.at")} {selectedTime}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
