export type UserRole = 'admin' | 'guru' | 'orang_tua';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  studentNisn?: string; // For parent account linked to a student
  avatarUrl?: string;
  title?: string;
}

export type Gender = 'L' | 'P';

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  grade: string; // e.g. "Kelas 1A", "Kelas 2B", "Kelas 3"
  parentName: string;
  parentPhone: string; // e.g. "081234567890" or "6281234567890"
  address: string;
  bloodType?: string;
  allergyNotes?: string;
  createdDate: string;
}

export type StuntingStatus = 'sangat_pendek' | 'pendek' | 'normal' | 'tinggi';
export type NutritionStatus = 'gizi_buruk' | 'gizi_kurang' | 'gizi_baik' | 'berisiko_gizi_lebih' | 'obesitas';

export interface GrowthZScores {
  tb_u: number; // Tinggi Badan menurut Umur
  bb_u: number; // Berat Badan menurut Umur
  bb_tb: number; // Berat Badan menurut Tinggi Badan
  imt_u: number; // IMT menurut Umur
}

export interface Measurement {
  id: string;
  studentId: string;
  studentNisn: string;
  studentName: string;
  studentGender: Gender;
  studentGrade: string;
  studentBirthDate: string;
  timestamp: string; // ISO String
  ageMonths: number;
  heightCm: number;
  weightKg: number;
  armCircumferenceCm?: number; // LILA
  headCircumferenceCm?: number;
  bmi: number;
  zScores: GrowthZScores;
  stuntingStatus: StuntingStatus;
  nutritionStatus: NutritionStatus;
  isStuntingIndicated: boolean;
  deviceId: string;
  measuredBy: string;
  notes?: string;
  isEncrypted: boolean;
  cipherHash?: string;
}

export interface WhatsAppAlert {
  id: string;
  measurementId: string;
  studentId: string;
  studentNisn: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  sentAt: string;
  stuntingStatus: StuntingStatus;
  nutritionStatus: NutritionStatus;
  messageText: string;
  status: 'terkirim' | 'dibaca' | 'ditindaklanjuti';
  confirmedByParentAt?: string;
}

export interface IoTDeviceState {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'measuring' | 'offline';
  ipAddress: string;
  batteryPercent: number;
  lastSync: string;
  firmwareVersion: string;
  sensors: {
    ultrasonicHeight: 'ready' | 'error' | 'calibrating';
    loadCellWeight: 'ready' | 'error' | 'calibrating';
  };
  liveReadings: {
    heightCm: number;
    weightKg: number;
    isStable: boolean;
  };
}

export interface NotificationItem {
  id: string;
  type: 'stunting_alert' | 'iot_sync' | 'parent_ack' | 'excel_import' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgency: 'high' | 'medium' | 'low';
  studentId?: string;
}

export interface FilterOptions {
  search: string;
  grade: string;
  stuntingStatus: string;
  nutritionStatus: string;
  gender: string;
}
