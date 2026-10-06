import React from 'react';
import {
  Activity,
  Bell,
  Cpu,
  FileSpreadsheet,
  FileText,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  LineChart,
  Lock,
  MessageSquareText,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';
import { IoTDeviceState, User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenRoleModal: () => void;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  onOpenDeploymentGuide: () => void;
  onOpenApiModal: () => void;
  iotDevice: IoTDeviceState;
  isE2eActive: boolean;
  onToggleE2e: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenRoleModal,
  unreadNotifCount,
  onOpenNotifications,
  onOpenDeploymentGuide,
  onOpenApiModal,
  iotDevice,
  isE2eActive,
  onToggleE2e,
}) => {
  const isParent = currentUser.role === 'orang_tua';

  const navLinks = isParent
    ? [
        { id: 'parent_portal', label: 'Rapor Anak', icon: UserCheck },
        { id: 'growth_charts', label: 'Grafik Pertumbuhan', icon: LineChart },
        { id: 'wa_alerts', label: 'Pesan UKS', icon: MessageSquareText },
      ]
    : [
        { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
        { id: 'iot_station', label: 'Pos Ukur IoT', icon: Cpu },
        { id: 'students', label: 'Data Siswa & Excel', icon: Users },
        { id: 'growth_charts', label: 'Grafik WHO', icon: LineChart },
        { id: 'wa_alerts', label: 'WhatsApp Stunting', icon: MessageSquareText },
        { id: 'monthly_report', label: 'Laporan PDF', icon: FileText },
      ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs no-print">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-teal-300">UPTD SDN 1 Cempaka</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300 hidden sm:inline">NPSN: 20214589</span>
          <span className="text-slate-400 hidden sm:inline">·</span>
          <span className="text-slate-300 hidden md:inline">Mitra Puskesmas Pembina Cempaka</span>
        </div>

        <div className="flex items-center gap-4">
          {/* E2E Medical Privacy Indicator */}
          <button
            onClick={onToggleE2e}
            title="Sertifikasi Enkripsi Rekam Medis UU PDP No. 27/2022"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {isE2eActive ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">E2E Enkripsi Aktif</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Enkripsi Standar</span>
              </>
            )}
          </button>

          <span className="text-slate-600">|</span>

          {/* IoT Status Quick Dot */}
          <div className="flex items-center gap-1.5" title={`Perangkat: ${iotDevice.id} - ${iotDevice.ipAddress}`}>
            <span
              className={`w-2 h-2 rounded-full ${
                iotDevice.status === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 text-xs hidden sm:inline">
              IoT {iotDevice.status === 'online' ? 'Terhubung' : 'Standby'} ({iotDevice.batteryPercent}%)
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* GitHub & Vercel Guide Action */}
          <button
            onClick={onOpenDeploymentGuide}
            className="flex items-center gap-1 text-slate-300 hover:text-teal-300 transition-colors text-xs"
            title="Panduan Deployment ke Vercel & GitHub"
          >
            <GitBranch className="w-3 h-3" />
            <span className="hidden sm:inline">Deploy & GitHub</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar - Strict 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(isParent ? 'parent_portal' : 'dashboard');
              }}
              className="text-base font-bold tracking-tight text-slate-900 block leading-tight hover:text-teal-700 transition-colors"
            >
              Antropometri IoT SDN 1 Cempaka
            </a>
            <span className="text-xs text-slate-500 font-normal">Sistem Monitoring Gizi & Stunting Siswa</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions & User Role Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* API Sync Modal Button */}
          <button
            onClick={onOpenApiModal}
            title="Integrasi API & Sinkronisasi IoT Perangkat"
            className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <Cpu className="w-4 h-4" />
          </button>

          {/* Real-time Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Pusat Notifikasi Real-time"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* User Role Switcher Button */}
          <button
            onClick={onOpenRoleModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            title="Ganti Peran Pengguna (Admin / Guru / Orang Tua)"
          >
            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-teal-700 font-medium uppercase tracking-wider">
                {currentUser.role === 'admin'
                  ? 'Admin'
                  : currentUser.role === 'guru'
                  ? 'Guru UKS'
                  : 'Orang Tua'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center overflow-x-auto border-t border-slate-200 px-4 py-2 gap-2 bg-slate-50">
        {navLinks.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-colors ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 bg-white border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
