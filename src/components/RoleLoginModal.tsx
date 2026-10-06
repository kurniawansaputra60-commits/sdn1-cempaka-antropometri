import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import { INITIAL_USERS } from '../lib/storage';
import { User, UserRole } from '../types';

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('guru');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMsg('Silakan masukkan alamat email');
      return;
    }

    const matched = INITIAL_USERS.find((u) => u.role === roleInput);
    if (matched) {
      onSelectUser({
        ...matched,
        email: emailInput,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sistem Login Berbasis Peran (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                SDN 1 Cempaka Antropometri & Rekam Medis
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

        {/* Current User Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Sedang Aktif Sebagai:</span>
            <strong className="text-slate-900">{currentUser.name}</strong>
            <span className="text-teal-700 font-bold block uppercase text-[10px]">
              Peran: {currentUser.role}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        </div>

        {/* 1-Click Role Switcher Options */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Pilih Profil Akses untuk Demonstrasi:
          </h4>

          <div className="space-y-2">
            {INITIAL_USERS.map((user) => {
              const isCurrent = user.id === currentUser.id || user.role === currentUser.role;

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs flex items-center justify-between ${
                    isCurrent
                      ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'guru'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {user.role === 'admin' ? 'Administrator' : user.role === 'guru' ? 'Guru UKS' : 'Orang Tua'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{user.title}</p>
                    <p className="text-slate-400 text-[10px] font-mono">{user.email}</p>
                  </div>

                  {isCurrent ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  ) : (
                    <span className="text-xs font-bold text-teal-700 hover:underline shrink-0">
                      Pilih →
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Privileges Overview */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1 leading-relaxed">
          <strong className="text-slate-900 block font-semibold">Tingkatan Hak Akses:</strong>
          <p>• <strong>Guru UKS:</strong> Mengukur IoT, impor Excel, cetak PDF, kirim WhatsApp stunting.</p>
          <p>• <strong>Admin:</strong> Konfigurasi IoT Gateway, kunci enkripsi, integrasi API sistem.</p>
          <p>• <strong>Orang Tua:</strong> Akses privat data ananda, grafik, verifikasi pesan WhatsApp.</p>
        </div>
      </div>
    </div>
  );
};
