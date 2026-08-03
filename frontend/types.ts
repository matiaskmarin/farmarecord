export type Role = 'admin' | 'client';

export interface User {
  id: string;
  role: Role;
  username?: string; // For admin
  email?: string;    // For client (now optional)
  passwordHash: string;
  name: string;
}

export interface ClientProfile extends User {
  lastName: string;
  dni: string;
  dob: string;
  phone: string;
  address: string;
  obraSocial: string;
  affiliateNumber: string;
  doctor?: string;
  habitualMeds?: string;
  allergies?: string;
  notes?: string;
  isPriority?: boolean;
}

export type MedStatus = 'pending_auth' | 'authorized' | 'available' | 'out_of_stock' | 'delivered';

export interface MedicationRecord {
  id: string;
  clientId: string;
  medicationName: string;
  quantity: number;
  authDate?: string;
  authExpiryDate?: string;
  estPickupDate?: string;
  status: MedStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  clientId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  read: boolean;
}

export interface Delivery {
  id: string;
  medicationRecordId: string;
  clientId: string;
  authDate?: string;
  pickupDate: string;
  pickupTime: string;
  deliveredBy: string; // Admin user ID or name
  paymentMethod: '100% Obra Social' | 'Efectivo' | 'Débito' | 'Crédito' | 'Transferencia' | 'Mercado Pago' | 'Otro';
  amountPaid: number;
  obraSocial?: string;
  coverage?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export type InquiryStatus = 'pending_pharmacy' | 'available' | 'not_available' | 'confirmed_by_client' | 'cancelled';

export interface Inquiry {
  id: string;
  clientId: string;
  medicationName: string;
  status: InquiryStatus;
  pharmacyNotes?: string;
  inVademecum?: boolean;
  osLoaded?: boolean;
  hasCoverage?: boolean;
  coverageAmount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  clients: ClientProfile[];
  medications: MedicationRecord[];
  notifications: Notification[];
  deliveries: Delivery[];
  audit: AuditLog[];
  inquiries: Inquiry[];
}
