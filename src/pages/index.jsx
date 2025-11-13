import Layout from "./Layout.jsx";

import Login from "./Login";

import Signup from "./Signup";

import Dashboard from "./Dashboard";

import Residences from "./Residences";

import Lots from "./Lots";

import Clients from "./Clients";

import Reservations from "./Reservations";

import DashboardCRM from "./DashboardCRM";

import Vendeurs from "./Vendeurs";

import LotsLMNP from "./LotsLMNP";

import Acquereurs from "./Acquereurs";

import PartenairesPage from "./PartenairesPage";

import ResidencesGestion from "./ResidencesGestion";

import NotairesPage from "./NotairesPage";

import ContactsPage from "./ContactsPage";

import SuiviDossier from "./SuiviDossier";

import UsersManagement from "./UsersManagement";

import Statistiques from "./Statistiques";

import ExportXML from "./ExportXML";

import WordPressPluginGuide from "./WordPressPluginGuide";

import PartenairesDashboard from "./PartenairesDashboard";

import LotsPartenaire from "./LotsPartenaire";

import SuiviOptions from "./SuiviOptions";

import MesAcquereurs from "./MesAcquereurs";

import SuiviOptionsAdmin from "./SuiviOptionsAdmin";

import ResidencesPartenaire from "./ResidencesPartenaire";

import OnboardingPartenaire from "./OnboardingPartenaire";

import ForgotPassword from "./ForgotPassword";

import ResetPassword from "./ResetPassword";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Component to redirect based on user role
function HomeRedirect() {
    const { profile } = useAuth();

    if (profile?.role_custom === 'partenaire') {
        return <Navigate to="/partenairesdashboard" replace />;
    }

    return <Navigate to="/dashboardcrm" replace />;
}

