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

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const PAGES = {

    Login: Login,

    Signup: Signup,

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
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="/Dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/Residences" element={
                    <ProtectedRoute>
                        <Residences />
                    </ProtectedRoute>
                } />
                
                <Route path="/Lots" element={
                    <ProtectedRoute>
                        <Lots />
                    </ProtectedRoute>
                } />
                
                <Route path="/Clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />

                <Route path="/Reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />

                <Route path="/DashboardCRM" element={<ProtectedRoute><DashboardCRM /></ProtectedRoute>} />

                <Route path="/Vendeurs" element={<ProtectedRoute><Vendeurs /></ProtectedRoute>} />

                <Route path="/LotsLMNP" element={<ProtectedRoute><LotsLMNP /></ProtectedRoute>} />

                <Route path="/Acquereurs" element={<ProtectedRoute><Acquereurs /></ProtectedRoute>} />

                <Route path="/PartenairesPage" element={<ProtectedRoute><PartenairesPage /></ProtectedRoute>} />

                <Route path="/ResidencesGestion" element={<ProtectedRoute><ResidencesGestion /></ProtectedRoute>} />

                <Route path="/NotairesPage" element={<ProtectedRoute><NotairesPage /></ProtectedRoute>} />

                <Route path="/ContactsPage" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />

                <Route path="/SuiviDossier" element={<ProtectedRoute><SuiviDossier /></ProtectedRoute>} />

                <Route path="/UsersManagement" element={<ProtectedRoute allowedRoles={['admin']}><UsersManagement /></ProtectedRoute>} />

                <Route path="/Statistiques" element={<ProtectedRoute><Statistiques /></ProtectedRoute>} />

                <Route path="/ExportXML" element={<ProtectedRoute><ExportXML /></ProtectedRoute>} />

                <Route path="/WordPressPluginGuide" element={<ProtectedRoute><WordPressPluginGuide /></ProtectedRoute>} />

                <Route path="/PartenairesDashboard" element={<ProtectedRoute allowedRoles={['partenaire']}><PartenairesDashboard /></ProtectedRoute>} />

                <Route path="/LotsPartenaire" element={<ProtectedRoute allowedRoles={['partenaire']}><LotsPartenaire /></ProtectedRoute>} />

                <Route path="/SuiviOptions" element={<ProtectedRoute><SuiviOptions /></ProtectedRoute>} />

                <Route path="/MesAcquereurs" element={<ProtectedRoute><MesAcquereurs /></ProtectedRoute>} />

                <Route path="/SuiviOptionsAdmin" element={<ProtectedRoute allowedRoles={['admin']}><SuiviOptionsAdmin /></ProtectedRoute>} />

                <Route path="/ResidencesPartenaire" element={<ProtectedRoute allowedRoles={['partenaire']}><ResidencesPartenaire /></ProtectedRoute>} />

                <Route path="/OnboardingPartenaire" element={<ProtectedRoute allowedRoles={['partenaire']}><OnboardingPartenaire /></ProtectedRoute>} />
                
            </Routes>
        </Layout>
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