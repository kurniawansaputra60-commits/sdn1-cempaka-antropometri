import React from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Cpu,
  FileSpreadsheet,
  Trash2,
  UserCheck,
  X
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectStudentFromNotif?: (studentId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectStudentFromNotif,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pusat Notifikasi Real-Time</h3>
              <p className="text-xs text-slate-500">
                Pembaruan otomatis data IoT, peringatan stunting & konfirmasi ortu
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

        {/* Action Controls */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-semibold text-slate-600">
            {unreadCount} Pesan Belum Dibaca
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllAsRead}
              className="text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
            <button
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Tidak ada notifikasi sistem saat ini.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const formattedTime = new Date(notif.timestamp).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    if (notif.studentId && onSelectStudentFromNotif) {
                      onSelectStudentFromNotif(notif.studentId);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer text-xs space-y-1 relative ${
                    notif.read
                      ? 'bg-slate-50/60 border-slate-200 text-slate-600'
                      : 'bg-teal-50/40 border-teal-200 text-slate-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {notif.type === 'stunting_alert' && (
                        <span className="w-5 h-5 rounded-md bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                      {notif.type === 'iot_sync' && (
                        <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                          <Cpu className="w-3 h-3" />
                        </span>
                      )}
                      {notif.type === 'parent_ack' && (
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <UserCheck className="w-3 h-3" />
                        </span>
                      )}
                      {notif.type === 'excel_import' && (
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-3 h-3" />
                        </span>
                      )}
                      <span className="font-bold">{notif.title}</span>
                    </div>

                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pl-7 pt-1 text-[10px] text-slate-400">
                    <span>{formattedTime}</span>
                    {notif.studentId && (
                      <span className="text-teal-700 font-semibold hover:underline">
                        Lihat Data Siswa →
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
