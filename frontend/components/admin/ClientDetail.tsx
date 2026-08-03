import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Plus, Send, FileText, Clock, Package } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { MedStatus } from '../../types';

export const ClientDetail: React.FC<{ clientId: string, onBack: () => void }> = ({ clientId, onBack }) => {
  const { db, addMedication, updateMedication, addNotification } = useAppContext();
  const [activeTab, setActiveTab] = useState<'info' | 'meds' | 'history' | 'notifs'>('meds');
  
  const client = db.clients.find(c => c.id === clientId);
  const meds = db.medications.filter(m => m.clientId === clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const notifs = db.notifications.filter(n => n.clientId === clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const deliveries = db.deliveries.filter(d => d.clientId === clientId).sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());

  const [showMedModal, setShowMedModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  if (!client) return <div>Cliente no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{client.lastName}, {client.name}</h1>
          <p className="text-slate-500">DNI: {client.dni} | {client.obraSocial}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'info', label: 'Información Personal' },
            { id: 'meds', label: 'Medicación' },
            { id: 'history', label: 'Historial Entregas' },
            { id: 'notifs', label: 'Notificaciones' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Datos Personales</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Fecha Nacimiento:</dt><dd className="font-medium text-slate-900">{client.dob}</dd></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Teléfono:</dt><dd className="font-medium text-slate-900">{client.phone}</dd></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Email:</dt><dd className="font-medium text-slate-900">{client.email}</dd></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Dirección:</dt><dd className="font-medium text-slate-900">{client.address}</dd></div>
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Datos Médicos</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Obra Social:</dt><dd className="font-medium text-slate-900">{client.obraSocial}</dd></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Nº Afiliado:</dt><dd className="font-medium text-slate-900">{client.affiliateNumber}</dd></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Médico:</dt><dd className="font-medium text-slate-900">{client.doctor || '-'}</dd></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Alergias:</dt><dd className="font-medium text-red-600">{client.allergies || 'Ninguna declarada'}</dd></div>
                </dl>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Observaciones</h3>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{client.notes || 'Sin observaciones.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'meds' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowMedModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Nuevo Registro
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-2">Medicamento</th>
                      <th className="px-4 py-2">Cant.</th>
                      <th className="px-4 py-2">Estado</th>
                      <th className="px-4 py-2">F. Autorización</th>
                      <th className="px-4 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {meds.map(med => (
                      <tr key={med.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{med.medicationName}</td>
                        <td className="px-4 py-3">{med.quantity}</td>
                        <td className="px-4 py-3"><StatusBadge status={med.status} /></td>
                        <td className="px-4 py-3">{med.authDate || '-'}</td>
                        <td className="px-4 py-3">
                          <select 
                            className="text-xs border border-slate-300 rounded p-1 outline-none focus:border-primary-500"
                            value={med.status}
                            onChange={(e) => updateMedication({...med, status: e.target.value as MedStatus})}
                            disabled={med.status === 'delivered'}
                          >
                            <option value="pending_auth">Pendiente</option>
                            <option value="authorized">Autorizado</option>
                            <option value="available">Disponible</option>
                            <option value="out_of_stock">Sin Stock</option>
                            <option value="delivered" disabled>Entregado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {meds.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-slate-500">No hay medicamentos registrados.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {deliveries.map(del => {
                const med = db.medications.find(m => m.id === del.medicationRecordId);
                return (
                  <div key={del.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1"><Package className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-slate-900">Entregado: {med?.medicationName}</p>
                      <p className="text-sm text-slate-500">Fecha: {del.pickupDate} {del.pickupTime} | Por: {del.deliveredBy}</p>
                      <p className="text-sm text-slate-500">Pago: {del.paymentMethod} - ${del.amountPaid}</p>
                    </div>
                  </div>
                );
              })}
              {deliveries.length === 0 && <p className="text-slate-500 text-center py-4">No hay historial de entregas.</p>}
            </div>
          )}

          {activeTab === 'notifs' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowNotifModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                  <Send className="w-4 h-4" /> Enviar Notificación
                </button>
              </div>
              <div className="space-y-2">
                {notifs.map(n => (
                  <div key={n.id} className={`p-3 rounded-lg border ${n.read ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
                    <p className="text-sm text-slate-800">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {notifs.length === 0 && <p className="text-slate-500 text-center py-4">No hay notificaciones enviadas.</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showMedModal && (
        <MedicationModal 
          clientId={clientId} 
          onClose={() => setShowMedModal(false)} 
          onSave={(data) => { addMedication(data); setShowMedModal(false); }} 
        />
      )}
      {showNotifModal && (
        <NotificationModal 
          clientId={clientId} 
          onClose={() => setShowNotifModal(false)} 
          onSend={(data) => { addNotification(data); setShowNotifModal(false); }} 
        />
      )}
    </div>
  );
};

// Sub-components for Modals
const MedicationModal = ({ clientId, onClose, onSave }: any) => {
  const [data, setData] = useState({
    clientId, medicationName: '', quantity: 1, status: 'pending_auth' as MedStatus, notes: '', authDate: '', estPickupDate: ''
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Nuevo Medicamento</h2>
        <div className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Nombre del medicamento" value={data.medicationName} onChange={e => setData({...data, medicationName: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" className="w-full border p-2 rounded" placeholder="Cantidad" value={data.quantity} onChange={e => setData({...data, quantity: Number(e.target.value)})} />
            <select className="w-full border p-2 rounded" value={data.status} onChange={e => setData({...data, status: e.target.value as MedStatus})}>
              <option value="pending_auth">Pendiente</option>
              <option value="authorized">Autorizado</option>
              <option value="available">Disponible</option>
              <option value="out_of_stock">Sin Stock</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-slate-500">Fecha Autorización</label><input type="date" className="w-full border p-2 rounded" value={data.authDate} onChange={e => setData({...data, authDate: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">Est. Retiro</label><input type="date" className="w-full border p-2 rounded" value={data.estPickupDate} onChange={e => setData({...data, estPickupDate: e.target.value})} /></div>
          </div>
          <textarea className="w-full border p-2 rounded" placeholder="Notas (ej. Su medicación ya llegó...)" value={data.notes} onChange={e => setData({...data, notes: e.target.value})} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
          <button onClick={() => onSave(data)} className="btn-primary">Guardar</button>
        </div>
      </div>
    </div>
  );
};

const NotificationModal = ({ clientId, onClose, onSend }: any) => {
  const [message, setMessage] = useState('');
  const templates = [
    "✅ Su medicación fue autorizada.",
    "✅ Su medicación ya está disponible.",
    "⏳ Su medicación aún no fue autorizada por la obra social.",
    "🔴 No hay stock actualmente.",
    "🚚 Su pedido está en camino."
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Enviar Notificación</h2>
        <div className="space-y-2 mb-4">
          <p className="text-sm text-slate-500">Respuestas rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t, i) => (
              <button key={i} onClick={() => setMessage(t)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border border-slate-200">
                {t}
              </button>
            ))}
          </div>
        </div>
        <textarea 
          className="w-full border p-2 rounded h-24" 
          placeholder="Escriba un mensaje personalizado..." 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
        />
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
          <button onClick={() => onSend({ clientId, message, type: 'info' })} className="btn-primary" disabled={!message}>Enviar</button>
        </div>
      </div>
    </div>
  );
};
