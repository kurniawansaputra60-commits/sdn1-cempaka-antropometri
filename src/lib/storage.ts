import {
  IoTDeviceState,
  Measurement,
  NotificationItem,
  Student,
  User,
  WhatsAppAlert
} from '../types';
import { calculateAgeMonths, calculateGrowthStatus } from './growthStandards';

const STORAGE_KEYS = {
  USERS: 'sdn1c_antro_users_v2',
  ACTIVE_USER: 'sdn1c_antro_active_user_v2',
  STUDENTS: 'sdn1c_antro_students_v2',
  MEASUREMENTS: 'sdn1c_antro_measurements_v2',
  ALERTS: 'sdn1c_antro_wa_alerts_v2',
  IOT_DEVICE: 'sdn1c_antro_iot_device_v2',
  NOTIFICATIONS: 'sdn1c_antro_notifications_v2',
  E2E_ENABLED: 'sdn1c_antro_e2e_enabled_v2',
};

// Initial Users
export const INITIAL_USERS: User[] = [
  {
    id: 'user_guru_01',
    name: 'Ibu Siti Nurhaliza, S.Pd',
    role: 'guru',
    email: 'uks.cempaka1@gmail.com',
    phone: '081234567890',
    title: 'Pembina UKS & Koordinator Gizi SDN 1 Cempaka',
    avatarUrl: '',
  },
  {
    id: 'user_admin_01',
    name: 'Ahmad Fauzi, S.Kom',
    role: 'admin',
    email: 'admin@sdn1cempaka.sch.id',
    phone: '081198765432',
    title: 'Administrator SIM & IoT Gateway Sekolah',
    avatarUrl: '',
  },
  {
    id: 'user_ortu_01',
    name: 'Ibu Siti Aminah',
    role: 'orang_tua',
    email: 'sitiaminah.wali@gmail.com',
    phone: '081398765422',
    studentNisn: '0145892302', // Aisyah Putri Rahmadani
    title: 'Orang Tua Siswa (Aisyah Putri R. - Kelas 1A)',
    avatarUrl: '',
  },
];

// Initial Students
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_01',
    nisn: '0145892301',
    name: 'Muhammad Farhan',
    gender: 'L',
    birthDate: '2019-05-12',
    grade: 'Kelas 1A',
    parentName: 'Bapak Hendra Wijaya',
    parentPhone: '081234567811',
    address: 'Jl. Cempaka Raya No. 12, RT 02/RW 04',
    bloodType: 'O',
    createdDate: '2026-07-15',
  },
  {
    id: 'std_02',
    nisn: '0145892302',
    name: 'Aisyah Putri Rahmadani',
    gender: 'P',
    birthDate: '2019-08-20',
    grade: 'Kelas 1A',
    parentName: 'Ibu Siti Aminah',
    parentPhone: '081398765422',
    address: 'Jl. Melati Indah No. 45, Cempaka',
    bloodType: 'A',
    createdDate: '2026-07-15',
  },
  {
    id: 'std_03',
    nisn: '0134789103',
    name: 'Dimas Aditya Pratama',
    gender: 'L',
    birthDate: '2018-03-15',
    grade: 'Kelas 2B',
    parentName: 'Bapak Bambang Supriyadi',
    parentPhone: '085712345678',
    address: 'Komplek Griya Cempaka Blok B3',
    bloodType: 'B',
    createdDate: '2026-07-15',
  },
  {
    id: 'std_04',
    nisn: '0134789104',
    name: 'Nabila Khairunnisa',
    gender: 'P',
    birthDate: '2018-11-04',
    grade: 'Kelas 2B',
    parentName: 'Ibu Rahmawati',
    parentPhone: '082188776655',
    address: 'Gang Mawar No. 08, Cempaka',
    bloodType: 'AB',
    createdDate: '2026-07-15',
  },
  {
    id: 'std_05',
    nisn: '0123567895',
    name: 'Rizky Febrian Santoso',
    gender: 'L',
    birthDate: '2017-09-10',
    grade: 'Kelas 3A',
    parentName: 'Bapak Joko Susilo',
    parentPhone: '081290876543',
    address: 'Jl. Anggrek No. 19, Cempaka',
    bloodType: 'O',
    createdDate: '2026-07-15',
  },
  {
    id: 'std_06',
    nisn: '0123567896',
    name: 'Zahra Amelia',
    gender: 'P',
    birthDate: '2017-12-01',
    grade: 'Kelas 3A',
    parentName: 'Ibu Dewi Lestari',
    parentPhone: '081345678901',
    address: 'Jl. Kenanga Timur No. 3A',
    bloodType: 'A',
    createdDate: '2026-07-15',
  },
  {
    id: 'std_07',
    nisn: '0112456787',
    name: 'Gilang Ramadhan',
    gender: 'L',
    birthDate: '2016-06-18',
    grade: 'Kelas 4',
    parentName: 'Bapak Agus Salim',
    parentPhone: '085811223344',
    address: 'Jl. Pahlawan No. 71, Cempaka',
    bloodType: 'B',
    createdDate: '2026-07-15',
  },
  {
    id: 'std_08',
    nisn: '0101345688',
    name: 'Kayla Putri Anindya',
    gender: 'P',
    birthDate: '2015-04-25',
    grade: 'Kelas 5',
    parentName: 'Ibu Rini Astuti',
    parentPhone: '081233445566',
    address: 'Jl. Flamboyan Blok D-11',
    bloodType: 'O',
    createdDate: '2026-07-15',
  },
];

