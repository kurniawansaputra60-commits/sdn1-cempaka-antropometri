import { Measurement, Student, WhatsAppAlert } from '../types';
import { getStuntingBadgeInfo } from './growthStandards';

export function buildOfficialWhatsAppMessage(student: Student, measurement: Measurement): string {
  const badge = getStuntingBadgeInfo(measurement.stuntingStatus);
  const measureDate = new Date(measurement.timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const recommendationBullets = measurement.stuntingStatus === 'sangat_pendek'
    ? `1. Membawa anak ke Puskesmas Cempaka untuk pemeriksaan tumbuh kembang komprehensif (Surat rujukan UKS telah disiapkan).\n2. Tingkatkan konsumsi protein hewani (minimal 2 butir telur/hari, susu, dan ikan).\n3. Pengambilan paket PMT Pemulihan di Pos UKS SDN 1 Cempaka setiap hari Senin & Kamis.`
    : `1. Konseling gizi bersama Petugas UKS dan Wali Kelas.\n2. Pastikan sarapan pagi bergizi seimbang dengan porsi protein hewani cukup.\n3. Pemantauan tinggi badan rutin pada siklus pengukuran IoT bulan depan.`;

  return `*NOTIFIKASI PERKEMBANGAN TUMBUH KEMBANG SISWA*
*UKS TERPADU SDN 1 CEMPAKA & PUSKESMAS CEMPAKA*
────────────────────────────────
Yth. Bapak/Ibu Wali dari:
*Nama Siswa:* ${student.name}
*NISN:* ${student.nisn}
*Kelas:* ${student.grade}

Berdasarkan hasil pengukuran antropometri digital berbasis IoT pada ${measureDate}:
• *Tinggi Badan (TB):* ${measurement.heightCm} cm
• *Berat Badan (BB):* ${measurement.weightKg} kg
• *Indeks Massa Tubuh (IMT):* ${measurement.bmi}
• *Z-Score TB/U:* ${measurement.zScores.tb_u} SD
• *Status Pertumbuhan:* *${badge.label.toUpperCase()}*
• *Status Gizi:* ${measurement.nutritionStatus.toUpperCase().replace('_', ' ')}

*PANDUAN & REKOMENDASI TINDAK LANJUT:*
${recommendationBullets}

Privasi data medis ini dijamin terenkripsi end-to-end sesuai UU No. 27/2022 (UU PDP).

Jika Bapak/Ibu membutuhkan konsultasi lebih lanjut, silakan hubungi Ruang UKS SDN 1 Cempaka pada jam operasional sekolah.
_Pesan otomatis Sistem Antropometri IoT SDN 1 Cempaka_`;
}

export function createWhatsAppWebUrl(phone: string, text: string): string {
  // Format Indonesian phone numbers to 62...
  let cleanPhone = phone.replace(/[^\d]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }

  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

export function dispatchWhatsAppAlert(
  student: Student,
  measurement: Measurement,
  onAlertCreated?: (alert: WhatsAppAlert) => void
): WhatsAppAlert {
  const messageText = buildOfficialWhatsAppMessage(student, measurement);
  const alert: WhatsAppAlert = {
    id: `wa_alert_${Date.now()}`,
    measurementId: measurement.id,
    studentId: student.id,
    studentNisn: student.nisn,
    studentName: student.name,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    sentAt: new Date().toISOString(),
    stuntingStatus: measurement.stuntingStatus,
    nutritionStatus: measurement.nutritionStatus,
    messageText,
    status: 'terkirim',
  };

  if (onAlertCreated) {
    onAlertCreated(alert);
  }

  return alert;
}
