import { DatabaseSchema, User, ClientProfile, MedicationRecord, Notification, Delivery, AuditLog, Inquiry } from '../types';

const DB_KEY = 'farmagest_db';
const SUPABASE_URL = 'https://tijganpavsloahocteyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pVIMhjruh5OeHQ3hhHO3tw_WdEFA-_M';
const SHARED_STATE_ID = 'farmagest-demo';

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
  void saveSharedDB(db);
};

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Content-Type': 'application/json',
};

/** Downloads the shared demo state. Local storage remains a short offline cache. */
export const syncSharedDB = async (): Promise<DatabaseSchema | null> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_state?id=eq.${SHARED_STATE_ID}&select=data`,
      { headers }
    );
    if (!response.ok) return null;
    const rows = await response.json() as Array<{ data: DatabaseSchema }>;
    if (rows[0]?.data) {
      localStorage.setItem(DB_KEY, JSON.stringify(rows[0].data));
      return rows[0].data;
    }
    await saveSharedDB(getDB());
  } catch {
    // The demo continues locally if the network is unavailable.
  }
  return null;
};

const saveSharedDB = async (db: DatabaseSchema) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/app_state?on_conflict=id`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: SHARED_STATE_ID, data: db, updated_at: new Date().toISOString() }),
    });
  } catch {
    // Changes stay in the local cache and will sync on a later save.
  }
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
