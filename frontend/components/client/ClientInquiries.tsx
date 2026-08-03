import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, CheckCircle2, Clock, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

export const ClientInquiries: React.FC = () => {
  const { currentUser, db, createInquiry, confirmInquiryPickup } = useAppContext();
  const [newMedName, setNewMedName] = useState('');

  if (!currentUser) return null;

  const myInquiries = db.inquiries
    .filter(i => i.clientId === currentUser.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMedName.trim()) {
      createInquiry(newMedName.trim());
      setNewMedName('');
    }
  };

  const getStatusDisplay = (inq: any) => {
    switch(inq.status) {
      case 'pending_pharmacy': 
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Esperando respuesta de farmacia', icon: Clock };
      case 'available': 
        return { color: 'bg-green-100 text-green-800', text: '¡Disponible! Confirma si vas a retirar', icon: CheckCircle2 };
      case 'not_available': 
        return { color: 'bg-red-100 text-red-800', text: 'Sin stock por el momento', icon: AlertCircle };
      case 'confirmed_by_client': 
        return { color: 'bg-blue-100 text-blue-800', text: 'Retiro confirmado. Pedido en preparación.', icon: CheckCircle2 };
      default: 
        return { color: 'bg-slate-100 text-slate-800', text: inq.status, icon: Clock };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consultar Disponibilidad</h1>
        <p className="text-slate-500">Pregunta a la farmacia si tienen stock de tu medicación antes de ir.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              required
              placeholder="Nombre del medicamento (ej. Losartan 50mg)"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors whitespace-nowrap">
            Enviar Consulta
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Mis Consultas</h2>
        {myInquiries.map(inq => {
          const statusInfo = getStatusDisplay(inq);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={inq.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">{inq.medicationName}</h3>
                <p className="text-xs text-slate-400 mt-1">Consultado el {new Date(inq.createdAt).toLocaleDateString()}</p>
                
                {(inq.status === 'available' || inq.status === 'not_available' || inq.status === 'confirmed_by_client') && (
                  <div className="mt-3 space-y-2">
                    {inq.inVademecum === false ? (
                      <p className="text-sm text-red-600 flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> No se encuentra en el vademécum.</p>
                    ) : (
                      <>
                        {inq.osLoaded !== undefined && (
                          <p className={`text-sm flex items-center gap-1 ${inq.osLoaded ? 'text-green-600' : 'text-red-600'}`}>
                            {inq.osLoaded ? <ShieldCheck className="w-4 h-4"/> : <ShieldAlert className="w-4 h-4"/>}
                            {inq.osLoaded ? 'Cargada en Obra Social.' : 'No cargada en Obra Social.'}
                          </p>
                        )}
                        {inq.osLoaded && inq.hasCoverage !== undefined && (
                          <p className={`text-sm flex items-center gap-1 ${inq.hasCoverage ? 'text-blue-600' : 'text-slate-600'}`}>
                            <span className="font-medium">Cobertura:</span> {inq.hasCoverage ? (inq.coverageAmount || 'Sí') : 'Sin cobertura'}
                          </p>
                        )}
                      </>
                    )}
                    
                    {inq.pharmacyNotes && (
                      <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                        <span className="font-medium">Nota de farmacia:</span> {inq.pharmacyNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4" /> {statusInfo.text}
                </span>
                
                {inq.status === 'available' && (
                  <button 
                    onClick={() => confirmInquiryPickup(inq.id)}
                    className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Confirmar que voy a retirar
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {myInquiries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">Aún no has realizado ninguna consulta de stock.</p>
          </div>
        )}
      </div>
    </div>
  );
};
