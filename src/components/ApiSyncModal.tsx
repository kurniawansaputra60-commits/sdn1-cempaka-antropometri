import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Code,
  Copy,
  Cpu,
  Layers,
  Play,
  RefreshCw,
  Send,
  Terminal,
  Wifi,
  X
} from 'lucide-react';
import { Measurement, Student } from '../types';

interface ApiSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerMockIotPayload: (mockMeasurement: Partial<Measurement>) => void;
  students: Student[];
}

export const ApiSyncModal: React.FC<ApiSyncModalProps> = ({
  isOpen,
  onClose,
  onTriggerMockIotPayload,
  students,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'tester'>('endpoints');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSyncAllDevices = () => {
    setIsSyncing(true);
    setSyncStatus('Menghubungkan ke Gateway IoT SDN 1 Cempaka...');
    setTimeout(() => {
      setSyncStatus('Menyinkronkan 8 catatan antropometri dan status WhatsApp...');
    }, 800);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Sinkronisasi Berhasil! Semua perangkat UKS telah mutakhir.');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1800);
  };

  const handleSendTestPayload = () => {
    const student = students[0];
    onTriggerMockIotPayload({
      studentId: student.id,
      studentNisn: student.nisn,
      studentName: student.name,
      studentGrade: student.grade,
      heightCm: 119.8,
      weightKg: 22.3,
    });
    setSyncStatus(`Payload uji coba untuk ${student.name} berhasil diterima dari sensor IoT ESP32!`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const curlExample = `curl -X POST https://sdn1cempaka-antropometri.vercel.app/api/iot/measurements \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sdn1c_antro_live_sec_key_2026" \\
  -d '{
    "deviceId": "IOT-ANTRO-SDN1C-01",
    "studentNisn": "0145892301",
    "heightCm": 120.4,
    "weightKg": 22.8,
    "armCircumferenceCm": 16.5,
    "timestamp": "${new Date().toISOString()}"
  }'`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Integrasi API & Sinkronisasi Antar-Perangkat
              </h3>
              <p className="text-xs text-slate-500">
                REST API & Webhook untuk Stadiometer ESP32 / Arduino / Tablet UKS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Action Trigger */}
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div>
            <strong className="text-teal-950 block">Sinkronisasi Database Otomatis:</strong>
            <span className="text-teal-800">
              Sinkronkan cache lokal dengan server Cloud & Gateway IoT SDN 1 Cempaka.
            </span>
          </div>
          <button
            onClick={handleSyncAllDevices}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>

        {syncStatus && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{syncStatus}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'endpoints'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dokumentasi Endpoint REST API
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'tester'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Simulator Hardware IoT ESP32
          </button>
        </div>

        {activeTab === 'endpoints' ? (
          <div className="space-y-4 text-xs">
            {/* Endpoint 1 */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-900">/api/iot/measurements</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Mengirimkan pembacaan sensor tinggi ultrasonik dan timbangan digital secara real-time dari alat stadiometer. Otomatis menghitung Z-score WHO dan memicu WhatsApp jika stunting terdeteksi.
              </p>
            </div>

            {/* Endpoint 2 */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  GET
                </span>
                <span className="font-mono font-bold text-slate-900">/api/students</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Mengambil daftar seluruh siswa SDN 1 Cempaka untuk pemindaian barcode/RFID pada alat ukur fisik.
              </p>
            </div>

            {/* cURL Example */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold flex items-center gap-1.5 text-slate-900">
                  <Terminal className="w-3.5 h-3.5" />
                  Contoh Pengiriman cURL dari Perangkat IoT:
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(curlExample);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="text-teal-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode ? 'Tersalin' : 'Salin cURL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800">
                {curlExample}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span>Uji Coba Transmisi Data Sensor IoT</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Simulasikan sensor stadiometer mengirimkan paket pengukuran baru (119.8 cm / 22.3 kg) untuk memverifikasi penyimpanan langsung ke dasbor guru dan pembaruan notifikasi real-time.
              </p>
              <button
                onClick={handleSendTestPayload}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-2xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Kirim Sinyal IoT Simulasi Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
