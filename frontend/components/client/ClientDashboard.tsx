import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { StatusBadge } from '../ui/Badge';
import { Pill, Calendar, AlertCircle } from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { currentUser, db } = useAppContext();
  
  if (!currentUser || currentUser.role !== 'client') return null;

  const myMeds = db.medications.filter(m => m.clientId === currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activeMeds = myMeds.filter(m => m.status !== 'delivered');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hola, {currentUser.name}</h1>
        <p className="text-slate-500">Aquí puedes ver el estado de tus medicamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Pill className="w-6 h-6" /></div>
          <div><p className="text-sm text-slate-500">Medicamentos Activos</p><p className="text-xl font-bold">{activeMeds.length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600"><Calendar className="w-6 h-6" /></div>
          <div><p className="text-sm text-slate-500">Listos para retirar</p><p className="text-xl font-bold">{activeMeds.filter(m => m.status === 'available').length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Estado Actual</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {activeMeds.map(med => (
            <div key={med.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-900 text-lg">{med.medicationName}</h3>
                <p className="text-sm text-slate-500">Cantidad: {med.quantity}</p>
                {med.notes && <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100"><AlertCircle className="w-4 h-4 inline mr-1 text-slate-400"/>{med.notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={med.status} />
                {med.estPickupDate && med.status !== 'available' && (
                  <span className="text-xs text-slate-500">Est. Retiro: {med.estPickupDate}</span>
                )}
              </div>
            </div>
          ))}
          {activeMeds.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No tienes medicamentos en proceso actualmente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
