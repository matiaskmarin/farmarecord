import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Save, UserCircle } from 'lucide-react';
import { ClientProfile as ClientProfileType } from '../../types';

export const ClientProfile: React.FC = () => {
  const { currentUser, db, updateClient } = useAppContext();
  const [formData, setFormData] = useState<Partial<ClientProfileType>>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fullProfile = db.clients.find(c => c.id === currentUser.id);
      if (fullProfile) {
        setFormData(fullProfile);
      }
    }
  }, [currentUser, db.clients]);

  if (!currentUser) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      updateClient(formData as ClientProfileType);
      setSuccessMsg('Datos actualizados correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis Datos Personales</h1>
        <p className="text-slate-500">Actualiza tu información personal y médica.</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center gap-2">
          <UserCircle className="w-5 h-5" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required name="name" value={formData.name || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                <input required name="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                <input required name="dni" value={formData.dni || ''} disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
                <input required type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input required name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <input required name="address" value={formData.address || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Información Médica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Obra Social</label>
                <input required name="obraSocial" value={formData.obraSocial || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nº de Afiliado</label>
                <input required name="affiliateNumber" value={formData.affiliateNumber || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Médico de Cabecera</label>
                <input name="doctor" value={formData.doctor || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alergias</label>
                <input name="allergies" value={formData.allergies || ''} onChange={handleChange} placeholder="Ej. Penicilina" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Medicación Habitual</label>
                <textarea name="habitualMeds" value={formData.habitualMeds || ''} onChange={handleChange} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};
