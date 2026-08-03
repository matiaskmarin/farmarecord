import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ClientProfile, DatabaseSchema, MedicationRecord, Notification, Delivery, Inquiry, InquiryStatus } from '../types';
import { getDB, saveDB, logAudit, syncSharedDB } from '../services/db';

export interface InquiryResponseDetails {
  notes?: string;
  inVademecum?: boolean;
  osLoaded?: boolean;
  hasCoverage?: boolean;
  coverageAmount?: string;
}

interface AppContextType {
  currentUser: User | null;
  db: DatabaseSchema;
  login: (identifier: string, pass: string, role: 'admin' | 'client') => boolean;
  logout: () => void;
  registerClient: (client: Omit<ClientProfile, 'id' | 'role'>) => boolean;
  updateClient: (client: ClientProfile) => void;
  addMedication: (med: Omit<MedicationRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedication: (med: MedicationRecord) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  recordDelivery: (delivery: Omit<Delivery, 'id'>) => void;
  createInquiry: (medicationName: string) => void;
  updateInquiryStatus: (id: string, status: InquiryStatus, details: InquiryResponseDetails) => void;
  confirmInquiryPickup: (id: string) => void;
  refreshDB: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [db, setDb] = useState<DatabaseSchema>(getDB());

  const refreshDB = () => setDb(getDB());

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const sync = async () => {
      const sharedDb = await syncSharedDB();
      if (sharedDb) setDb(sharedDb);
    };
    void sync();
    const timer = window.setInterval(() => void sync(), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const login = (identifier: string, pass: string, role: 'admin' | 'client') => {
    const currentDb = getDB();
    const hash = btoa(pass);
    
    let user: User | undefined;
    if (role === 'admin') {
      user = currentDb.users.find(u => 
        u.role === 'admin' && 
        u.username?.toLowerCase() === identifier.toLowerCase() && 
        u.passwordHash === hash
      );
    } else {
      user = currentDb.clients.find(c => 
        c.dni === identifier && 
        c.passwordHash === hash
      );
    }

    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      logAudit(user.id, 'LOGIN', 'Usuario inició sesión');
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logAudit(currentUser.id, 'LOGOUT', 'Usuario cerró sesión');
    }
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const registerClient = (clientData: Omit<ClientProfile, 'id' | 'role'>) => {
    const currentDb = getDB();
    if (currentDb.clients.some(c => c.dni === clientData.dni)) {
      return false; 
    }

    const newClient: ClientProfile = {
      ...clientData,
      id: `client_${Date.now()}`,
      role: 'client',
      passwordHash: btoa(clientData.passwordHash)
    };

    currentDb.clients.push(newClient);
    saveDB(currentDb);
    refreshDB();
    logAudit(newClient.id, 'REGISTER', `Nuevo cliente registrado: ${newClient.dni}`);
    return true;
  };

  const updateClient = (client: ClientProfile) => {
    const currentDb = getDB();
    const index = currentDb.clients.findIndex(c => c.id === client.id);
    if (index !== -1) {
      currentDb.clients[index] = client;
      // Also update currentUser if it's the one being edited
      if (currentUser?.id === client.id) {
        const updatedUser = { ...currentUser, name: client.name };
        setCurrentUser(updatedUser);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      saveDB(currentDb);
      refreshDB();
      logAudit(currentUser?.id || 'system', 'UPDATE_CLIENT', `Perfil actualizado: ${client.id}`);
    }
  };

  const addMedication = (medData: Omit<MedicationRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const currentDb = getDB();
    const newMed: MedicationRecord = {
      ...medData,
      id: `med_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    currentDb.medications.push(newMed);
    saveDB(currentDb);
    refreshDB();
    logAudit(currentUser?.id || 'system', 'ADD_MED', `Medicación agregada a cliente ${medData.clientId}`);
  };

  const updateMedication = (med: MedicationRecord) => {
    const currentDb = getDB();
    const index = currentDb.medications.findIndex(m => m.id === med.id);
    if (index !== -1) {
      med.updatedAt = new Date().toISOString();
      currentDb.medications[index] = med;
      saveDB(currentDb);
      refreshDB();
      logAudit(currentUser?.id || 'system', 'UPDATE_MED', `Estado de medicación actualizado: ${med.id} a ${med.status}`);
    }
  };

  const addNotification = (notifData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const currentDb = getDB();
    const newNotif: Notification = {
      ...notifData,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    currentDb.notifications.push(newNotif);
    saveDB(currentDb);
    refreshDB();
  };

  const markNotificationRead = (id: string) => {
    const currentDb = getDB();
    const notif = currentDb.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveDB(currentDb);
      refreshDB();
    }
  };

  const recordDelivery = (deliveryData: Omit<Delivery, 'id'>) => {
    const currentDb = getDB();
    const newDelivery: Delivery = {
      ...deliveryData,
      id: `del_${Date.now()}`
    };
    currentDb.deliveries.push(newDelivery);
    
    const medIndex = currentDb.medications.findIndex(m => m.id === deliveryData.medicationRecordId);
    if (medIndex !== -1) {
      currentDb.medications[medIndex].status = 'delivered';
      currentDb.medications[medIndex].updatedAt = new Date().toISOString();
    }

    saveDB(currentDb);
    refreshDB();
    logAudit(currentUser?.id || 'system', 'DELIVERY', `Medicación entregada: ${deliveryData.medicationRecordId}`);
  };

  const createInquiry = (medicationName: string) => {
    if (!currentUser) return;
    const currentDb = getDB();
    const newInquiry: Inquiry = {
      id: `inq_${Date.now()}`,
      clientId: currentUser.id,
      medicationName,
      status: 'pending_pharmacy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    currentDb.inquiries.push(newInquiry);
    saveDB(currentDb);
    refreshDB();
    logAudit(currentUser.id, 'CREATE_INQUIRY', `Consulta creada por: ${medicationName}`);
  };

  const updateInquiryStatus = (id: string, status: InquiryStatus, details: InquiryResponseDetails) => {
    const currentDb = getDB();
    const index = currentDb.inquiries.findIndex(i => i.id === id);
    if (index !== -1) {
      const inquiry = currentDb.inquiries[index];
      inquiry.status = status;
      inquiry.pharmacyNotes = details.notes;
      inquiry.inVademecum = details.inVademecum;
      inquiry.osLoaded = details.osLoaded;
      inquiry.hasCoverage = details.hasCoverage;
      inquiry.coverageAmount = details.coverageAmount;
      inquiry.updatedAt = new Date().toISOString();

      if (status === 'available' || status === 'not_available') {
        let msg = status === 'available' 
          ? `Stock disponible para "${inquiry.medicationName}". ` 
          : `Sin stock de "${inquiry.medicationName}". `;
        
        if (details.inVademecum === false) {
          msg += "El medicamento no se encuentra en el vademécum. ";
        } else {
          if (details.osLoaded !== undefined) {
            msg += details.osLoaded ? "Cargado en Obra Social. " : "No cargado en Obra Social. ";
          }
          if (details.hasCoverage !== undefined) {
            msg += details.hasCoverage ? `Cobertura: ${details.coverageAmount || 'Sí'}. ` : "Sin cobertura. ";
          }
        }
        
        if (details.notes) {
          msg += `Nota: ${details.notes}`;
        }

        if (status === 'available') {
          msg += " Por favor confirma en la app si vas a retirarlo.";
        }

        const newNotif: Notification = {
          id: `notif_${Date.now()}`,
          clientId: inquiry.clientId,
          message: msg,
          type: status === 'available' ? 'success' : 'error',
          createdAt: new Date().toISOString(),
          read: false
        };
        currentDb.notifications.push(newNotif);
      }

      saveDB(currentDb);
      refreshDB();
      logAudit(currentUser?.id || 'system', 'UPDATE_INQUIRY', `Farmacia respondió consulta: ${id} -> ${status}`);
    }
  };

  const confirmInquiryPickup = (id: string) => {
    const currentDb = getDB();
    const index = currentDb.inquiries.findIndex(i => i.id === id);
    if (index !== -1) {
      const inquiry = currentDb.inquiries[index];
      inquiry.status = 'confirmed_by_client';
      inquiry.updatedAt = new Date().toISOString();

      const newMed: MedicationRecord = {
        id: `med_${Date.now()}`,
        clientId: inquiry.clientId,
        medicationName: inquiry.medicationName,
        quantity: 1,
        status: 'available',
        notes: 'Generado automáticamente desde confirmación de disponibilidad.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      currentDb.medications.push(newMed);

      saveDB(currentDb);
      refreshDB();
      logAudit(currentUser?.id || 'system', 'CONFIRM_INQUIRY', `Cliente confirmó retiro de consulta: ${id}`);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, db, login, logout, registerClient, updateClient,
      addMedication, updateMedication, addNotification, markNotificationRead, recordDelivery,
      createInquiry, updateInquiryStatus, confirmInquiryPickup, refreshDB
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