const PAGES = {

    Login: Login,

    Signup: Signup,

    ForgotPassword: ForgotPassword,

    ResetPassword: ResetPassword,

    Dashboard: Dashboard,
    
    Residences: Residences,
    
    Lots: Lots,
    
    Clients: Clients,
    
    Reservations: Reservations,
    
    DashboardCRM: DashboardCRM,
    
    Vendeurs: Vendeurs,
    
    LotsLMNP: LotsLMNP,
    
    Acquereurs: Acquereurs,
    
    PartenairesPage: PartenairesPage,
    
    ResidencesGestion: ResidencesGestion,
    
    NotairesPage: NotairesPage,
    
    ContactsPage: ContactsPage,
    
    SuiviDossier: SuiviDossier,
    
    UsersManagement: UsersManagement,
    
    Statistiques: Statistiques,
    
    ExportXML: ExportXML,
    
    WordPressPluginGuide: WordPressPluginGuide,
    
    PartenairesDashboard: PartenairesDashboard,
    
    LotsPartenaire: LotsPartenaire,
    
    SuiviOptions: SuiviOptions,
    
    MesAcquereurs: MesAcquereurs,
    
    SuiviOptionsAdmin: SuiviOptionsAdmin,
    
    ResidencesPartenaire: ResidencesPartenaire,
    
    OnboardingPartenaire: OnboardingPartenaire,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/" element={
                <Layout currentPageName={currentPage}>
                    <ProtectedRoute>
                        <HomeRedirect />
                    </ProtectedRoute>
                </Layout>
            } />

            <Route path="/Dashboard" element={
                <Layout currentPageName={currentPage}>
                    <ProtectedRoute>
                        <DashboardCRM />
                    </ProtectedRoute>
                </Layout>
            } />

            <Route path="/Residences" element={
                <Layout currentPageName={currentPage}>
                    <ProtectedRoute>
                        <Residences />
                    </ProtectedRoute>
                </Layout>
            } />

            <Route path="/Lots" element={
                <Layout currentPageName={currentPage}>
                    <ProtectedRoute>
                        <Lots />
                    </ProtectedRoute>
                </Layout>
            } />

            <Route path="/Clients" element={<Layout currentPageName={currentPage}><ProtectedRoute><Clients /></ProtectedRoute></Layout>} />

            <Route path="/Reservations" element={<Layout currentPageName={currentPage}><ProtectedRoute><Reservations /></ProtectedRoute></Layout>} />

            <Route path="/DashboardCRM" element={<Layout currentPageName={currentPage}><ProtectedRoute><DashboardCRM /></ProtectedRoute></Layout>} />

            <Route path="/Vendeurs" element={<Layout currentPageName={currentPage}><ProtectedRoute><Vendeurs /></ProtectedRoute></Layout>} />

            <Route path="/LotsLMNP" element={<Layout currentPageName={currentPage}><ProtectedRoute><LotsLMNP /></ProtectedRoute></Layout>} />

            <Route path="/Acquereurs" element={<Layout currentPageName={currentPage}><ProtectedRoute><Acquereurs /></ProtectedRoute></Layout>} />

            <Route path="/PartenairesPage" element={<Layout currentPageName={currentPage}><ProtectedRoute><PartenairesPage /></ProtectedRoute></Layout>} />

            <Route path="/ResidencesGestion" element={<Layout currentPageName={currentPage}><ProtectedRoute><ResidencesGestion /></ProtectedRoute></Layout>} />

            <Route path="/NotairesPage" element={<Layout currentPageName={currentPage}><ProtectedRoute><NotairesPage /></ProtectedRoute></Layout>} />

            <Route path="/ContactsPage" element={<Layout currentPageName={currentPage}><ProtectedRoute><ContactsPage /></ProtectedRoute></Layout>} />

            <Route path="/SuiviDossier" element={<Layout currentPageName={currentPage}><ProtectedRoute><SuiviDossier /></ProtectedRoute></Layout>} />

            <Route path="/UsersManagement" element={<Layout currentPageName={currentPage}><ProtectedRoute allowedRoles={['admin']}><UsersManagement /></ProtectedRoute></Layout>} />

            <Route path="/Statistiques" element={<Layout currentPageName={currentPage}><ProtectedRoute><Statistiques /></ProtectedRoute></Layout>} />

            <Route path="/ExportXML" element={<Layout currentPageName={currentPage}><ProtectedRoute><ExportXML /></ProtectedRoute></Layout>} />

            <Route path="/WordPressPluginGuide" element={<Layout currentPageName={currentPage}><ProtectedRoute><WordPressPluginGuide /></ProtectedRoute></Layout>} />

            <Route path="/PartenairesDashboard" element={<Layout currentPageName={currentPage}><ProtectedRoute allowedRoles={['partenaire']}><PartenairesDashboard /></ProtectedRoute></Layout>} />

            <Route path="/LotsPartenaire" element={<Layout currentPageName={currentPage}><ProtectedRoute allowedRoles={['partenaire']}><LotsPartenaire /></ProtectedRoute></Layout>} />

            <Route path="/SuiviOptions" element={<Layout currentPageName={currentPage}><ProtectedRoute><SuiviOptions /></ProtectedRoute></Layout>} />

            <Route path="/MesAcquereurs" element={<Layout currentPageName={currentPage}><ProtectedRoute><MesAcquereurs /></ProtectedRoute></Layout>} />

            <Route path="/SuiviOptionsAdmin" element={<Layout currentPageName={currentPage}><ProtectedRoute allowedRoles={['admin']}><SuiviOptionsAdmin /></ProtectedRoute></Layout>} />

            <Route path="/ResidencesPartenaire" element={<Layout currentPageName={currentPage}><ProtectedRoute allowedRoles={['partenaire']}><ResidencesPartenaire /></ProtectedRoute></Layout>} />

            <Route path="/OnboardingPartenaire" element={<Layout currentPageName={currentPage}><ProtectedRoute allowedRoles={['partenaire']}><OnboardingPartenaire /></ProtectedRoute></Layout>} />

        </Routes>
    );
}

export default function Pages() {
    return (
        <AuthProvider>
            <Router>
                <PagesContent />
            </Router>
        </AuthProvider>
    );
}