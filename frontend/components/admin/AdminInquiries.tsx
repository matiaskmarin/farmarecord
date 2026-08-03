import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle, XCircle, Clock, MessageSquareReply } from 'lucide-react';
import { Inquiry } from '../../types';

export const AdminInquiries: React.FC = () => {
  const { db, updateInquiryStatus } = useAppContext();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const pendingInquiries = db.inquiries
    .filter(i => i.status === 'pending_pharmacy')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const historyInquiries = db.inquiries
    .filter(i => i.status !== 'pending_pharmacy')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20);

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'available': return <span className="text-green-600 font-medium">Disponible (Esperando confirmación)</span>;
      case 'not_available': return <span className="text-red-600 font-medium">Sin Stock</span>;
      case 'confirmed_by_client': return <span className="text-blue-600 font-medium">Confirmado por Cliente</span>;
      case 'cancelled': return <span className="text-slate-500 font-medium">Cancelado</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consultas de Disponibilidad</h1>
        <p className="text-slate-500">Responde a las consultas de stock y cobertura de los pacientes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" /> Pendientes de Respuesta ({pendingInquiries.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingInquiries.map(inq => {
            const client = db.clients.find(c => c.id === inq.clientId);
            return (
              <div key={inq.id} className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <p className="font-medium text-slate-900 text-lg">{inq.medicationName}</p>
                  <p className="text-sm text-slate-500">Paciente: {client?.lastName}, {client?.name} (DNI: {client?.dni})</p>
                  <p className="text-sm text-slate-500">Obra Social: <span className="font-medium">{client?.obraSocial}</span></p>
                  <p className="text-xs text-slate-400 mt-1">Consultado: {new Date(inq.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <button 
                    onClick={() => setSelectedInquiry(inq)}
                    className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    <MessageSquareReply className="w-4 h-4" /> Responder
                  </button>
                </div>
              </div>
            );
          })}
          {pendingInquiries.length === 0 && (
            <div className="p-8 text-center text-slate-500">No hay consultas pendientes.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Historial Reciente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Medicación</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyInquiries.map(inq => {
                const client = db.clients.find(c => c.id === inq.clientId);
                return (
                  <tr key={inq.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{new Date(inq.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">{client?.lastName}, {client?.name}</td>
                    <td className="px-4 py-3">{inq.medicationName}</td>
                    <td className="px-4 py-3">{getStatusLabel(inq.status)}</td>
                  </tr>
                );
              })}
              {historyInquiries.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No hay historial de consultas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInquiry && (
        <ResponseModal 
          inquiry={selectedInquiry} 
          client={db.clients.find(c => c.id === selectedInquiry.clientId)}
          onClose={() => setSelectedInquiry(null)} 
          onSubmit={(status, details) => {
            updateInquiryStatus(selectedInquiry.id, status, details);
            setSelectedInquiry(null);
          }} 
        />
      )}
    </div>
  );
};

const ResponseModal = ({ inquiry, client, onClose, onSubmit }: any) => {
  const [status, setStatus] = useState<'available' | 'not_available'>('available');
  const [inVademecum, setInVademecum] = useState(true);
  const [osLoaded, setOsLoaded] = useState(true);
  const [hasCoverage, setHasCoverage] = useState(true);
  const [coverageAmount, setCoverageAmount] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Responder Consulta</h2>
        <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm">
          <p><span className="font-medium">Paciente:</span> {client?.lastName}, {client?.name}</p>
          <p><span className="font-medium">Obra Social:</span> {client?.obraSocial}</p>
          <p><span className="font-medium">Medicación:</span> {inquiry.medicationName}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidad de Stock</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" checked={status === 'available'} onChange={() => setStatus('available')} className="text-primary-600 focus:ring-primary-500" />
                <span className="text-sm">Hay Stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" checked={status === 'not_available'} onChange={() => setStatus('not_available')} className="text-primary-600 focus:ring-primary-500" />
                <span className="text-sm">Sin Stock</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Información de Obra Social</label>
            
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input type="checkbox" checked={inVademecum} onChange={(e) => setInVademecum(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
              <span className="text-sm">¿Está en el vademécum?</span>
            </label>

            {inVademecum && (
              <>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={osLoaded} onChange={(e) => setOsLoaded(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm">¿Está cargada en la Obra Social?</span>
                </label>

                {osLoaded && (
                  <div className="ml-6 space-y-2 border-l-2 border-slate-100 pl-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={hasCoverage} onChange={(e) => setHasCoverage(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm">¿Tiene cobertura?</span>
                    </label>
                    {hasCoverage && (
                      <div>
                        <input 
                          type="text" 
                          placeholder="Porcentaje o monto (ej. 40%, 100%, $1500)" 
                          className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm outline-none focus:border-primary-500"
                          value={coverageAmount}
                          onChange={(e) => setCoverageAmount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas Adicionales</label>
            <textarea 
              className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-primary-500" 
              rows={2}
              placeholder="Ej. Llega mañana, requiere autorización previa..."
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
          <button 
            onClick={() => onSubmit(status, { inVademecum, osLoaded, hasCoverage, coverageAmount, notes })} 
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
          >
            Enviar Respuesta
          </button>
        </div>
      </div>
    </div>
  );
};
