import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  // Rediriger vers DashboardCRM ou PartenairesPage selon le rôle
  useEffect(() => {
    base44.auth.me().then(user => {
      const userRole = user?.role_custom || 'admin';
      if (userRole === 'commercial') {
        window.location.href = createPageUrl("PartenairesPage");
      } else {
        window.location.href = createPageUrl("DashboardCRM");
      }
    }).catch(() => {
      window.location.href = createPageUrl("DashboardCRM");
    });
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Redirection en cours...</p>
      </div>
    </div>
  );
}