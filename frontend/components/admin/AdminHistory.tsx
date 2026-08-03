import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, PackageCheck } from 'lucide-react';

export const AdminHistory: React.FC = () => {
  const { db } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const deliveries = db.deliveries.sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());

  const filteredDeliveries = deliveries.filter(del => {
    const client = db.clients.find(c => c.id === del.clientId);
    const med = db.medications.find(m => m.id === del.medicationRecordId);
    const searchStr = `${client?.name} ${client?.lastName} ${client?.dni} ${med?.medicationName} ${del.obraSocial}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Historial de Entregas</h1>
        <p className="text-slate-500">Registro general de todas las medicaciones entregadas.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por paciente, DNI, medicación u O.S..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Fecha Retiro</th>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Medicación</th>
                <th className="px-6 py-3">Obra Social</th>
                <th className="px-6 py-3">Cobertura</th>
                <th className="px-6 py-3">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDeliveries.map(del => {
                const client = db.clients.find(c => c.id === del.clientId);
                const med = db.medications.find(m => m.id === del.medicationRecordId);
                return (
                  <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-slate-900">{del.pickupDate}</span>
                        <span className="text-xs text-slate-400">{del.pickupTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{client?.lastName}, {client?.name}</span>
                      <br/><span className="text-xs text-slate-500">DNI: {client?.dni}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{med?.medicationName}</td>
                    <td className="px-6 py-4">{del.obraSocial || client?.obraSocial || '-'}</td>
                    <td className="px-6 py-4">
                      {del.coverage ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{del.coverage}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {del.paymentMethod}
                      {del.amountPaid > 0 && <span className="block text-xs font-medium text-slate-900">${del.amountPaid}</span>}
                    </td>
                  </tr>
                );
              })}
              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron registros de entregas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
