import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Info,
  LineChart,
  Lock,
  MessageSquare,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {
  formatAgeString,
  getNutritionBadgeInfo,
  getStandardCurveData,
  getStuntingBadgeInfo
} from '../lib/growthStandards';
import { Measurement, Student } from '../types';

interface GrowthChartAnalysisProps {
  students: Student[];
  measurements: Measurement[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onSendWhatsApp: (studentId: string, measurementId: string) => void;
  isE2eActive: boolean;
}

export const GrowthChartAnalysis: React.FC<GrowthChartAnalysisProps> = ({
  students,
  measurements,
  selectedStudentId,
  onSelectStudent,
  onSendWhatsApp,
  isE2eActive,
}) => {
  const [activeMetric, setActiveMetric] = useState<'height' | 'weight'>('height');

  const currentStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // Filter and sort historical measurements for this child
  const studentMeasurements = measurements
    .filter((m) => m.studentId === currentStudent?.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const latest = studentMeasurements[studentMeasurements.length - 1];
  const previous =
    studentMeasurements.length > 1
      ? studentMeasurements[studentMeasurements.length - 2]
      : null;

  const stuntingBadge = latest ? getStuntingBadgeInfo(latest.stuntingStatus) : null;
  const nutritionBadge = latest ? getNutritionBadgeInfo(latest.nutritionStatus) : null;

  // Growth trajectory deltas
  const heightDelta = previous && latest ? Number((latest.heightCm - previous.heightCm).toFixed(1)) : 0;
  const weightDelta = previous && latest ? Number((latest.weightKg - previous.weightKg).toFixed(1)) : 0;

  // WHO Standard Curves
  const whoCurves = currentStudent ? getStandardCurveData(currentStudent.gender) : [];

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 360;
  const padding = { top: 30, right: 40, bottom: 40, left: 55 };

  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Scales for Height Chart (Ages 60 to 144 months, Height 95 to 165 cm)
  const minAge = 60;
  const maxAge = 144;
  const minHeight = 95;
  const maxHeight = 165;

  const getX = (ageMonths: number) => {
    const clamped = Math.max(minAge, Math.min(maxAge, ageMonths));
    return padding.left + ((clamped - minAge) / (maxAge - minAge)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minHeight, Math.min(maxHeight, val));
    return padding.top + plotHeight - ((clamped - minHeight) / (maxHeight - minHeight)) * plotHeight;
  };

  // Build SVG path from curve array
  const createPath = (key: 'sdMinus3' | 'sdMinus2' | 'median' | 'sdPlus2' | 'sdPlus3') => {
    return whoCurves.reduce((acc, pt, idx) => {
      const x = getX(pt.ageMonths);
      const y = getY(pt[key]);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  // Trajectory path for student's actual measurements
  const studentPath = studentMeasurements.reduce((acc, m, idx) => {
    const x = getX(m.ageMonths);
    const y = getY(m.heightCm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Analisis Grafik Tren Pertumbuhan WHO</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kurva Standar Pertumbuhan Anak (Kemenkes RI No. 2/2020 & WHO)
          </p>
        </div>

        {/* Student Dropdown Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Pilih Siswa:</span>
          <select
            value={currentStudent?.id || ''}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-full sm:w-64"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.grade}) - NISN: {s.nisn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentStudent && latest && (
        <>
          {/* Quick Health Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Height & Stunting Badge */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Tinggi Badan & Status
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {latest.heightCm}
                </span>
                <span className="text-xs text-slate-500 font-medium">cm</span>
                {heightDelta !== 0 && (
                  <span
                    className={`text-xs font-bold flex items-center ${
                      heightDelta > 0 ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 inline mr-0.5" />
                    +{heightDelta} cm
                  </span>
                )}
              </div>
              <div className="mt-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${stuntingBadge?.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${stuntingBadge?.dotColor}`}></span>
                  {stuntingBadge?.label}
                </span>
              </div>
            </div>

            {/* Weight & Nutrition Badge */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Berat Badan & Gizi
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {latest.weightKg}
                </span>
                <span className="text-xs text-slate-500 font-medium">kg</span>
                {weightDelta !== 0 && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    <TrendingUp className="w-3 h-3 inline mr-0.5" />
                    +{weightDelta} kg
                  </span>
                )}
              </div>
              <div className="mt-2.5">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                  {nutritionBadge?.label}
                </span>
              </div>
            </div>

            {/* Z-Scores */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Z-Score (SD Standar)
              </span>
              <div className="mt-2 space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">TB/U:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      latest.zScores.tb_u < -2 ? 'text-amber-700' : 'text-slate-900'
                    }`}
                  >
                    {latest.zScores.tb_u} SD
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">BB/U:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{latest.zScores.bb_u} SD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">IMT/U:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{latest.zScores.imt_u} SD</span>
                </div>
              </div>
            </div>

            {/* Medical Encryption Seal */}
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Integritas Terenkripsi</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Tanda tangan digital AES-256 SHA-256 mencegah manipulasi rekam medis anak.
                </p>
              </div>
              <div className="text-[10px] font-mono text-teal-300 pt-2 border-t border-slate-800 truncate">
                Hash: {latest.cipherHash}
              </div>
            </div>
          </div>

          {/* Interactive WHO Growth Chart */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Grafik Pertumbuhan: Tinggi Badan menurut Umur (TB/U)
                </h3>
                <p className="text-xs text-slate-500">
                  Siswa: <strong>{currentStudent.name}</strong> ({currentStudent.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}) · Usia Terkini: {formatAgeString(latest.ageMonths)}
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-emerald-600"></span>
                  <span>Median Standar</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-amber-500 border-dashed"></span>
                  <span>-2 SD (Batas Stunting)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-red-600"></span>
                  <span>-3 SD (Sangat Pendek)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 ring-2 ring-teal-200"></span>
                  <span className="font-bold text-teal-800">Data Siswa</span>
                </span>
              </div>
            </div>

            {/* SVG Plot */}
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full max-w-full h-auto text-slate-700 select-none"
              >
                {/* Background Grid Lines */}
                {[100, 110, 120, 130, 140, 150, 160].map((h) => {
                  const y = getY(h);
                  return (
                    <g key={h}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        className="fill-slate-400 font-mono"
                      >
                        {h} cm
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Age Grid Lines */}
                {[60, 72, 84, 96, 108, 120, 132, 144].map((age) => {
                  const x = getX(age);
                  return (
                    <g key={age}>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={chartHeight - padding.bottom}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={chartHeight - padding.bottom + 18}
                        textAnchor="middle"
                        fontSize="10"
                        className="fill-slate-500 font-medium"
                      >
                        {Math.floor(age / 12)} Th
                      </text>
                    </g>
                  );
                })}

                {/* WHO Standard Curves */}
                {/* +3 SD */}
                <path d={createPath('sdPlus3')} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                {/* +2 SD */}
                <path d={createPath('sdPlus2')} fill="none" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
                {/* Median (0 SD) */}
                <path d={createPath('median')} fill="none" stroke="#16a34a" strokeWidth="2.5" />
                {/* -2 SD (Stunting threshold) */}
                <path d={createPath('sdMinus2')} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                {/* -3 SD (Severely stunted) */}
                <path d={createPath('sdMinus3')} fill="none" stroke="#dc2626" strokeWidth="2.2" />

                {/* Connecting Line for Student Trajectory */}
                {studentMeasurements.length > 1 && (
                  <path
                    d={studentPath}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points for Student */}
                {studentMeasurements.map((m, idx) => {
                  const cx = getX(m.ageMonths);
                  const cy = getY(m.heightCm);
                  const isLast = idx === studentMeasurements.length - 1;
                  return (
                    <g key={m.id}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isLast ? 6 : 4.5}
                        fill="#0f766e"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-transform hover:scale-125"
                      />
                      {/* Label for latest point */}
                      {isLast && (
                        <g>
                          <rect
                            x={cx - 32}
                            y={cy - 28}
                            width="64"
                            height="18"
                            rx="4"
                            fill="#0f172a"
                            opacity="0.9"
                          />
                          <text
                            x={cx}
                            y={cy - 16}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="#ffffff"
                            className="font-mono"
                          >
                            {m.heightCm} cm
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-400" />
                Garis oranye (-2 SD) merupakan batas deteksi stunting nasional Kemenkes RI.
              </span>
              <span className="font-mono text-[11px] text-teal-700">
                Pencatatan IoT Terakhir: {new Date(latest.timestamp).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>

          {/* Historical Longitudinal Table & Clinical Action Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table of Monthly Records */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Riwayat Pengukuran Berkala Siswa
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Usia</th>
                      <th className="py-2.5 px-3">Tinggi</th>
                      <th className="py-2.5 px-3">Berat</th>
                      <th className="py-2.5 px-3">Z-Score</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentMeasurements.map((m) => {
                      const badge = getStuntingBadgeInfo(m.stuntingStatus);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 text-slate-800 font-medium whitespace-nowrap">
                            {new Date(m.timestamp).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{m.ageMonths} bln</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 tabular-nums">
                            {m.heightCm} cm
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 tabular-nums">{m.weightKg} kg</td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-800">
                            {m.zScores.tb_u} SD
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge.color}`}>
                              {badge.shortLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations & Puskesmas Action Plan */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Rekomendasi Tindak Lanjut UKS & Puskesmas
                </h3>
                {latest.isStuntingIndicated && (
                  <button
                    onClick={() => onSendWhatsApp(currentStudent.id, latest.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Kirim WA ke Wali</span>
                  </button>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Program Intervensi Gizi Spesifik Sekolah:</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                  <li>
                    Pemberian Makanan Tambahan (PMT) Berbasis Pangan Lokal: Telur rebus 1 butir dan susu UHT setiap hari belajar.
                  </li>
                  <li>
                    Edukasi pedoman &quot;Isi Piringku&quot; (50% karbohidrat &amp; sayur, 50% protein hewani &amp; buah).
                  </li>
                  <li>
                    Pemberian tablet obat cacing berkala (Albendazole) bersama Tim Puskesmas Pembina Cempaka.
                  </li>
                  <li>
                    Skrining kebiasaan tidur (minimal 8-10 jam/hari untuk menstimulasi Growth Hormone).
                  </li>
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 bg-teal-50/60 border border-teal-100 p-3 rounded-lg">
                <strong className="text-teal-900 block mb-0.5">Kontak Tim Medis UKS SDN 1 Cempaka:</strong>
                Pembina UKS: Ibu Siti Nurhaliza, S.Pd · Petugas Gizi Puskesmas: dr. Hendro Suwandi (Telp: 0812-9988-7711)
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
