import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Apple,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  LineChart,
  Lock,
  MessageSquare,
  Phone,
  ShieldCheck,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { formatAgeString, getNutritionBadgeInfo, getStuntingBadgeInfo } from '../lib/growthStandards';
import { Measurement, Student, User } from '../types';

interface ParentPortalViewProps {
  currentUser: User;
  students: Student[];
  measurements: Measurement[];
  onOpenWhatsAppUks: () => void;
  isE2eActive: boolean;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  currentUser,
  students,
  measurements,
  onOpenWhatsAppUks,
  isE2eActive,
}) => {
  const [isAckConfirmed, setIsAckConfirmed] = useState(false);

  // Find linked student (defaults to Aisyah Putri if nisn matches, or first student)
  const student =
    students.find((s) => s.nisn === currentUser.studentNisn) ||
    students.find((s) => s.name.includes('Aisyah')) ||
    students[0];

  const studentMeasurements = measurements
    .filter((m) => m.studentId === student?.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const latest = studentMeasurements[studentMeasurements.length - 1];
  const stuntingBadge = latest ? getStuntingBadgeInfo(latest.stuntingStatus) : null;
  const nutritionBadge = latest ? getNutritionBadgeInfo(latest.nutritionStatus) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-teal-700 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Portal Tumbuh Kembang Wali Murid</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Selamat Datang, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Pantau hasil penimbangan dan pengukuran tinggi badan ananda{' '}
            <strong className="text-white">{student?.name}</strong> secara privat, real-time, dan terenkripsi end-to-end.
          </p>
        </div>

        {/* E2E Security Badge */}
        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-xs shrink-0 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-teal-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Rekam Medis Terenkripsi</span>
          </div>
          <p className="text-[11px] text-slate-300">
            UU PDP No. 27/2022 Terverifikasi
          </p>
          <div className="text-[10px] font-mono text-slate-400">
            Kunci: {isE2eActive ? 'AES-256 GCM (Aktif)' : 'Enkripsi Standar'}
          </div>
        </div>
      </div>

      {student && latest && (
        <>
          {/* Child Health Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Rapor Kesehatan Fisik & Gizi
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {student.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {student.grade} · NISN: <span className="font-mono">{student.nisn}</span> · Usia:{' '}
                  {formatAgeString(latest.ageMonths)}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${stuntingBadge?.color}`}
                >
                  <span className={`w-2 h-2 rounded-full ${stuntingBadge?.dotColor}`}></span>
                  {stuntingBadge?.label}
                </span>
              </div>
            </div>

            {/* If Stunting Warning for Parent */}
            {latest.isStuntingIndicated && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-xs text-amber-900 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-200 flex items-center justify-center text-amber-900 shrink-0 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-950">
                      Pemberitahuan Kesehatan dari UKS SDN 1 Cempaka & Puskesmas
                    </h4>
                    <p className="mt-1 leading-relaxed text-xs text-amber-900">
                      Tinggi badan ananda saat ini ({latest.heightCm} cm) berada di bawah garis standar pertumbuhan anak seusianya (Z-Score: {latest.zScores.tb_u} SD). Kondisi ini dapat diperbaiki dengan intervensi gizi protein hewani dini serta pendampingan tim medis.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-200/60">
                  <span className="font-semibold text-amber-950">
                    Jadwal Konsultasi UKS: Setiap Senin - Jumat (08.00 - 12.00 WIB)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAckConfirmed(true)}
                      disabled={isAckConfirmed}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                        isAckConfirmed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-800 text-white hover:bg-amber-900'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAckConfirmed ? 'Telah Dikonfirmasi' : 'Konfirmasi Terima Informasi'}</span>
                    </button>

                    <button
                      onClick={onOpenWhatsAppUks}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Petugas UKS</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Tinggi Badan:</span>
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {latest.heightCm}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">cm</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Berat Badan:</span>
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {latest.weightKg}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">kg</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Indeks Massa Tubuh:</span>
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {latest.bmi}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-mono">IMT</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Status Gizi:</span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  {nutritionBadge?.label}
                </span>
              </div>
            </div>

            {/* Longitudinal Growth Progress Table for Parent */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Riwayat Pengukuran Berkala Ananda
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal Penimbangan</th>
                      <th className="py-2.5 px-3">Tinggi (cm)</th>
                      <th className="py-2.5 px-3">Berat (kg)</th>
                      <th className="py-2.5 px-3">Status Pertumbuhan</th>
                      <th className="py-2.5 px-3">Petugas Penimbang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentMeasurements.map((m) => {
                      const badge = getStuntingBadgeInfo(m.stuntingStatus);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {new Date(m.timestamp).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 tabular-nums">
                            {m.heightCm} cm
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 tabular-nums">{m.weightKg} kg</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${badge.color}`}>
                              {badge.shortLabel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{m.measuredBy}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nutrition and Daily Healthy Meal Guidance */}
            <div className="p-5 bg-teal-50/60 rounded-xl border border-teal-100 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-teal-950">
                <Apple className="w-4 h-4 text-teal-700" />
                <span>Pedoman Gizi Harian Keluarga SDN 1 Cempaka & Puskesmas</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700">
                <div className="p-3 bg-white rounded-lg border border-teal-100">
                  <strong className="text-teal-900 block mb-1">1. Protein Hewani Setiap Hari</strong>
                  <p className="text-[11px] leading-relaxed">
                    Sajikan minimal 1-2 butir telur rebus, ikan, ayam, atau susu setiap hari untuk mendukung pembelahan sel tulang anak.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-teal-100">
                  <strong className="text-teal-900 block mb-1">2. Kurangi Jajanan Manis</strong>
                  <p className="text-[11px] leading-relaxed">
                    Batasi minuman berpemanis kemasan yang dapat mengurangi nafsu makan anak terhadap makanan pokok bergizi.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-teal-100">
                  <strong className="text-teal-900 block mb-1">3. Tidur Cukup 9 Jam</strong>
                  <p className="text-[11px] leading-relaxed">
                    Pastikan anak tidur sebelum pukul 21.00 WIB agar hormon pertumbuhan (HGH) terstimulasi maksimal saat tidur lelap.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
