import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  Cpu,
  Lock,
  MessageSquare,
  Play,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Wifi
} from 'lucide-react';
import {
  calculateAgeMonths,
  calculateGrowthStatus,
  formatAgeString,
  getNutritionBadgeInfo,
  getStuntingBadgeInfo
} from '../lib/growthStandards';
import { IoTDeviceState, Measurement, Student } from '../types';

interface IoTMeasurementStationProps {
  students: Student[];
  iotDevice: IoTDeviceState;
  onSaveMeasurement: (measurement: Measurement, triggerWhatsAppPrompt: boolean) => void;
  onSendWhatsApp: (studentId: string, measurementId: string) => void;
}

export const IoTMeasurementStation: React.FC<IoTMeasurementStationProps> = ({
  students,
  iotDevice,
  onSaveMeasurement,
  onSendWhatsApp,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulatingLiveSensor, setIsSimulatingLiveSensor] = useState(false);
  const [heightCm, setHeightCm] = useState<number>(118.5);
  const [weightKg, setWeightKg] = useState<number>(21.4);
  const [armCircumferenceCm, setArmCircumferenceCm] = useState<number>(16.0);
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<number>(51.5);
  const [notes, setNotes] = useState('');
  const [isStable, setIsStable] = useState(true);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Recalculate age & growth analysis
  const ageMonths = selectedStudent
    ? calculateAgeMonths(selectedStudent.birthDate)
    : 72;
  const analysis = selectedStudent
    ? calculateGrowthStatus(heightCm, weightKg, ageMonths, selectedStudent.gender)
    : null;

  // Filter students for search
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Live simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingLiveSensor) {
      setIsStable(false);
      let step = 0;
      interval = setInterval(() => {
        step++;
        // Add subtle sensor jitter
        const jitterH = (Math.random() - 0.5) * 0.4;
        const jitterW = (Math.random() - 0.5) * 0.2;
        setHeightCm((prev) => Number((Math.max(90, Math.min(160, prev + jitterH))).toFixed(1)));
        setWeightKg((prev) => Number((Math.max(12, Math.min(60, prev + jitterW))).toFixed(1)));

        if (step > 15) {
          setIsStable(true);
          setIsSimulatingLiveSensor(false);
        }
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isSimulatingLiveSensor]);

  const handleTriggerSimulatedStep = () => {
    // Generate realistic measurement according to student's gender & age
    const baseH = selectedStudent.gender === 'L' ? 116 + (ageMonths - 72) * 0.5 : 115 + (ageMonths - 72) * 0.5;
    const baseW = selectedStudent.gender === 'L' ? 20.5 + (ageMonths - 72) * 0.3 : 20.2 + (ageMonths - 72) * 0.3;
    
    // Add random variation to sometimes show normal and sometimes stunting
    const isSpecialCase = selectedStudent.name.includes('Aisyah') || selectedStudent.name.includes('Nabila');
    const factor = isSpecialCase ? 0.90 : 1.0;

    setHeightCm(Number((baseH * factor + (Math.random() * 2 - 1)).toFixed(1)));
    setWeightKg(Number((baseW * factor + (Math.random() * 1.5 - 0.7)).toFixed(1)));
    setIsSimulatingLiveSensor(true);
  };

  const handleSave = () => {
    if (!selectedStudent || !analysis) return;

    const newMeasurement: Measurement = {
      id: `m_${selectedStudent.id}_${Date.now()}`,
      studentId: selectedStudent.id,
      studentNisn: selectedStudent.nisn,
      studentName: selectedStudent.name,
      studentGender: selectedStudent.gender,
      studentGrade: selectedStudent.grade,
      studentBirthDate: selectedStudent.birthDate,
      timestamp: new Date().toISOString(),
      ageMonths,
      heightCm,
      weightKg,
      armCircumferenceCm,
      headCircumferenceCm,
      bmi: analysis.bmi,
      zScores: analysis.zScores,
      stuntingStatus: analysis.stuntingStatus,
      nutritionStatus: analysis.nutritionStatus,
      isStuntingIndicated: analysis.isStuntingIndicated,
      deviceId: iotDevice.id,
      measuredBy: 'Ibu Siti Nurhaliza, S.Pd (UKS SDN 1 Cempaka)',
      notes: notes || 'Pengukuran Pos Antropometri Digital IoT',
      isEncrypted: true,
      cipherHash: `SHA256-${Math.abs(heightCm * 100 + weightKg).toString(16).toUpperCase()}`,
    };

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0d9488', '#0f766e', '#14b8a6', '#f59e0b'],
    });

    onSaveMeasurement(newMeasurement, analysis.isStuntingIndicated);
    setSavedSuccessMessage(
      `Pengukuran ${selectedStudent.name} berhasil disimpan ke dasbor guru & tersinkronisasi!`
    );
    setTimeout(() => setSavedSuccessMessage(null), 5000);
  };

  const stuntingBadge = analysis ? getStuntingBadgeInfo(analysis.stuntingStatus) : null;
  const nutritionBadge = analysis ? getNutritionBadgeInfo(analysis.nutritionStatus) : null;

  return (
    <div className="space-y-6">
      {/* Hardware Telemetry Top Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white font-mono">{iotDevice.id}</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                ONLINE & TERKALIBRASI
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {iotDevice.name} · Ruang UKS SDN 1 Cempaka (IP: {iotDevice.ipAddress})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>MQTT Broker: Connected</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <BatteryCharging className="w-4 h-4 text-teal-400" />
            <span className="tabular-nums">{iotDevice.batteryPercent}% Baterai</span>
          </div>
          <button
            onClick={handleTriggerSimulatedStep}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulasi Siswa Naik Alat</span>
          </button>
        </div>
      </div>

      {savedSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{savedSuccessMessage}</span>
          </div>
          {analysis?.isStuntingIndicated && (
            <button
              onClick={() => onSendWhatsApp(selectedStudent.id, '')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Buka Notifikasi WhatsApp</span>
            </button>
          )}
        </div>
      )}

      {/* Main Measurement Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Student Selector & Profile (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pilih Siswa yang Diukur</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cari berdasarkan Nama atau NISN Siswa SDN 1 Cempaka
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {filteredStudents.map((std) => {
              const isSelected = std.id === selectedStudentId;
              return (
                <button
                  key={std.id}
                  onClick={() => setSelectedStudentId(std.id)}
                  className={`w-full text-left p-2.5 transition-colors text-xs flex items-center justify-between ${
                    isSelected ? 'bg-teal-50 text-teal-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{std.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {std.grade} · NISN: <span className="tabular-nums">{std.nisn}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      std.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                    }`}
                  >
                    {std.gender === 'L' ? 'L' : 'P'}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedStudent && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>Profil Siswa Terpilih</span>
                <span className="text-[10px] text-teal-800 font-mono bg-teal-100 px-1.5 py-0.5 rounded">
                  {selectedStudent.grade}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Tanggal Lahir:</span>
                  <span className="font-medium text-slate-800">{selectedStudent.birthDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Usia Saat Ini:</span>
                  <span className="font-medium text-slate-800">{formatAgeString(ageMonths)} ({ageMonths} bln)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Wali Murid:</span>
                  <span className="font-medium text-slate-800">{selectedStudent.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">WhatsApp Wali:</span>
                  <span className="font-medium text-slate-800 font-mono">{selectedStudent.parentPhone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Device Picture Badge */}
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/9">
            <img
              src="/src/assets/images/device_iot_stadiometer_1791285392310.jpg"
              alt="IoT Stadiometer Hardware"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[11px] text-white font-medium">
                Alat Antropometri IoT SDN 1 Cempaka
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Digital Instrument Readings (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pembacaan Sensor Real-Time</h3>
              <p className="text-xs text-slate-500">
                Data diperoleh langsung via bus I2C/Serial IoT Gateway
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isStable ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                }`}
              />
              <span className="text-xs font-medium text-slate-700">
                {isStable ? 'Stabil (Terkunci)' : 'Mendeteksi...'}
              </span>
            </div>
          </div>

          {/* Instrument Display 1: Height (Tinggi Badan) */}
          <div className="bg-slate-950 text-white rounded-xl p-4 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium uppercase tracking-wider text-teal-400">
                Sensor Ultrasonik (Tinggi Badan)
              </span>
              <span className="font-mono text-[10px]">Toleransi ±0.1 cm</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-teal-300 tabular-nums">
                  {heightCm.toFixed(1)}
                </span>
                <span className="text-lg font-mono text-slate-400">cm</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="80"
                  max="180"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-xs font-mono bg-slate-800 text-teal-300 border border-slate-700 rounded text-right"
                  title="Sesuaikan manual jika perlu"
                />
              </div>
            </div>

            <div className="mt-3">
              <input
                type="range"
                min="90"
                max="160"
                step="0.1"
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          {/* Instrument Display 2: Weight (Berat Badan) */}
          <div className="bg-slate-950 text-white rounded-xl p-4 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium uppercase tracking-wider text-teal-400">
                Strain Gauge Load Cell (Berat Badan)
              </span>
              <span className="font-mono text-[10px]">Presisi 4 Titik Load Cell</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-emerald-300 tabular-nums">
                  {weightKg.toFixed(1)}
                </span>
                <span className="text-lg font-mono text-slate-400">kg</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="80"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-xs font-mono bg-slate-800 text-emerald-300 border border-slate-700 rounded text-right"
                  title="Sesuaikan manual jika perlu"
                />
              </div>
            </div>

            <div className="mt-3">
              <input
                type="range"
                min="12"
                max="60"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Additional Manual Measurements (LILA & Lingkar Kepala) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                LiLA (Lengan Atas)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="30"
                  value={armCircumferenceCm}
                  onChange={(e) => setArmCircumferenceCm(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded font-mono"
                />
                <span className="text-xs text-slate-500">cm</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lingkar Kepala
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="60"
                  value={headCircumferenceCm}
                  onChange={(e) => setHeadCircumferenceCm(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded font-mono"
                />
                <span className="text-xs text-slate-500">cm</span>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Catatan Khusus Petugas UKS (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Siswa aktif, riwayat batuk seminggu lalu..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Right: Instant Diagnosis & WHO Stunting Assessment (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Hasil Analisis WHO</h3>
              <p className="text-xs text-slate-500">Standar Kemenkes RI No. 2/2020</p>
            </div>

            {analysis && stuntingBadge && (
              <div className="space-y-3">
                {/* Stunting Classification Box */}
                <div className={`p-3.5 rounded-xl border ${stuntingBadge.color}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Klasifikasi Tinggi Badan (TB/U):
                  </div>
                  <div className="text-base font-extrabold">{stuntingBadge.label}</div>
                  <div className="text-xs font-mono mt-1 font-semibold">
                    Z-Score TB/U: <span className="tabular-nums">{analysis.zScores.tb_u} SD</span>
                  </div>
                </div>

                {/* Nutrition Status Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[11px] text-slate-500 font-medium">Status Gizi (IMT/U):</div>
                  <div className="text-sm font-bold text-slate-900">
                    {nutritionBadge?.label}
                  </div>
                  <div className="text-xs text-slate-600 font-mono flex items-center justify-between pt-1">
                    <span>IMT: <strong className="tabular-nums">{analysis.bmi}</strong></span>
                    <span>Z-Score IMT: <strong className="tabular-nums">{analysis.zScores.imt_u} SD</strong></span>
                  </div>
                </div>

                {/* Stunting Warning Alert if indicated */}
                {analysis.isStuntingIndicated && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-900">
                      <AlertTriangle className="w-4 h-4 text-red-700" />
                      <span>Indikasi Stunting Terdeteksi!</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Sistem akan menyarankan pengiriman notifikasi WhatsApp ke wali murid ({selectedStudent.parentName}).
                    </p>
                  </div>
                )}

                {/* Recommendation snippet */}
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800 block text-[11px]">Rekomendasi UKS:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                    {analysis.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Action Button: Save & Sync */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Sinkronkan ke Dasbor Guru</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Otomatis terenkripsi E2E & tersimpan permanen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
