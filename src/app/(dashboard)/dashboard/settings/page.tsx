"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type WorkingHour = Database["public"]["Tables"]["working_hours"]["Row"];

const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

export default function SettingsPage() {
  const { t } = useTranslation();
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const supabase = useMemo(() => createClient(), []);

  const fetchWorkingHours = useCallback(async () => {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .single();

    if (!business) return;

    const { data } = await supabase
      .from("working_hours")
      .select("*")
      .eq("business_id", business.id)
      .order("day_of_week", { ascending: true });

    if (data) setWorkingHours(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchWorkingHours();
  }, [fetchWorkingHours]);

  function getDayName(day: number): string {
    return t(`settings.days.${day}`);
  }

  function updateHour(dayOfWeek: number, field: keyof WorkingHour, value: string | boolean) {
    setWorkingHours((prev) =>
      prev.map((wh) =>
        wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");

    const results = await Promise.all(
      workingHours.map((wh) =>
        supabase
          .from("working_hours")
          .update({
            is_working: wh.is_working,
            start_time: wh.start_time,
            end_time: wh.end_time,
          })
          .eq("id", wh.id)
      )
    );

    const hasError = results.some((r) => r.error);
    setSaveStatus(hasError ? "error" : "success");
    setSaving(false);
  }

  // Sort working hours by DAYS_OF_WEEK order
  const sortedHours = DAYS_OF_WEEK.map((day) =>
    workingHours.find((wh) => wh.day_of_week === day)
  ).filter(Boolean) as WorkingHour[];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("dashboard.settings")}
        </h2>
        <p className="text-muted-foreground">
          {t("settings.settings_description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.working_hours")}</CardTitle>
          <CardDescription>{t("settings.working_hours_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedHours.map((wh) => (
            <div
              key={wh.day_of_week}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="flex w-28 items-center gap-3">
                <Switch
                  checked={wh.is_working}
                  onCheckedChange={(checked) =>
                    updateHour(wh.day_of_week, "is_working", checked)
                  }
                />
                <Label className="font-medium">
                  {getDayName(wh.day_of_week)}
                </Label>
              </div>

              {wh.is_working ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={wh.start_time}
                    onChange={(e) =>
                      updateHour(wh.day_of_week, "start_time", e.target.value)
                    }
                    className="w-32"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="time"
                    value={wh.end_time}
                    onChange={(e) =>
                      updateHour(wh.day_of_week, "end_time", e.target.value)
                    }
                    className="w-32"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t("settings.day_off")}
                </span>
              )}
            </div>
          ))}

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("common.loading") : t("common.save")}
            </Button>
            {saveStatus === "success" && (
              <span className="text-sm text-green-600">{t("common.success")}</span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-destructive">{t("common.error")}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