// Helper to build a measurement record with realistic calculations
function createMeasurementRecord(
  student: Student,
  dateStr: string,
  heightCm: number,
  weightKg: number,
  armCm: number = 16.5,
  notes: string = 'Pengukuran rutin Pos Antropometri IoT UKS'
): Measurement {
  const ageMonths = calculateAgeMonths(student.birthDate, dateStr);
  const status = calculateGrowthStatus(heightCm, weightKg, ageMonths, student.gender);

  return {
    id: `m_${student.id}_${new Date(dateStr).getTime()}`,
    studentId: student.id,
    studentNisn: student.nisn,
    studentName: student.name,
    studentGender: student.gender,
    studentGrade: student.grade,
    studentBirthDate: student.birthDate,
    timestamp: new Date(dateStr).toISOString(),
    ageMonths,
    heightCm,
    weightKg,
    armCircumferenceCm: armCm,
    headCircumferenceCm: 51.5,
    bmi: status.bmi,
    zScores: status.zScores,
    stuntingStatus: status.stuntingStatus,
    nutritionStatus: status.nutritionStatus,
    isStuntingIndicated: status.isStuntingIndicated,
    deviceId: 'IOT-ANTRO-SDN1C-01',
    measuredBy: 'Ibu Siti Nurhaliza, S.Pd',
    notes,
    isEncrypted: true,
    cipherHash: `SHA256-${Math.abs(heightCm * 100 + weightKg).toString(16).toUpperCase()}`,
  };
}

