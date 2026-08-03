import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Pill, User, Building2, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, registerClient } = useAppContext();
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<'admin' | 'client'>('client');
  
  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register state
  const [regData, setRegData] = useState({
    name: '', lastName: '', dni: '', dob: '', email: '', phone: '',
    address: '', obraSocial: '', affiliateNumber: '', password: '', confirmPassword: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(identifier, password, role);
    if (!success) {
      setError('Credenciales incorrectas. Por favor, intente nuevamente.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regData.password !== regData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    const success = registerClient({
      name: regData.name,
      lastName: regData.lastName,
      dni: regData.dni,
      dob: regData.dob,
      email: regData.email, // Now optional
      phone: regData.phone,
      address: regData.address,
      obraSocial: regData.obraSocial,
      affiliateNumber: regData.affiliateNumber,
      passwordHash: regData.password
    });

    if (success) {
      setIsRegistering(false);
      setIdentifier(regData.dni); // Pre-fill DNI for login
      setPassword(regData.password);
      alert('Registro exitoso. Por favor inicie sesión.');
    } else {
      setError('El DNI ya se encuentra registrado.');
    }
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
          <div>
            <div className="flex justify-center">
              <div className="bg-primary-100 p-3 rounded-full">
                <Pill className="h-10 w-10 text-primary-600" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Crear cuenta de paciente</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Nombre" className="input-field" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
              <input required placeholder="Apellido" className="input-field" value={regData.lastName} onChange={e => setRegData({...regData, lastName: e.target.value})} />
              <input required placeholder="DNI" className="input-field" value={regData.dni} onChange={e => setRegData({...regData, dni: e.target.value})} />
              <input required type="date" placeholder="Fecha de Nacimiento" className="input-field" value={regData.dob} onChange={e => setRegData({...regData, dob: e.target.value})} />
              <input type="email" placeholder="Email (Opcional)" className="input-field" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
              <input required placeholder="Teléfono" className="input-field" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
              <input required placeholder="Dirección" className="input-field md:col-span-2" value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} />
              <input required placeholder="Obra Social" className="input-field" value={regData.obraSocial} onChange={e => setRegData({...regData, obraSocial: e.target.value})} />
              <input required placeholder="Nº Afiliado" className="input-field" value={regData.affiliateNumber} onChange={e => setRegData({...regData, affiliateNumber: e.target.value})} />
              <input required type="password" placeholder="Contraseña" className="input-field" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
              <input required type="password" placeholder="Confirmar Contraseña" className="input-field" value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} />
            </div>
            <div className="flex items-center justify-between mt-4">
              <button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-primary-600 hover:text-primary-500">
                Ya tengo cuenta. Iniciar sesión.
              </button>
              <button type="submit" className="btn-primary">Registrarse</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div>
          <div className="flex justify-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <ShieldCheck className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">FarmaGest</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Gestión inteligente de pacientes y medicación</p>
        </div>

        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`flex-1 py-2 text-sm font-medium rounded-l-lg border ${role === 'client' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <User className="w-4 h-4 inline-block mr-2" /> Paciente
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${role === 'admin' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <Building2 className="w-4 h-4 inline-block mr-2" /> Farmacia
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                required
                className="input-field"
                placeholder={role === 'admin' ? 'Usuario (ej. PONTE1)' : 'DNI del paciente'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button type="submit" className="w-full btn-primary flex justify-center py-2.5">
              Iniciar Sesión
            </button>
          </div>
          
          {role === 'client' && (
            <div className="text-center mt-4">
              <button type="button" onClick={() => setIsRegistering(true)} className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                ¿Nuevo paciente? Crear cuenta
              </button>
            </div>
          )}
        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .input-field {
          appearance: none;
          border-radius: 0.375rem;
          position: relative;
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          color: #1f2937;
          outline: none;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        .btn-primary {
          background-color: #2563eb;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #1d4ed8;
        }
      `}} />
    </div>
  );
};
