/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Solutions from './pages/Solutions';
import SolutionDetail from './pages/SolutionDetail';
import Work from './pages/Work';
import WorkDetail from './pages/WorkDetail';
import Press from './pages/Press';
import PressDetail from './pages/PressDetail';
import Careers from './pages/Careers';
import CareerDetail from './pages/CareerDetail';
import CareerApply from './pages/CareerApply';
import Contact from './pages/Contact';

// Admin Pages
import WeAdminLayout from './weadmin/WeAdminLayout';
import AdminLogin from './weadmin/pages/Login';
import AdminDashboard from './weadmin/pages/Dashboard';
import AdminHomepage from './weadmin/pages/HomepageManager';
import AdminPortfolio from './weadmin/pages/PortfolioManager';
import AdminLeads from './weadmin/pages/LeadsManager';
import AdminAIAssistant from './weadmin/pages/AIAssistantManager';
import AdminSettings from './weadmin/pages/Settings';
import AdminSolutions from './weadmin/pages/SolutionsManager';
import AdminClients from './weadmin/pages/ClientsManager';
import AdminCareers from './weadmin/pages/CareersManager';
import AdminServices from './weadmin/pages/ServicesManager';
import AdminPress from './weadmin/pages/PressManager';
import AdminMediaLibrary from './weadmin/pages/MediaLibrary';
import AdminChangelog from './weadmin/pages/ChangelogManager';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin Routes */}
            <Route path="/weadmin/login" element={<AdminLogin />} />
            <Route path="/weadmin" element={<WeAdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="homepage" element={<AdminHomepage />} />
              <Route path="solutions" element={<AdminSolutions />} />
              <Route path="portfolio" element={<AdminPortfolio />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="careers" element={<AdminCareers />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="ai-assistant" element={<AdminAIAssistant />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="press" element={<AdminPress />} />
              <Route path="media" element={<AdminMediaLibrary />} />
              <Route path="changelog" element={<AdminChangelog />} />
              {/* Fallback for other admin routes */}
              <Route path="*" element={<div className="p-8 text-gray-500">Module under construction</div>} />
            </Route>

            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="services/:id" element={<ServiceDetail />} />
              <Route path="solutions" element={<Solutions />} />
              <Route path="solutions/:id" element={<SolutionDetail />} />
              <Route path="work" element={<Work />} />
              <Route path="work/:id" element={<WorkDetail />} />
              <Route path="press" element={<Press />} />
              <Route path="press/:id" element={<PressDetail />} />
              <Route path="careers" element={<Careers />} />
              <Route path="careers/:id" element={<CareerDetail />} />
              <Route path="careers/:id/apply" element={<CareerApply />} />
              <Route path="contact" element={<Contact />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