// Generate Realistic Historical Measurements for SDN 1 Cempaka
export function generateInitialMeasurements(): Measurement[] {
  const list: Measurement[] = [];

  // Farhan (Normal healthy growth)
  const farhan = INITIAL_STUDENTS[0];
  list.push(createMeasurementRecord(farhan, '2026-06-10T08:30:00Z', 118.0, 21.2, 16.0));
  list.push(createMeasurementRecord(farhan, '2026-07-15T08:45:00Z', 118.6, 21.6, 16.2));
  list.push(createMeasurementRecord(farhan, '2026-08-18T09:00:00Z', 119.2, 22.0, 16.3));
  list.push(createMeasurementRecord(farhan, '2026-09-20T08:15:00Z', 119.8, 22.4, 16.5));
  list.push(createMeasurementRecord(farhan, '2026-10-05T08:20:00Z', 120.4, 22.8, 16.6));

  // Aisyah (Indikasi Stunting: Tinggi di bawah batas -2.5 SD, membutuhkan notifikasi WA)
  const aisyah = INITIAL_STUDENTS[1];
  list.push(createMeasurementRecord(aisyah, '2026-06-10T08:35:00Z', 104.5, 15.1, 13.8, 'Nafsu makan kurang'));
  list.push(createMeasurementRecord(aisyah, '2026-07-15T08:50:00Z', 104.9, 15.3, 13.9, 'Pemberian PMT telur'));
  list.push(createMeasurementRecord(aisyah, '2026-08-18T09:10:00Z', 105.2, 15.6, 14.0, 'Monitoring asupan gizi'));
  list.push(createMeasurementRecord(aisyah, '2026-09-20T08:25:00Z', 105.8, 15.9, 14.1, 'Pemeriksaan lanjutan'));
  list.push(createMeasurementRecord(aisyah, '2026-10-05T08:30:00Z', 106.3, 16.2, 14.2, 'Terdeteksi Stunting: Z-Score TB/U -2.48'));

  // Dimas (Normal)
  const dimas = INITIAL_STUDENTS[2];
  list.push(createMeasurementRecord(dimas, '2026-07-15T09:05:00Z', 125.0, 24.5, 17.0));
  list.push(createMeasurementRecord(dimas, '2026-08-18T09:20:00Z', 125.8, 24.9, 17.2));
  list.push(createMeasurementRecord(dimas, '2026-09-20T08:40:00Z', 126.5, 25.4, 17.3));
  list.push(createMeasurementRecord(dimas, '2026-10-05T08:45:00Z', 127.2, 25.8, 17.5));

  // Nabila (Indikasi Sangat Pendek / Severely Stunted Z-score < -3.0 SD)
  const nabila = INITIAL_STUDENTS[3];
  list.push(createMeasurementRecord(nabila, '2026-07-15T09:15:00Z', 109.0, 17.0, 13.5, 'Perlu rujukan Puskesmas'));
  list.push(createMeasurementRecord(nabila, '2026-08-18T09:30:00Z', 109.4, 17.2, 13.6, 'Pemberian susu tinggi protein'));
  list.push(createMeasurementRecord(nabila, '2026-09-20T08:50:00Z', 110.0, 17.5, 13.8, 'Evaluasi intervensi PMT'));
  list.push(createMeasurementRecord(nabila, '2026-10-05T09:00:00Z', 110.5, 17.8, 13.9, 'Severely Stunted: Z-Score TB/U -3.12'));

  // Rizky (Normal)
  const rizky = INITIAL_STUDENTS[4];
  list.push(createMeasurementRecord(rizky, '2026-08-18T09:40:00Z', 131.0, 28.0, 18.0));
  list.push(createMeasurementRecord(rizky, '2026-09-20T09:05:00Z', 131.8, 28.5, 18.2));
  list.push(createMeasurementRecord(rizky, '2026-10-05T09:15:00Z', 132.5, 29.1, 18.4));

  // Zahra (Normal)
  const zahra = INITIAL_STUDENTS[5];
  list.push(createMeasurementRecord(zahra, '2026-09-20T09:15:00Z', 130.0, 27.2, 17.8));
  list.push(createMeasurementRecord(zahra, '2026-10-05T09:25:00Z', 130.8, 27.8, 18.0));

  // Gilang (Normal)
  const gilang = INITIAL_STUDENTS[6];
  list.push(createMeasurementRecord(gilang, '2026-10-05T09:35:00Z', 136.5, 31.0, 19.0));

  // Kayla (Normal)
  const kayla = INITIAL_STUDENTS[7];
  list.push(createMeasurementRecord(kayla, '2026-10-05T09:45:00Z', 142.0, 34.5, 20.0));

  return list;
}

// Initial IoT Device Hardware State
export const INITIAL_IOT_DEVICE: IoTDeviceState = {
  id: 'IOT-ANTRO-SDN1C-01',
  name: 'Smart Stadiometer & LoadCell SDN 1 Cempaka',
  location: 'Ruang UKS SDN 1 Cempaka',
  status: 'online',
  ipAddress: '192.168.1.185',
  batteryPercent: 94,
  lastSync: new Date().toISOString(),
  firmwareVersion: 'v2.4.1-build2026-iot',
  sensors: {
    ultrasonicHeight: 'ready',
    loadCellWeight: 'ready',
  },
  liveReadings: {
    heightCm: 119.5,
    weightKg: 22.4,
    isStable: true,
  },
};

// Initial WhatsApp Alerts
export const INITIAL_ALERTS: WhatsAppAlert[] = [
  {
    id: 'wa_01',
    measurementId: 'm_std_02_recent',
    studentId: 'std_02',
    studentNisn: '0145892302',
    studentName: 'Aisyah Putri Rahmadani',
    parentName: 'Ibu Siti Aminah',
    parentPhone: '081398765422',
    sentAt: '2026-10-05T08:35:00Z',
    stuntingStatus: 'pendek',
    nutritionStatus: 'gizi_kurang',
    messageText: 'Yth. Ibu Siti Aminah (Wali dari Aisyah Putri R.), Tim UKS SDN 1 Cempaka menginformasikan bahwa hasil pengukuran antropometri digital menunjukkan tinggi 106.3 cm (Indikasi Stunting: Pendek). Mohon perhatikan asupan protein hewani dan konsultasikan ke Puskesmas Cempaka.',
    status: 'dibaca',
    confirmedByParentAt: '2026-10-05T09:12:00Z',
  },
  {
    id: 'wa_02',
    measurementId: 'm_std_04_recent',
    studentId: 'std_04',
    studentNisn: '0134789104',
    studentName: 'Nabila Khairunnisa',
    parentName: 'Ibu Rahmawati',
    parentPhone: '082188776655',
    sentAt: '2026-10-05T09:05:00Z',
    stuntingStatus: 'sangat_pendek',
    nutritionStatus: 'gizi_kurang',
    messageText: 'Yth. Ibu Rahmawati (Wali dari Nabila Khairunnisa), Tim UKS SDN 1 Cempaka menginformasikan hasil pengukuran menunjukkan tinggi 110.5 cm (Indikasi Sangat Pendek). Surat rujukan UKS ke Puskesmas Cempaka telah disiapkan.',
    status: 'terkirim',
  },
];

