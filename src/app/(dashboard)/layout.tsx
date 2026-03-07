import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile and business
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  // If no business, redirect to onboarding
  if (!business) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell
      user={profile || { id: user.id, email: user.email!, full_name: "", role: "owner", locale: "lt", created_at: "", phone: null, avatar_url: null }}
      business={business}
    >
      {children}
    </DashboardShell>
  );
}
