import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Eye, Plus } from 'lucide-react';

export const ClientList: React.FC<{ onSelectClient: (id: string) => void }> = ({ onSelectClient }) => {
  const { db } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = db.clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dni.includes(searchTerm) ||
    c.obraSocial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-500">Gestión del padrón de pacientes.</p>
        </div>
        {/* Placeholder for adding client manually from admin side if needed, currently handled by public registration */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI u Obra Social..."
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
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">DNI</th>
                <th className="px-6 py-3">Obra Social</th>
                <th className="px-6 py-3">Teléfono</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {client.lastName}, {client.name}
                    {client.isPriority && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Prioritario</span>}
                  </td>
                  <td className="px-6 py-4">{client.dni}</td>
                  <td className="px-6 py-4">
                    {client.obraSocial} <br/>
                    <span className="text-xs text-slate-400">Nº {client.affiliateNumber}</span>
                  </td>
                  <td className="px-6 py-4">{client.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelectClient(client.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Ver Ficha
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron pacientes con esos criterios.
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
