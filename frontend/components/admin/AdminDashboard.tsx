import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { db } = useAppContext();

  const today = new Date().toISOString().split('T')[0];
  
  const stats = {
    totalClients: db.clients.length,
    pendingMeds: db.medications.filter(m => m.status === 'pending_auth' || m.status === 'authorized').length,
    pendingDeliveries: db.medications.filter(m => m.status === 'available').length,
    deliveredToday: db.deliveries.filter(d => d.pickupDate.startsWith(today)).length,
    outOfStock: db.medications.filter(m => m.status === 'out_of_stock').length,
  };

  // Mock data for chart based on actual data if possible, else static for visual
  const chartData = [
    { name: 'Pendientes', cantidad: stats.pendingMeds },
    { name: 'Para Entregar', cantidad: stats.pendingDeliveries },
    { name: 'Sin Stock', cantidad: stats.outOfStock },
    { name: 'Entregados Hoy', cantidad: stats.deliveredToday },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
        <p className="text-slate-500">Resumen general del estado de la farmacia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pacientes Registrados" value={stats.totalClients} icon={Users} color="blue" />
        <StatCard title="Entregas Pendientes" value={stats.pendingDeliveries} icon={Package} color="green" />
        <StatCard title="Entregados Hoy" value={stats.deliveredToday} icon={CheckCircle2} color="slate" />
        <StatCard title="Alertas Sin Stock" value={stats.outOfStock} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Estado de Medicamentos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Actividad Reciente</h3>
          <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
            {db.audit.slice().reverse().slice(0, 10).map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm border-b border-slate-100 pb-3 last:border-0">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                <div>
                  <p className="text-slate-800">{log.details}</p>
                  <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {db.audit.length === 0 && <p className="text-slate-500 text-sm">No hay actividad reciente.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};
