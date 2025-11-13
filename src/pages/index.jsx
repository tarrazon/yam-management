import Layout from "./Layout.jsx";

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

const PAGES = {
    
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
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Residences" element={<Residences />} />
                
                <Route path="/Lots" element={<Lots />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/Reservations" element={<Reservations />} />
                
                <Route path="/DashboardCRM" element={<DashboardCRM />} />
                
                <Route path="/Vendeurs" element={<Vendeurs />} />
                
                <Route path="/LotsLMNP" element={<LotsLMNP />} />
                
                <Route path="/Acquereurs" element={<Acquereurs />} />
                
                <Route path="/PartenairesPage" element={<PartenairesPage />} />
                
                <Route path="/ResidencesGestion" element={<ResidencesGestion />} />
                
                <Route path="/NotairesPage" element={<NotairesPage />} />
                
                <Route path="/ContactsPage" element={<ContactsPage />} />
                
                <Route path="/SuiviDossier" element={<SuiviDossier />} />
                
                <Route path="/UsersManagement" element={<UsersManagement />} />
                
                <Route path="/Statistiques" element={<Statistiques />} />
                
                <Route path="/ExportXML" element={<ExportXML />} />
                
                <Route path="/WordPressPluginGuide" element={<WordPressPluginGuide />} />
                
                <Route path="/PartenairesDashboard" element={<PartenairesDashboard />} />
                
                <Route path="/LotsPartenaire" element={<LotsPartenaire />} />
                
                <Route path="/SuiviOptions" element={<SuiviOptions />} />
                
                <Route path="/MesAcquereurs" element={<MesAcquereurs />} />
                
                <Route path="/SuiviOptionsAdmin" element={<SuiviOptionsAdmin />} />
                
                <Route path="/ResidencesPartenaire" element={<ResidencesPartenaire />} />
                
                <Route path="/OnboardingPartenaire" element={<OnboardingPartenaire />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}