import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCheck,
  Clock,
  Copy,
  ExternalLink,
  MessageSquare,
  MessageSquareText,
  Phone,
  Send,
  Sparkles,
  User,
  Users
} from 'lucide-react';
import { getStuntingBadgeInfo } from '../lib/growthStandards';
import {
  buildOfficialWhatsAppMessage,
  createWhatsAppWebUrl,
  dispatchWhatsAppAlert
} from '../lib/whatsappService';
import { Measurement, Student, WhatsAppAlert } from '../types';

interface WhatsAppAlertCenterProps {
  students: Student[];
  measurements: Measurement[];
  alerts: WhatsAppAlert[];
  onAddAlert: (alert: WhatsAppAlert) => void;
  onUpdateAlertStatus: (alertId: string, status: 'terkirim' | 'dibaca' | 'ditindaklanjuti') => void;
}

export const WhatsAppAlertCenter: React.FC<WhatsAppAlertCenterProps> = ({
  students,
  measurements,
  alerts,
  onAddAlert,
  onUpdateAlertStatus,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.find((s) => s.name.includes('Aisyah'))?.id || students[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'terkirim' | 'dibaca' | 'ditindaklanjuti'>('all');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Find latest measurement for this student
  const studentMeasurements = measurements
    .filter((m) => m.studentId === selectedStudent?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const latestMeasurement = studentMeasurements[0];

  // Message preview
  const previewText =
    selectedStudent && latestMeasurement
      ? buildOfficialWhatsAppMessage(selectedStudent, latestMeasurement)
      : 'Pilih siswa untuk melihat pratinjau pesan.';

  // Stunted students who need alert
  const stuntedStudents = students.filter((s) => {
    const m = measurements.find((meas) => meas.studentId === s.id);
    return m?.isStuntingIndicated;
  });

  const handleSendViaWhatsAppWeb = () => {
    if (!selectedStudent || !latestMeasurement) return;

    const newAlert = dispatchWhatsAppAlert(selectedStudent, latestMeasurement, (alert) => {
      onAddAlert(alert);
    });

    const url = createWhatsAppWebUrl(selectedStudent.parentPhone, newAlert.messageText);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(previewText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleBroadcastAllStunted = () => {
    stuntedStudents.forEach((std) => {
      const m = measurements.find((meas) => meas.studentId === std.id);
      if (m) {
        dispatchWhatsAppAlert(std, m, (alert) => {
          onAddAlert(alert);
        });
      }
    });
    alert(`Berhasil mengirimkan notifikasi WhatsApp otomatis ke ${stuntedStudents.length} orang tua siswa!`);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Pusat Notifikasi WhatsApp Resmi UKS SDN 1 Cempaka</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Pemberitahuan Otomatis Deteksi Stunting ke Orang Tua
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrasi pengiriman pesan WhatsApp formal dengan panduan rujukan gizi Puskesmas Cempaka
          </p>
        </div>

        <button
          onClick={handleBroadcastAllStunted}
          disabled={stuntedStudents.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim Notifikasi ke Semua Kasus Stunting ({stuntedStudents.length})</span>
        </button>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Message Composer & Interactive WhatsApp Chat Bubble Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pratinjau Pesan WhatsApp</h3>
              <p className="text-xs text-slate-500">
                Pesan akan dikirim langsung ke nomor ponsel wali murid
              </p>
            </div>

            {/* Select Target Student */}
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && latestMeasurement && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">Penerima:</span>{' '}
                <strong className="text-slate-900">{selectedStudent.parentName}</strong>
                <span className="text-slate-400"> (Wali dari {selectedStudent.name})</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-emerald-700 font-semibold">
                <Phone className="w-3 h-3" />
                <span>{selectedStudent.parentPhone}</span>
              </div>
            </div>
          )}

          {/* WhatsApp Mobile Chat Mockup */}
          <div className="bg-[#EFEAE2] rounded-xl p-4 sm:p-5 border border-slate-200 shadow-inner relative overflow-hidden">
            {/* WhatsApp Top Header Bar */}
            <div className="bg-[#008069] text-white px-3 py-2 rounded-t-lg -mt-1 -mx-1 mb-3 flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
                  UKS
                </div>
                <span>UKS Terpadu SDN 1 Cempaka</span>
              </div>
              <span className="text-[10px] text-white/80">Online</span>
            </div>

            {/* Message Bubble */}
            <div className="bg-white rounded-lg p-3.5 shadow-sm text-xs text-slate-800 leading-relaxed font-sans max-w-lg whitespace-pre-line border border-slate-100 relative">
              {previewText}
              <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1 font-mono">
                <span>Sekarang</span>
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSuccess ? 'Tersalin ke Clipboard!' : 'Salin Teks Pesan'}</span>
            </button>

            <button
              onClick={handleSendViaWhatsAppWeb}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Sekarang via WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>

        {/* Right: Notification Delivery Log & Parent Confirmation (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Pengiriman Pesan</h3>
              <p className="text-xs text-slate-500">Status penyampaian dan tindak lanjut orang tua</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {alerts.length} Notifikasi
            </span>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('terkirim')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'terkirim' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terkirim
            </button>
            <button
              onClick={() => setStatusFilter('dibaca')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'dibaca' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dibaca
            </button>
            <button
              onClick={() => setStatusFilter('ditindaklanjuti')}
              className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'ditindaklanjuti' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selesai
            </button>
          </div>

          {/* Alert Log Items */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada riwayat notifikasi untuk filter ini.
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const badge = getStuntingBadgeInfo(alert.stuntingStatus);
                const sendTime = new Date(alert.sentAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">{alert.studentName}</div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge.color}`}>
                        {badge.shortLabel}
                      </span>
                    </div>

                    <div className="text-slate-500 text-[11px] flex items-center justify-between">
                      <span>Wali: {alert.parentName}</span>
                      <span className="font-mono">{alert.parentPhone}</span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 line-clamp-2">
                      {alert.messageText}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                      <span className="text-slate-400">{sendTime}</span>

                      {/* Status toggle selector */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateAlertStatus(alert.id, 'terkirim')}
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            alert.status === 'terkirim'
                              ? 'bg-slate-200 text-slate-800 font-bold'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="Tandai Terkirim"
                        >
                          Terkirim
                        </button>
                        <button
                          onClick={() => onUpdateAlertStatus(alert.id, 'dibaca')}
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            alert.status === 'dibaca'
                              ? 'bg-blue-100 text-blue-800 font-bold'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="Tandai Dibaca"
                        >
                          Dibaca
                        </button>
                        <button
                          onClick={() => onUpdateAlertStatus(alert.id, 'ditindaklanjuti')}
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            alert.status === 'ditindaklanjuti'
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="Tandai Sudah Ditindaklanjuti UKS"
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
