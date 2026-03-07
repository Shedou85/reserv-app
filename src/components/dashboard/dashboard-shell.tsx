"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  LayoutDashboard,
  Scissors,
  Users,
  CalendarCheck,
  Star,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];
type Business = Database["public"]["Tables"]["businesses"]["Row"];

interface DashboardShellProps {
  user: User;
  business: Business;
  children: React.ReactNode;
}

export function DashboardShell({ user, business, children }: DashboardShellProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = useMemo(() => [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard.overview") },
    { href: "/dashboard/calendar", icon: Calendar, label: t("dashboard.calendar") },
    { href: "/dashboard/bookings", icon: CalendarCheck, label: t("dashboard.bookings") },
    { href: "/dashboard/services", icon: Scissors, label: t("dashboard.services") },
    { href: "/dashboard/clients", icon: Users, label: t("dashboard.clients") },
    { href: "/dashboard/reviews", icon: Star, label: t("dashboard.reviews") },
    { href: "/dashboard/marketing", icon: Megaphone, label: t("dashboard.marketing") },
    { href: "/dashboard/stats", icon: BarChart3, label: t("dashboard.stats") },
    { href: "/dashboard/settings", icon: Settings, label: t("dashboard.settings") },
  ], [t]);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return;
    router.push("/login");
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CalendarCheck className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{business.name}</span>
                  <span className="text-xs text-muted-foreground">
                    rezervk.lt/{business.slug}
                  </span>
                </div>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("dashboard.my_business")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton size="lg" />
                  }
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(user.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">{user.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium flex-1">
            {navItems.find((item) => item.href === pathname)?.label ||
              t("dashboard.overview")}
          </h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
