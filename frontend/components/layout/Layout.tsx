import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  LayoutDashboard, Users, Package, History, Bell, LogOut, Menu, X, UserCircle, MessageSquare
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const { currentUser, logout, db } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Pacientes', icon: Users },
    { id: 'inquiries', label: 'Consultas Stock', icon: MessageSquare },
    { id: 'pending', label: 'Entregas Pendientes', icon: Package },
    { id: 'history', label: 'Historial General', icon: History },
  ];

  const clientNav = [
    { id: 'dashboard', label: 'Mi Estado', icon: LayoutDashboard },
    { id: 'inquiries', label: 'Consultar Stock', icon: MessageSquare },
    { id: 'profile', label: 'Mis Datos', icon: UserCircle },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'history', label: 'Mi Historial', icon: History },
  ];

  const navItems = currentUser?.role === 'admin' ? adminNav : clientNav;

  const unreadNotifs = currentUser?.role === 'client' 
    ? db.notifications.filter(n => n.clientId === currentUser.id && !n.read).length 
    : 0;

  const pendingInquiries = currentUser?.role === 'admin'
    ? db.inquiries.filter(i => i.status === 'pending_pharmacy').length
    : 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-slate-200 px-4">
          <span className="text-xl font-bold text-primary-700 flex items-center gap-2">
            <Package className="w-6 h-6" /> FarmaGest
          </span>
        </div>
        
        <div className="p-4">
          <div className="mb-6 px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Usuario Actual</p>
            <p className="text-sm font-medium text-slate-900 truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{currentUser?.role === 'admin' ? 'Farmacia' : 'Paciente'}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                  {item.label}
                  {item.id === 'notifications' && unreadNotifs > 0 && (
                    <span className="ml-auto bg-red-500 text-white py-0.5 px-2 rounded-full text-xs">
                      {unreadNotifs}
                    </span>
                  )}
                  {item.id === 'inquiries' && pendingInquiries > 0 && (
                    <span className="ml-auto bg-yellow-500 text-white py-0.5 px-2 rounded-full text-xs">
                      {pendingInquiries}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-end items-center gap-4">
             {/* Header actions could go here */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
