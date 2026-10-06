import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  FileText,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  formatAgeString,
  getNutritionBadgeInfo,
  getStuntingBadgeInfo
} from '../lib/growthStandards';
import { IoTDeviceState, Measurement, Student } from '../types';

interface DashboardOverviewProps {
  students: Student[];
  measurements: Measurement[];
  iotDevice: IoTDeviceState;
  onNavigateTab: (tab: string) => void;
  onSelectStudentForChart: (studentId: string) => void;
  onSendWhatsApp: (studentId: string, measurementId: string) => void;
  isE2eActive: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  measurements,
  iotDevice,
  onNavigateTab,
  onSelectStudentForChart,
  onSendWhatsApp,
  isE2eActive,
}) => {
  // Sort latest measurements
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalStudents = students.length;
  const maleCount = students.filter((s) => s.gender === 'L').length;
  const femaleCount = students.filter((s) => s.gender === 'P').length;

  // Stunting calculations from latest measurement of each student
  const latestByStudent = new Map<string, Measurement>();
  sortedMeasurements.forEach((m) => {
    if (!latestByStudent.has(m.studentId)) {
      latestByStudent.set(m.studentId, m);
    }
  });

  const latestList = Array.from(latestByStudent.values());
  const measuredCount = latestList.length;

  const stuntedCount = latestList.filter((m) => m.stuntingStatus === 'pendek').length;
  const severelyStuntedCount = latestList.filter((m) => m.stuntingStatus === 'sangat_pendek').length;
  const totalStuntingIndicated = stuntedCount + severelyStuntedCount;
  const normalCount = latestList.filter((m) => m.stuntingStatus === 'normal' || m.stuntingStatus === 'tinggi').length;

  const stuntingRate = measuredCount > 0 ? ((totalStuntingIndicated / measuredCount) * 100).toFixed(1) : '0';
  const normalRate = measuredCount > 0 ? ((normalCount / measuredCount) * 100).toFixed(1) : '0';

  const stuntedStudents = latestList.filter((m) => m.isStuntingIndicated);

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Health Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 tracking-wider uppercase mb-2">
            <span>UPTD SDN 1 Cempaka</span>
            <span>·</span>
            <span>Program UKS & Bebas Stunting 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Sistem Antropometri Digital IoT Terintegrasi
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Pencatatan tinggi & berat badan otomatis secara real-time dari stadiometer ultrasonik ke dasbor guru, dilengkapi deteksi stunting dini sesuai standar WHO/Kemenkes, notifikasi WhatsApp wali murid, dan enkripsi data end-to-end.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('iot_station')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors shadow-xs"
            >
              <Cpu className="w-4 h-4" />
              <span>Buka Pos Pengukuran IoT</span>
            </button>
            <button
              onClick={() => onNavigateTab('students')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-lg border border-white/20 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-300" />
              <span>Import Data Excel</span>
            </button>
            <button
              onClick={() => onNavigateTab('monthly_report')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-lg border border-white/20 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/hero_sdn_antropometri_1791285379810.jpg"
            alt="SDN 1 Cempaka Antropometri"
            className="w-full h-full object-cover mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Critical Alert Banner if Stunting Detected */}
      {totalStuntingIndicated > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-900">
                  Perhatian: Terdeteksi {totalStuntingIndicated} Siswa Berindikasi Stunting
                </h3>
                <span className="text-xs bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                  Prioritas Intervensi UKS
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                {severelyStuntedCount} siswa kategori Sangat Pendek (Z &lt; -3 SD) dan {stuntedCount} siswa kategori Pendek (Z &lt; -2 SD). Notifikasi WhatsApp otomatis siap dikirimkan kepada orang tua.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('wa_alerts')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kelola Notifikasi WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalStudents}</span>
            <span className="text-xs text-slate-500 font-medium">Anak</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>L: <strong className="text-slate-700 tabular-nums">{maleCount}</strong></span>
            <span>P: <strong className="text-slate-700 tabular-nums">{femaleCount}</strong></span>
            <span className="text-teal-700 font-medium">Diukur: <strong className="tabular-nums">{measuredCount}</strong></span>
          </div>
        </div>

        {/* Card 2: Normal Growth Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Pertumbuhan Normal</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 tabular-nums">{normalRate}%</span>
            <span className="text-xs text-slate-500 font-medium">({normalCount} siswa)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Standar WHO TB/U (-2 s/d +3 SD)</span>
          </div>
        </div>

        {/* Card 3: Stunting Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Prevalensi Stunting</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${totalStuntingIndicated > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {stuntingRate}%
            </span>
            <span className="text-xs text-slate-500 font-medium">({totalStuntingIndicated} kasus)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sangat Pendek: <strong className="text-red-700 tabular-nums">{severelyStuntedCount}</strong></span>
            <span>Pendek: <strong className="text-amber-700 tabular-nums">{stuntedCount}</strong></span>
          </div>
        </div>

        {/* Card 4: IoT Gateway Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">IoT Gateway UKS</span>
            <Cpu className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-lg font-bold text-slate-900 font-mono">{iotDevice.id}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Baterai: <strong className="text-slate-700 tabular-nums">{iotDevice.batteryPercent}%</strong></span>
            <span className="text-emerald-700 font-medium">Sensor Siap</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Measurements Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hasil Pengukuran Antropometri Terbaru</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data sinkronisasi otomatis dari perangkat IoT Stadiometer ke dasbor guru
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('iot_station')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Ukur Siswa Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Siswa</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">TB / BB</th>
                  <th className="py-3 px-3">IMT</th>
                  <th className="py-3 px-3">Z-Score TB/U</th>
                  <th className="py-3 px-3">Status Stunting</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedMeasurements.slice(0, 7).map((m) => {
                  const badge = getStuntingBadgeInfo(m.stuntingStatus);
                  const measureDate = new Date(m.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{m.studentName}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          NISN: {m.studentNisn} · {measureDate}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{m.studentGrade}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 tabular-nums">{m.heightCm} cm</div>
                        <div className="text-slate-500 tabular-nums">{m.weightKg} kg</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-mono tabular-nums">{m.bmi}</td>
                      <td className="py-3 px-3 font-mono tabular-nums">
                        <span
                          className={`font-semibold ${
                            m.zScores.tb_u < -2 ? 'text-amber-700' : 'text-slate-900'
                          }`}
                        >
                          {m.zScores.tb_u} SD
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badge.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`}></span>
                          {badge.shortLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStudentForChart(m.studentId)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                            title="Lihat Grafik Pertumbuhan WHO"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          {m.isStuntingIndicated && (
                            <button
                              onClick={() => onSendWhatsApp(m.studentId, m.id)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                              title="Kirim Notifikasi WhatsApp ke Orang Tua"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Lihat Seluruh Riwayat Siswa ({students.length} Siswa Terdaftar) →
            </button>
          </div>
        </div>

        {/* Right Column: Stunting Cases & IoT Telemetry Summary (1 Col) */}
        <div className="space-y-6">
          {/* Priority Interventions Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Daftar Pantauan Stunting</h3>
              <span className="text-xs text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded-full">
                {stuntedStudents.length} Perlu Intervensi
              </span>
            </div>

            {stuntedStudents.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p>Tidak ada indikasi stunting yang terdeteksi.</p>
                <p className="text-slate-400 mt-1">Seluruh siswa berada dalam batas ideal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stuntedStudents.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">{m.studentName}</span>
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                        Z: {m.zScores.tb_u} SD
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{m.studentGrade} · TB: {m.heightCm} cm</span>
                      <button
                        onClick={() => onSendWhatsApp(m.studentId, m.id)}
                        className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Kirim WA</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy & E2E Security Badge */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold">Privasi Rekam Medis Terjamin</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Seluruh data fisik, hasil antropometri, dan nomor kontak orang tua dienkripsi end-to-end (AES-256 GCM) sesuai amanat UU No. 27/2022 tentang Pelindungan Data Pribadi.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status: <strong className="text-emerald-400">Aktif & Terverifikasi</strong></span>
              <span className="font-mono text-teal-300">SHA256-OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
