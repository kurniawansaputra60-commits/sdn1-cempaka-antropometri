import * as XLSX from 'xlsx';
import { Measurement, Student } from '../types';

export interface ExcelImportResult {
  validStudents: Student[];
  errors: { row: number; reason: string }[];
  totalParsed: number;
}

export function downloadTemplateExcel(): void {
  const sampleData = [
    {
      NISN: '0145892310',
      Nama_Lengkap: 'Rian Hidayat',
      Jenis_Kelamin: 'L',
      Tanggal_Lahir: '2019-04-10',
      Kelas: 'Kelas 1B',
      Nama_Wali: 'Bapak Heri Santoso',
      No_WhatsApp_Ortu: '081234567899',
      Alamat: 'Jl. Cempaka Indah No. 22',
      Golongan_Darah: 'O',
    },
    {
      NISN: '0145892311',
      Nama_Lengkap: 'Siti Nurhaliza Putri',
      Jenis_Kelamin: 'P',
      Tanggal_Lahir: '2019-09-18',
      Kelas: 'Kelas 1B',
      Nama_Wali: 'Ibu Maryam',
      No_WhatsApp_Ortu: '081399887766',
      Alamat: 'Jl. Flamboyan Timur No. 15',
      Golongan_Darah: 'A',
    },
    {
      NISN: '0134789112',
      Nama_Lengkap: 'Ahmad Raihan',
      Jenis_Kelamin: 'L',
      Tanggal_Lahir: '2018-02-14',
      Kelas: 'Kelas 2A',
      Nama_Wali: 'Bapak Mansyur',
      No_WhatsApp_Ortu: '085712334455',
      Alamat: 'Komplek Asri Cempaka D-5',
      Golongan_Darah: 'B',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Set column widths
  worksheet['!cols'] = [
    { wch: 14 }, // NISN
    { wch: 25 }, // Nama_Lengkap
    { wch: 14 }, // Jenis_Kelamin
    { wch: 15 }, // Tanggal_Lahir
    { wch: 12 }, // Kelas
    { wch: 22 }, // Nama_Wali
    { wch: 18 }, // No_WhatsApp_Ortu
    { wch: 30 }, // Alamat
    { wch: 14 }, // Golongan_Darah
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa');

  XLSX.writeFile(workbook, 'Template_Data_Siswa_SDN1_Cempaka.xlsx');
}

export async function parseExcelOrCsvFile(file: File): Promise<ExcelImportResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Parse to JSON array
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  const validStudents: Student[] = [];
  const errors: { row: number; reason: string }[] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Row in spreadsheet (header is row 1)
    
    // Normalize keys (case insensitive / space variations)
    const normalized: Record<string, string> = {};
    Object.keys(row).forEach((k) => {
      const cleanKey = k.trim().toLowerCase().replace(/\s+/g, '_');
      normalized[cleanKey] = String(row[k] || '').trim();
    });

    const nisn = normalized['nisn'] || normalized['no_nisn'] || normalized['id_siswa'];
    const name = normalized['nama_lengkap'] || normalized['nama'] || normalized['nama_siswa'];
    let gender = (normalized['jenis_kelamin'] || normalized['jk'] || normalized['gender'] || '').toUpperCase();
    let birthDate = normalized['tanggal_lahir'] || normalized['tgl_lahir'] || normalized['birth_date'];
    const grade = normalized['kelas'] || normalized['tingkat'] || 'Kelas 1';
    const parentName = normalized['nama_wali'] || normalized['orang_tua'] || normalized['wali'] || 'Orang Tua / Wali';
    let parentPhone = normalized['no_whatsapp_ortu'] || normalized['whatsapp'] || normalized['no_hp'] || normalized['telepon'] || '081200000000';
    const address = normalized['alamat'] || 'Cempaka';
    const bloodType = normalized['golongan_darah'] || normalized['goldar'] || '-';

    if (!nisn) {
      errors.push({ row: rowNum, reason: 'Kolom NISN kosong' });
      return;
    }
    if (!name) {
      errors.push({ row: rowNum, reason: 'Nama lengkap siswa kosong' });
      return;
    }

    // Gender standardization
    if (gender.startsWith('L') || gender.includes('LAKI')) {
      gender = 'L';
    } else if (gender.startsWith('P') || gender.includes('PEREMPUAN') || gender.includes('WANITA')) {
      gender = 'P';
    } else {
      gender = 'L'; // Default fallback
    }

    // Standardize birth date
    // Check if numeric Excel serial date
    if (/^\d{5}$/.test(birthDate)) {
      const parsedDate = XLSX.SSF.parse_date_code(Number(birthDate));
      birthDate = `${parsedDate.y}-${String(parsedDate.m).padStart(2, '0')}-${String(parsedDate.d).padStart(2, '0')}`;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      // Try parsing other formats (e.g. DD/MM/YYYY)
      const parts = birthDate.split(/[/\-.]/);
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          // DD/MM/YYYY
          birthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      } else {
        birthDate = '2019-01-01'; // Fallback
      }
    }

    // Clean phone number (e.g. replace +62 or 62)
    parentPhone = parentPhone.replace(/[^\d]/g, '');
    if (parentPhone.startsWith('62')) {
      parentPhone = '0' + parentPhone.substring(2);
    }

    validStudents.push({
      id: `std_imp_${Date.now()}_${index}`,
      nisn,
      name,
      gender: gender as 'L' | 'P',
      birthDate,
      grade,
      parentName,
      parentPhone,
      address,
      bloodType,
      createdDate: new Date().toISOString(),
    });
  });

  return {
    validStudents,
    errors,
    totalParsed: rawRows.length,
  };
}

export function exportAnthropometryToExcel(students: Student[], measurements: Measurement[]): void {
  const exportRows = measurements.map((m, idx) => {
    const student = students.find((s) => s.id === m.studentId);
    return {
      No: idx + 1,
      Tanggal_Ukur: new Date(m.timestamp).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      NISN: m.studentNisn,
      Nama_Siswa: m.studentName,
      Jenis_Kelamin: m.studentGender === 'L' ? 'Laki-Laki' : 'Perempuan',
      Kelas: m.studentGrade,
      Usia_Bulan: m.ageMonths,
      Tinggi_Badan_cm: m.heightCm,
      Berat_Badan_kg: m.weightKg,
      IMT: m.bmi,
      ZScore_TBU: m.zScores.tb_u,
      ZScore_BBU: m.zScores.bb_u,
      ZScore_IMTU: m.zScores.imt_u,
      Status_Stunting: m.stuntingStatus.toUpperCase().replace('_', ' '),
      Status_Gizi: m.nutritionStatus.toUpperCase().replace('_', ' '),
      Nama_Wali: student?.parentName || '-',
      WhatsApp_Wali: student?.parentPhone || '-',
      Device_IoT: m.deviceId,
      Petugas_UKS: m.measuredBy,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil_Antropometri');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Data_Antropometri_SDN1_Cempaka_${today}.xlsx`);
}
