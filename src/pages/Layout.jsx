

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Users, Home, FileCheck, Handshake, Building2, Contact, Settings, LogOut, BarChart3, Shield, FileCode, Clock, Mail, Briefcase, Code, HelpCircle, MessageSquare } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Partenaire } from "@/api/entities";
import { formatPartenaireTypes } from "@/utils/partenaireTypes";

const getNavigationItems = (userRole) => {
  const adminItems = [
    {
      title: "Tableau de bord",
      url: createPageUrl("DashboardCRM"),
      icon: LayoutDashboard,
      roles: ['admin'],
    },
    {
      title: "Mon activité",
      url: "/commercial-dashboard",
      icon: LayoutDashboard,
      roles: ['commercial'],
    },
    {
      title: "Suivi de dossier",
      url: createPageUrl("SuiviDossier"),
      icon: FileCheck,
      roles: ['commercial'],
    },
    {
      title: "Résidences",
      url: createPageUrl("ResidencesGestion"),
      icon: Building2,
      roles: ['admin'],
    },
    {
      title: "Gestionnaires",
      url: createPageUrl("GestionnairesPage"),
      icon: Briefcase,
      roles: ['admin'],
    },
    {
      title: "Lots LMNP",
      url: createPageUrl("LotsLMNP"),
      icon: Home,
      roles: ['admin'],
    },
    {
      title: "Suivi de dossier",
      url: createPageUrl("SuiviDossier"),
      icon: FileCheck,
      roles: ['admin'],
    },
    {
      title: "Partenaires",
      url: createPageUrl("PartenairesPage"),
      icon: Handshake,
      roles: ['admin', 'commercial'],
    },
    {
      title: "Vendeurs",
      url: createPageUrl("Vendeurs"),
      icon: Users,
      roles: ['admin'],
    },
    {
      title: "Acquéreurs",
      url: createPageUrl("Acquereurs"),
      icon: Users,
      roles: ['admin'],
    },
    {
      title: "Notaires",
      url: createPageUrl("NotairesPage"),
      icon: FileCheck,
      roles: ['admin'],
    },
    {
      title: "Contacts",
      url: createPageUrl("ContactsPage"),
      icon: Contact,
      roles: ['admin'],
    },
    {
      title: "Suivi des options",
      url: createPageUrl("SuiviOptionsAdmin"),
      icon: Clock,
      roles: ['admin'],
    },
    {
      title: "Statistiques",
      url: createPageUrl("Statistiques"),
      icon: BarChart3,
      roles: ['admin'],
    },
    {
      title: "Gestion utilisateurs",
      url: createPageUrl("UsersManagement"),
      icon: Shield,
      roles: ['admin'],
    },
    {
      title: "Emails de notification",
      url: createPageUrl("NotificationEmails"),
      icon: Mail,
      roles: ['admin'],
    },
    {
      title: "Templates d'emails",
      url: createPageUrl("WorkflowEmailTemplates"),
      icon: FileCode,
      roles: ['admin'],
    },
    {
      title: "API Documentation",
      url: createPageUrl("APIDocumentation"),
      icon: Code,
      roles: ['admin'],
    },
    {
      title: "Gestion FAQ",
      url: "/faq-management",
      icon: HelpCircle,
      roles: ['admin'],
    },
  ];

  const acquereurItems = [
    {
      title: "Mon Espace Client",
      url: "/acquereur-dashboard",
      icon: LayoutDashboard,
      roles: ['acquereur'],
    },
  ];

  const partenaireItems = [
    {
      title: "Mon Espace",
      url: createPageUrl("PartenairesDashboard"),
      icon: LayoutDashboard,
      roles: ['partenaire'],
    },
    {
      title: "Messagerie",
      url: createPageUrl("MessageriePartenaire"),
      icon: MessageSquare,
      roles: ['partenaire'],
    },
    {
      title: "Résidences",
      url: createPageUrl("ResidencesPartenaire"),
      icon: Building2,
      roles: ['partenaire'],
    },
    {
      title: "Lots disponibles",
      url: createPageUrl("LotsPartenaire"),
      icon: Home,
      roles: ['partenaire'],
    },
    {
      title: "Mes Acquéreurs",
      url: createPageUrl("MesAcquereurs"),
      icon: Users,
      roles: ['partenaire'],
    },
    {
      title: "Suivi de dossier",
      url: createPageUrl("SuiviDossierPartenaire"),
      icon: FileCheck,
      roles: ['partenaire'],
    },
    {
      title: "Suivi des options",
      url: createPageUrl("SuiviOptions"),
      icon: Clock,
      roles: ['partenaire'],
    },
  ];

  const allItems = [...adminItems, ...partenaireItems, ...acquereurItems];
  return allItems.filter(item => item.roles.includes(userRole || 'admin'));
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, profile, loading: isLoadingUser, signOut } = useAuth();
  const [partenaireInfo, setPartenaireInfo] = React.useState(null);

  const userRole = profile?.role_custom || 'admin';
  const navigationItems = getNavigationItems(userRole);

  React.useEffect(() => {
    const fetchPartenaireInfo = async () => {
      if (profile?.partenaire_id) {
        try {
          const data = await Partenaire.findMany({ where: { id: profile.partenaire_id } });
          if (data && data.length > 0) {
            setPartenaireInfo(data[0]);
          }
        } catch (error) {
          console.error('Error fetching partenaire info:', error);
        }
      }
    };
    fetchPartenaireInfo();
  }, [profile?.partenaire_id]);

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return children;
  }

  // Afficher un loader pendant le chargement de l'utilisateur
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: #1E40AF;
          --primary-hover: #1E3A8A;
          --accent: #F59E0B;
          --accent-hover: #D97706;
          --background: #F9FAFB;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-[#F9FAFB]">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69145453c61abf56db426be9/20cb93525_yam.jpg" 
                  alt="Y'am Asset Management"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-[#1E40AF] text-lg tracking-tight">Y'am Asset Management</h2>
                <p className="text-xs text-slate-500 font-medium">Gestion LMNP</p>
              </div>
            </div>

            {/* Infos partenaire si applicable - SOUS le nom du CRM */}
            {partenaireInfo && userRole === 'partenaire' && (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-3 h-3 text-[#F59E0B]" />
                  <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wide">Partenaire</p>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">{partenaireInfo.nom}</p>
                {partenaireInfo.contact_principal && (
                  <p className="text-xs text-slate-600 truncate">{partenaireInfo.contact_principal}</p>
                )}
                {partenaireInfo.type_partenaire && formatPartenaireTypes(partenaireInfo.type_partenaire).length > 0 && (
                  <p className="text-xs text-amber-700 font-semibold mt-1">
                    {formatPartenaireTypes(partenaireInfo.type_partenaire)[0]}
                  </p>
                )}
              </div>
            )}
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-slate-50 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-[#1E40AF] text-white hover:bg-[#1E3A8A]' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {profile?.prenom?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E40AF] text-sm truncate">
                    {profile?.prenom && profile?.nom ? `${profile.prenom} ${profile.nom}` : 'Utilisateur'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{profile?.email || user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-[#1E40AF]">Y'am Asset Management</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

