import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BookingWidget } from "@/components/booking/booking-widget";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!business) return { title: "Not Found" };

  return {
    title: `${business.name} | Rezervk.lt`,
    description: business.description || `Užsisakykite pas ${business.name} per Rezervk.lt`,
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch business by slug
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!business) {
    notFound();
  }

  // Fetch services and working hours in parallel
  const [{ data: services }, { data: workingHours }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("working_hours")
      .select("*")
      .eq("business_id", business.id)
      .order("day_of_week", { ascending: true }),
  ]);

  return (
    <div className="bg-booking-gradient min-h-screen">
      {/* Business header */}
      <header className="glass-strong border-b border-white/10">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-4">
            {business.logo_url && (
              <Image
                src={business.logo_url}
                alt={business.name}
                width={72}
                height={72}
                className="h-14 w-14 rounded-xl object-cover shadow-lg ring-2 ring-white/20 sm:h-[72px] sm:w-[72px] sm:rounded-2xl"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl truncate">{business.name}</h1>
              {business.description && (
                <p className="mt-1 text-muted-foreground">{business.description}</p>
              )}
              {business.address && business.city && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {business.address}, {business.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Booking widget */}
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <BookingWidget
          business={business}
          services={services || []}
          workingHours={workingHours || []}
        />
      </main>
    </div>
  );
}
