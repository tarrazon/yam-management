import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      const userRole = profile.role_custom || 'admin';
      if (userRole === 'commercial') {
        navigate('/PartenairesPage');
      } else if (userRole === 'partenaire') {
        navigate('/PartenairesDashboard');
      } else {
        navigate('/DashboardCRM');
      }
    }
  }, [profile, navigate]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Redirection en cours...</p>
      </div>
    </div>
  );
}