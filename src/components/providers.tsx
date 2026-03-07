"use client";

import { useEffect } from "react";
import "@/i18n/config";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n is initialized by importing config
  }, []);

  return <TooltipProvider>{children}</TooltipProvider>;
}