// Initial Notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    type: 'stunting_alert',
    title: 'Indikasi Stunting Terdeteksi: Nabila Khairunnisa',
    message: 'Pengukuran IoT mendeteksi Z-Score TB/U -3.12 (Sangat Pendek). WhatsApp notifikasi otomatis telah dikirim ke wali murid.',
    timestamp: '2026-10-05T09:05:00Z',
    read: false,
    urgency: 'high',
    studentId: 'std_04',
  },
  {
    id: 'notif_02',
    type: 'stunting_alert',
    title: 'Indikasi Stunting Terdeteksi: Aisyah Putri Rahmadani',
    message: 'Pengukuran IoT mendeteksi Z-Score TB/U -2.48 (Pendek). Orang tua telah membaca pesan notifikasi WhatsApp.',
    timestamp: '2026-10-05T08:35:00Z',
    read: true,
    urgency: 'high',
    studentId: 'std_02',
  },
  {
    id: 'notif_03',
    type: 'iot_sync',
    title: 'Sinkronisasi IoT Stadiometer Berhasil',
    message: 'Perangkat IOT-ANTRO-SDN1C-01 berhasil menyinkronkan 8 data pengukuran terbaru ke dasbor guru.',
    timestamp: '2026-10-05T10:00:00Z',
    read: true,
    urgency: 'low',
  },
  {
    id: 'notif_04',
    type: 'parent_ack',
    title: 'Konfirmasi Tindak Lanjut Orang Tua',
    message: 'Ibu Siti Aminah (Wali Aisyah) mengonfirmasi akan mengambil paket PMT telur & susu di UKS.',
    timestamp: '2026-10-05T09:15:00Z',
    read: true,
    urgency: 'medium',
  },
];

// Storage Helper Functions
export const storage = {
  getUsers(): User[] {
    const val = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!val) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(val);
  },

  getActiveUser(): User {
    const val = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!val) {
      const defaultUser = INITIAL_USERS[0]; // Guru UKS
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(val);
  },

  setActiveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  },

  getStudents(): Student[] {
    const val = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!val) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(val);
  },

  saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getMeasurements(): Measurement[] {
    const val = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
    if (!val) {
      const initial = generateInitialMeasurements();
      localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(val);
  },

  saveMeasurements(measurements: Measurement[]): void {
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  },

  getAlerts(): WhatsAppAlert[] {
    const val = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!val) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return JSON.parse(val);
  },

  saveAlerts(alerts: WhatsAppAlert[]): void {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },

  getIoTDevice(): IoTDeviceState {
    const val = localStorage.getItem(STORAGE_KEYS.IOT_DEVICE);
    if (!val) {
      localStorage.setItem(STORAGE_KEYS.IOT_DEVICE, JSON.stringify(INITIAL_IOT_DEVICE));
      return INITIAL_IOT_DEVICE;
    }
    return JSON.parse(val);
  },

  saveIoTDevice(device: IoTDeviceState): void {
    localStorage.setItem(STORAGE_KEYS.IOT_DEVICE, JSON.stringify(device));
  },

  getNotifications(): NotificationItem[] {
    const val = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!val) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(val);
  },

  saveNotifications(notifs: NotificationItem[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  isE2eEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.E2E_ENABLED);
    return val !== 'false'; // Default to true
  },

  setE2eEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.E2E_ENABLED, String(enabled));
  },

  // Reset database back to default factory state
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(generateInitialMeasurements()));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
    localStorage.setItem(STORAGE_KEYS.IOT_DEVICE, JSON.stringify(INITIAL_IOT_DEVICE));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.E2E_ENABLED, 'true');
  },
};
