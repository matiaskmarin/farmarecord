import { DatabaseSchema, User, ClientProfile, MedicationRecord, Notification, Delivery, AuditLog, Inquiry } from '../types';

const DB_KEY = 'farmagest_db';

const defaultAdmin: User = {
  id: 'admin_1',
  role: 'admin',
  username: 'PONTE1',
  passwordHash: btoa('ponte1medi'), // Simple base64 for demo "encryption"
  name: 'Administrador Principal'
};

const initialDB: DatabaseSchema = {
  users: [defaultAdmin],
  clients: [],
  medications: [],
  notifications: [],
  deliveries: [],
  audit: [],
  inquiries: []
};

export const getDB = (): DatabaseSchema => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    return initialDB;
  }
  
  const parsedDb = JSON.parse(data) as DatabaseSchema;
  
  // Ensure admin credentials are up to date even if loaded from local storage
  const adminIndex = parsedDb.users.findIndex(u => u.role === 'admin');
  if (adminIndex !== -1) {
    parsedDb.users[adminIndex].username = 'PONTE1';
    parsedDb.users[adminIndex].passwordHash = btoa('ponte1medi');
  } else {
    parsedDb.users.push(defaultAdmin);
  }

  // Migration: ensure inquiries array exists for older cached DBs
  if (!parsedDb.inquiries) {
    parsedDb.inquiries = [];
  }
  
  return parsedDb;
};

export const saveDB = (db: DatabaseSchema) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const logAudit = (userId: string, action: string, details: string) => {
  const db = getDB();
  const log: AuditLog = {
    id: Date.now().toString(),
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.audit.push(log);
  saveDB(db);
};
