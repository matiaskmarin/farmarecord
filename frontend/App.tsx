import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Login } from './components/auth/Login';
import { Layout } from './components/layout/Layout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientList } from './components/admin/ClientList';
import { ClientDetail } from './components/admin/ClientDetail';
import { PendingDeliveries } from './components/admin/PendingDeliveries';
import { AdminInquiries } from './components/admin/AdminInquiries';
import { AdminHistory } from './components/admin/AdminHistory';
import { ClientDashboard } from './components/client/ClientDashboard';
import { ClientNotifications } from './components/client/ClientNotifications';
import { ClientInquiries } from './components/client/ClientInquiries';
import { ClientProfile } from './components/client/ClientProfile';

const MainApp: React.FC = () => {
  const { currentUser } = useAppContext();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  if (!currentUser) {
    return <Login />;
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'client_detail') {
      setSelectedClientId(null);
    }
  };

  const renderAdminView = () => {
    if (selectedClientId) {
      return <ClientDetail clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />;
    }
    switch (currentView) {
      case 'dashboard': return <AdminDashboard />;
      case 'clients': return <ClientList onSelectClient={(id) => { setSelectedClientId(id); setCurrentView('client_detail'); }} />;
      case 'inquiries': return <AdminInquiries />;
      case 'pending': return <PendingDeliveries />;
      case 'history': return <AdminHistory />;
      default: return <AdminDashboard />;
    }
  };

  const renderClientView = () => {
    switch (currentView) {
      case 'dashboard': return <ClientDashboard />;
      case 'inquiries': return <ClientInquiries />;
      case 'notifications': return <ClientNotifications />;
      case 'profile': return <ClientProfile />;
      case 'history': return <div className="p-8 text-center text-slate-500">Módulo de Historial en desarrollo.</div>;
      default: return <ClientDashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {currentUser.role === 'admin' ? renderAdminView() : renderClientView()}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
