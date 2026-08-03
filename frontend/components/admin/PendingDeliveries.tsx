import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle } from 'lucide-react';

export const PendingDeliveries: React.FC = () => {
  const { db, recordDelivery, currentUser } = useAppContext();
  const [selectedMed, setSelectedMed] = useState<any>(null);

  // Get all medications with status 'available'
  const pendingMeds = db.medications.filter(m => m.status === 'available');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Entregas Pendientes</h1>
        <p className="text-slate-500">Medicamentos listos para ser retirados por el paciente.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Medicación</th>
                <th className="px-6 py-3">Obra Social</th>
                <th className="px-6 py-3">F. Límite</th>
                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingMeds.map(med => {
                const client = db.clients.find(c => c.id === med.clientId);
                if (!client) return null;
                return (
                  <tr key={med.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{client.lastName}, {client.name}</td>
                    <td className="px-6 py-4">{med.medicationName} (x{med.quantity})</td>
                    <td className="px-6 py-4">{client.obraSocial}</td>
                    <td className="px-6 py-4 text-red-600">{med.estPickupDate || 'No definida'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedMed({ med, client })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors font-medium"
                      >
                        <CheckCircle className="w-4 h-4" /> Entregar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pendingMeds.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay entregas pendientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMed && (
        <DeliveryModal 
          data={selectedMed} 
          onClose={() => setSelectedMed(null)} 
          onConfirm={(deliveryData) => {
            recordDelivery({
              ...deliveryData,
              medicationRecordId: selectedMed.med.id,
              clientId: selectedMed.client.id,
              deliveredBy: currentUser?.name || 'Admin',
              obraSocial: selectedMed.client.obraSocial
            });
            setSelectedMed(null);
          }} 
        />
      )}
    </div>
  );
};

const DeliveryModal = ({ data, onClose, onConfirm }: any) => {
  const [form, setForm] = useState({
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
    paymentMethod: '100% Obra Social',
    amountPaid: 0,
    coverage: '',
    notes: ''
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-2">Registrar Entrega</h2>
        <p className="text-sm text-slate-500 mb-4">Paciente: {data.client.lastName}, {data.client.name} <br/> Medicación: {data.med.medicationName}</p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-slate-500">Fecha</label><input type="date" className="w-full border p-2 rounded" value={form.pickupDate} onChange={e => setForm({...form, pickupDate: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">Hora</label><input type="time" className="w-full border p-2 rounded" value={form.pickupTime} onChange={e => setForm({...form, pickupTime: e.target.value})} /></div>
          </div>
          
          <div>
            <label className="text-xs text-slate-500">Cobertura O.S. (Ej. 40%, 100%)</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="Opcional" value={form.coverage} onChange={e => setForm({...form, coverage: e.target.value})} />
          </div>

          <div>
            <label className="text-xs text-slate-500">Forma de Pago</label>
            <select className="w-full border p-2 rounded" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
              <option>100% Obra Social</option>
              <option>Efectivo</option>
              <option>Débito</option>
              <option>Crédito</option>
              <option>Transferencia</option>
              <option>Mercado Pago</option>
              <option>Otro</option>
            </select>
          </div>
          {form.paymentMethod !== '100% Obra Social' && (
            <div>
              <label className="text-xs text-slate-500">Monto Abonado ($)</label>
              <input type="number" className="w-full border p-2 rounded" value={form.amountPaid} onChange={e => setForm({...form, amountPaid: Number(e.target.value)})} />
            </div>
          )}
          <div>
            <label className="text-xs text-slate-500">Observaciones</label>
            <textarea className="w-full border p-2 rounded" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
          <button onClick={() => onConfirm(form)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Confirmar Entrega</button>
        </div>
      </div>
    </div>
  );
};
