import React from 'react';
import { MedStatus } from '../../types';

export const StatusBadge: React.FC<{ status: MedStatus }> = ({ status }) => {
  const config = {
    pending_auth: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '🟡 Pendiente Autorización' },
    authorized: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: '🔵 Autorizado' },
    available: { color: 'bg-green-100 text-green-800 border-green-200', label: '🟢 Disponible' },
    out_of_stock: { color: 'bg-red-100 text-red-800 border-red-200', label: '🔴 Sin Stock' },
    delivered: { color: 'bg-slate-100 text-slate-800 border-slate-200', label: '⚪ Entregado' },
  };

  const { color, label } = config[status] || config.pending_auth;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
};
