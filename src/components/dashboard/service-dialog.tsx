"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180];

export function ServiceDialog({ open, onClose, service }: ServiceDialogProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [price, setPrice] = useState("");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || "");
      setDurationMinutes(String(service.duration_minutes));
      setPrice(String(service.price));
    } else {
      setName("");
      setDescription("");
      setDurationMinutes("60");
      setPrice("");
    }
    setError(false);
  }, [service, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(false);

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .single();

    if (!business) {
      setSaving(false);
      setError(true);
      return;
    }

    const editableFields = {
      name,
      description: description || null,
      duration_minutes: parseInt(durationMinutes),
      price: parseFloat(price),
      currency: "EUR",
    };

    if (service) {
      // Update only editable fields — preserve is_active and sort_order
      const { error: updateError } = await supabase
        .from("services")
        .update(editableFields)
        .eq("id", service.id);

      if (updateError) {
        setSaving(false);
        setError(true);
        return;
      }
    } else {
      // Get max sort_order for new service
      const { data: existing } = await supabase
        .from("services")
        .select("sort_order")
        .eq("business_id", business.id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const sortOrder = existing && existing.length > 0
        ? existing[0].sort_order + 1
        : 0;

      const { error: insertError } = await supabase.from("services").insert({
        ...editableFields,
        business_id: business.id,
        is_active: true,
        sort_order: sortOrder,
      });

      if (insertError) {
        setSaving(false);
        setError(true);
        return;
      }
    }

    setSaving(false);
    onClose();
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} ${t("services.minutes")}`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return `${h} ${t("services.hours")}`;
    return `${h} ${t("services.hours")} ${m} ${t("services.minutes")}`;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {service ? t("services.edit_service") : t("services.add_service")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("services.service_name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("services.name_placeholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("services.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("services.description_placeholder")}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">{t("services.duration")}</Label>
              <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {formatDuration(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t("services.price")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-7"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{t("common.error")}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
