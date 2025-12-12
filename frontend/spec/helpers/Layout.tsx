import React from "react";
import { Toaster } from "~/components/ui/sonner";

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <div>
    {children}
    <Toaster />
  </div>
);
