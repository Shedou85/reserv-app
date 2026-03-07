export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: "owner" | "staff";
          avatar_url: string | null;
          locale: "lt" | "ru" | "en";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string | null;
          address: string | null;
          city: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          cover_url: string | null;
          settings: Json | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["businesses"]["Row"], "id" | "created_at" | "is_active" | "settings">;
        Update: Partial<Database["public"]["Tables"]["businesses"]["Insert"]>;
      };
      services: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          currency: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      working_hours: {
        Row: {
          id: string;
          business_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["working_hours"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["working_hours"]["Insert"]>;
      };
      time_blocks: {
        Row: {
          id: string;
          business_id: string;
          start_at: string;
          end_at: string;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["time_blocks"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["time_blocks"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          business_id: string;
          service_id: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          start_at: string;
          end_at: string;
          status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          stripe_payment_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          stripe_session_id: string;
          amount: number;
          currency: string;
          status: "pending" | "paid" | "refunded" | "failed";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          business_id: string;
          client_name: string;
          rating: number;
          comment: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      waitlist: {
        Row: {
          id: string;
          business_id: string;
          service_id: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          preferred_date: string;
          preferred_time_range: string | null;
          status: "waiting" | "notified" | "booked" | "expired";
          notified_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["waitlist"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["waitlist"]["Insert"]>;
      };
      deposits: {
        Row: {
          id: string;
          booking_id: string;
          stripe_payment_intent_id: string;
          amount: number;
          currency: string;
          status: "held" | "captured" | "released" | "refunded";
          refunded_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["deposits"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["deposits"]["Insert"]>;
      };
      business_settings: {
        Row: {
          id: string;
          business_id: string;
          require_deposit: boolean;
          deposit_amount: number | null;
          deposit_type: "fixed" | "percentage" | null;
          cancellation_hours: number;
          no_show_fee: number | null;
          auto_confirm: boolean;
          reminder_hours: number;
          booking_buffer_minutes: number;
          max_advance_days: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["business_settings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["business_settings"]["Insert"]>;
      };
    };
  };
}
