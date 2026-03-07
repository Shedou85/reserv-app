import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingWidget } from "@/components/booking/booking-widget";

interface PageProps {
  params: Promise<{ slug: string }>;
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

  // Fetch active services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Fetch working hours
  const { data: workingHours } = await supabase
    .from("working_hours")
    .select("*")
    .eq("business_id", business.id)
    .order("day_of_week", { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      {/* Business header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex items-center gap-4">
            {business.logo_url && (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{business.name}</h1>
              {business.description && (
                <p className="text-muted-foreground">{business.description}</p>
              )}
              {business.address && business.city && (
                <p className="text-sm text-muted-foreground">
                  {business.address}, {business.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Booking widget */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <BookingWidget
          business={business}
          services={services || []}
          workingHours={workingHours || []}
        />
      </main>
    </div>
  );
}
