import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  GitBranch,
  Github,
  Globe,
  HelpCircle,
  Key,
  ShieldCheck,
  Terminal,
  X
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const gitCommands = `git init
git add .
git commit -m "feat: Sistem Antropometri Digital IoT SDN 1 Cempaka"
git branch -M main
git remote add origin https://github.com/USERNAME/sdn1-cempaka-antropometri.git
git push -u origin main`;

  const vercelEnvVars = [
    { key: 'VITE_APP_NAME', val: 'Sistem Antropometri Digital IoT SDN 1 Cempaka', desc: 'Nama aplikasi sekolah' },
    { key: 'VITE_SCHOOL_NAME', val: 'SDN 1 Cempaka', desc: 'Identitas instansi pendidikan' },
    { key: 'VITE_SCHOOL_NPSN', val: '20214589', desc: 'Nomor Pokok Sekolah Nasional' },
    { key: 'VITE_IOT_DEVICE_ID', val: 'IOT-ANTRO-SDN1C-01', desc: 'ID hardware stadiometer IoT' },
    { key: 'VITE_IOT_API_KEY', val: 'sdn1c_antro_live_sec_key_2026', desc: 'Token otentikasi sensor IoT' },
    { key: 'VITE_WHATSAPP_GATEWAY_URL', val: 'https://api.fonnte.com/send', desc: 'Endpoint WhatsApp Gateway' },
    { key: 'VITE_ENCRYPTION_MASTER_KEY', val: 'sdn1c_med_priv_key_aes256gcm_secret', desc: 'Kunci enkripsi E2E medis' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Globe className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Panduan Berbagi ke GitHub & Deploy ke Vercel (.app)
              </h3>
              <p className="text-xs text-slate-500">
                Langkah-langkah publikasi dan konfigurasi environment lengkap
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

        {/* Section 1: Push to GitHub */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Github className="w-4 h-4 text-slate-800" />
              <span>1. Langkah Push ke Repositori GitHub</span>
            </h4>
            <button
              onClick={() => handleCopy(gitCommands, 'git')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey === 'git' ? 'Tersalin!' : 'Salin Perintah Git'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {gitCommands}
          </pre>
        </div>

        {/* Section 2: Deploy to Vercel */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-teal-600" />
            <span>2. Langkah Deploy ke Vercel.app</span>
          </h4>

          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <li>
              Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-teal-700 font-bold underline inline-flex items-center gap-0.5">vercel.com <ExternalLink className="w-3 h-3" /></a> dan klik <strong>&quot;Add New Project&quot;</strong>.
            </li>
            <li>
              Pilih repositori GitHub <code>sdn1-cempaka-antropometri</code> yang baru saja Anda push.
            </li>
            <li>
              Vercel akan otomatis mendeteksi framework <strong>Vite</strong> dan menggunakan file <code>vercel.json</code> yang sudah kami sediakan di root project.
            </li>
            <li>
              Tambahkan variabel lingkungan di bagian <strong>&quot;Environment Variables&quot;</strong> sebelum mengklik Deploy (lihat daftar di bawah).
            </li>
            <li>
              Klik <strong>Deploy</strong>. Proyek akan selesai dalam ~1 menit dan dapat diakses publik pada domain <code>https://sdn1cempaka-antropometri.vercel.app</code>.
            </li>
          </ol>
        </div>

        {/* Section 3: Environment Variables Checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Key className="w-4 h-4 text-amber-600" />
            <span>3. Variabel Lingkungan (.env) yang Diperlukan di Vercel</span>
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Variabel</th>
                  <th className="py-2.5 px-3">Nilai Bawaan</th>
                  <th className="py-2.5 px-3 text-right">Salin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {vercelEnvVars.map((env) => (
                  <tr key={env.key} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{env.key}</td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-[200px]">{env.val}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleCopy(`${env.key}=${env.val}`, env.key)}
                        className="text-teal-700 hover:text-teal-900 p-1"
                        title="Salin Key=Value"
                      >
                        {copiedKey === env.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 inline" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            File konfigurasi <code>vercel.json</code> dan <code>.env.example</code> sudah terpasang rapi di workspace proyek ini.
          </span>
        </div>
      </div>
    </div>
  );
};
