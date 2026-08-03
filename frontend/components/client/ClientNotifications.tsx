import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bell, CheckCircle2 } from 'lucide-react';

export const ClientNotifications: React.FC = () => {
  const { currentUser, db, markNotificationRead } = useAppContext();
  
  if (!currentUser) return null;

  const notifs = db.notifications
    .filter(n => n.clientId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Mark all as read when viewing
  useEffect(() => {
    notifs.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  }, [notifs, markNotificationRead]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
        <p className="text-slate-500">Mensajes y avisos de la farmacia.</p>
      </div>

      <div className="space-y-3">
        {notifs.map(notif => (
          <div key={notif.id} className={`p-4 rounded-xl border flex gap-4 ${notif.read ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className={`mt-1 ${notif.read ? 'text-slate-400' : 'text-primary-500'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${notif.read ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
                {notif.message}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        {notifs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No tienes notificaciones nuevas.</p>
          </div>
        )}
      </div>
    </div>
  );
};
