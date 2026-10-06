import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { exportAnthropometryToExcel } from '../lib/excelService';
import { formatAgeString, getStuntingBadgeInfo } from '../lib/growthStandards';
import { computeMonthlyReportStats } from '../lib/pdfGenerator';
import { Measurement, Student } from '../types';

interface MonthlyReportViewProps {
  students: Student[];
  measurements: Measurement[];
  isE2eActive: boolean;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  students,
  measurements,
  isE2eActive,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 0-indexed: 9 = Oktober
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const periodDate = new Date(selectedYear, selectedMonth, 1);
  const periodLabel = periodDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Filter measurements by month and grade
  const filteredMeasurements = measurements.filter((m) => {
    const d = new Date(m.timestamp);
    const matchesPeriod = d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    const matchesGrade = selectedGrade === 'all' || m.studentGrade === selectedGrade;
    return matchesPeriod && matchesGrade;
  });

  const stats = computeMonthlyReportStats(filteredMeasurements, periodDate);

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Controls (hidden on print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs no-print flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Laporan Perkembangan Bulanan (Format PDF)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen resmi rekapitulasi data tumbuh kembang siswa untuk Dinas Pendidikan dan Puskesmas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none"
            >
              <option value={9}>Oktober 2026</option>
              <option value={8}>September 2026</option>
              <option value={7}>Agustus 2026</option>
              <option value={6}>Juli 2026</option>
            </select>
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Kelas</option>
              <option value="Kelas 1A">Kelas 1A</option>
              <option value="Kelas 1B">Kelas 1B</option>
              <option value="Kelas 2B">Kelas 2B</option>
              <option value="Kelas 3A">Kelas 3A</option>
              <option value="Kelas 4">Kelas 4</option>
              <option value="Kelas 5">Kelas 5</option>
              <option value="Kelas 6">Kelas 6</option>
            </select>
          </div>

          {/* Export to Excel */}
          <button
            onClick={() => exportAnthropometryToExcel(students, filteredMeasurements)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-300" />
            <span>Export Excel</span>
          </button>

          {/* Download / Print PDF */}
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Unduh / Cetak Dokumen PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Official Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print-container text-slate-900">
        {/* Kop Surat Resmi Sekolah */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center relative">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-700">
              PEMERINTAH DAERAH KABUPATEN · DINAS PENDIDIKAN
            </h4>
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-900">
              UPTD SATUAN PENDIDIKAN SDN 1 CEMPAKA
            </h2>
            <p className="text-xs text-slate-600">
              Jalan Pendidikan No. 01, Cempaka · NPSN: 20602495 · Akreditasi B
            </p>
            <p className="text-[11px] text-teal-800 font-semibold tracking-wide">
              PROGRAM TERPADU UKS SEKOLAH SEHAT BEBAS STUNTING BERSAMA PUSKESMAS WARUNGGUNUNG
            </p>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-6">
          <h3 className="text-base font-extrabold uppercase underline tracking-wide">
            LAPORAN REKAPITULASI HASIL PENGUKURAN ANTROPOMETRI DIGITAL IoT
          </h3>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Periode: <span className="uppercase text-slate-900">{periodLabel}</span> · Kelas: {selectedGrade === 'all' ? 'Seluruh Tingkat (Kelas 1 - 6)' : selectedGrade}
          </p>
        </div>

        {/* Executive Summary Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Total Siswa Diukur:</span>
            <strong className="text-base text-slate-900 tabular-nums">{stats.totalStudentsMeasured} Siswa</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Pertumbuhan Normal:</span>
            <strong className="text-base text-emerald-700 tabular-nums">{stats.normalCount} Siswa ({stats.totalStudentsMeasured > 0 ? ((stats.normalCount / stats.totalStudentsMeasured) * 100).toFixed(1) : 0}%)</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Indikasi Stunting:</span>
            <strong className="text-base text-amber-700 tabular-nums">{stats.stuntedCount + stats.severelyStuntedCount} Kasus ({stats.stuntingRatePercent}%)</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Gizi Kurang / Buruk:</span>
            <strong className="text-base text-red-700 tabular-nums">{stats.poorNutritionCount} Kasus</strong>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-2 border border-slate-300 text-center w-8">No</th>
                <th className="py-2.5 px-3 border border-slate-300">NISN</th>
                <th className="py-2.5 px-3 border border-slate-300">Nama Siswa</th>
                <th className="py-2.5 px-2 border border-slate-300 text-center w-10">JK</th>
                <th className="py-2.5 px-2 border border-slate-300 text-center">Kelas</th>
                <th className="py-2.5 px-2 border border-slate-300 text-right">TB (cm)</th>
                <th className="py-2.5 px-2 border border-slate-300 text-right">BB (kg)</th>
                <th className="py-2.5 px-2 border border-slate-300 text-center">Z-Score TB/U</th>
                <th className="py-2.5 px-3 border border-slate-300">Status Stunting</th>
                <th className="py-2.5 px-3 border border-slate-300">Tindak Lanjut UKS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMeasurements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada data pengukuran pada periode {periodLabel}.
                  </td>
                </tr>
              ) : (
                filteredMeasurements.map((m, idx) => {
                  const badge = getStuntingBadgeInfo(m.stuntingStatus);
                  const student = students.find((s) => s.id === m.studentId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-mono text-[11px]">
                        {m.studentNisn}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-medium">
                        {m.studentName}
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-bold text-[11px]">
                        {m.studentGender}
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-center">
                        {m.studentGrade}
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-right font-mono font-bold tabular-nums">
                        {m.heightCm}
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-right font-mono tabular-nums">
                        {m.weightKg}
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold tabular-nums">
                        <span className={m.zScores.tb_u < -2 ? 'text-red-700' : 'text-slate-800'}>
                          {m.zScores.tb_u}
                        </span>
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold text-[11px]">
                        {badge.shortLabel}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-[11px] text-slate-600">
                        {m.stuntingStatus === 'sangat_pendek'
                          ? 'Rujukan Puskesmas & PMT Susu'
                          : m.stuntingStatus === 'pendek'
                          ? 'Notifikasi WA Wali & Konseling Gizi'
                          : 'Pertahankan Gizi Seimbang'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legal & Medical Verification Badge */}
        <div className="mb-10 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Dokumen ini dihasilkan secara otomatis oleh <strong>Sistem Antropometri Digital IoT SDN 1 Cempaka</strong> dengan data terenkripsi E2E sesuai UU No. 27/2022 (UU PDP).
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            ID Dokumen: RPT-{selectedYear}{String(selectedMonth + 1).padStart(2, '0')}-SDN1C
          </span>
        </div>

        {/* 3 Signatures Block */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs pt-4 border-t border-slate-200">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-0.5">Kepala Sekolah SDN 1 Cempaka</p>
            <div className="h-20 flex items-end justify-center">
              <div className="w-32 border-b border-slate-800"></div>
            </div>
            <p className="font-bold text-slate-900 mt-1">Nenah, M.Pd</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP. 19800206 200701 2 008</p>
          </div>

          <div>
            <p className="text-slate-600">Penanggung Jawab Medis,</p>
            <p className="font-bold text-slate-900 mt-0.5">Petugas Gizi Puskesmas Cempaka</p>
            <div className="h-20 flex items-end justify-center">
              <div className="w-32 border-b border-slate-800"></div>
            </div>
            <p className="font-bold text-slate-900 mt-1">dr. Hendro Suwandi</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP. 19820315 200902 1 004</p>
          </div>

          <div>
            <p className="text-slate-600">Cempaka, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-900 mt-0.5">Pembina UKS SDN 1 Cempaka</p>
            <div className="h-20 flex items-end justify-center">
              <div className="w-32 border-b border-slate-800"></div>
            </div>
            <p className="font-bold text-slate-900 mt-1">Ibu Siti Nurhaliza, S.Pd</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP. 19881120 201201 2 003</p>
          </div>
        </div>
      </div>
    </div>
  );
};
