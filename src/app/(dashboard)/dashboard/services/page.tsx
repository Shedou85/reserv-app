"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, MoreHorizontal, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceDialog } from "@/components/dashboard/service-dialog";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];

export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchServices = useCallback(async () => {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .single();

    if (!business) return;

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true });

    if (!error && data) setServices(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  async function handleToggleActive(service: Service) {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);

    if (error) return;

    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, is_active: !s.is_active } : s
      )
    );
  }

  async function handleDelete(serviceId: string) {
    const { error } = await supabase.from("services").delete().eq("id", serviceId);
    if (error) return;
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  }

  function handleEdit(service: Service) {
    setEditingService(service);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingService(null);
    setDialogOpen(true);
  }

  function handleDialogClose() {
    setDialogOpen(false);
    setEditingService(null);
    fetchServices();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-2xl">
            {t("dashboard.services")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("services.manage_description")}
          </p>
        </div>
        <Button onClick={handleAdd} className="self-start sm:self-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("services.add_service")}
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">
              {t("services.no_services")}
            </p>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              {t("services.add_first_service")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: Card-based layout */}
          <div className="space-y-3 sm:hidden">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span>{service.duration_minutes} {t("services.minutes")}</span>
                        <span>€{service.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => handleToggleActive(service)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(service)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <Card className="hidden sm:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>{t("services.service_name")}</TableHead>
                    <TableHead>{t("services.duration")}</TableHead>
                    <TableHead>{t("services.price")}</TableHead>
                    <TableHead>{t("services.status")}</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.duration_minutes} {t("services.minutes")}
                      </TableCell>
                      <TableCell>
                        €{service.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => handleToggleActive(service)}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(service)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(service.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <ServiceDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        service={editingService}
      />
    </div>
  );
}
