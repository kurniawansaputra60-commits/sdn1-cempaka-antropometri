import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Download,
  FileSpreadsheet,
  FileUp,
  LineChart,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import {
  downloadTemplateExcel,
  exportAnthropometryToExcel,
  parseExcelOrCsvFile
} from '../lib/excelService';
import { calculateAgeMonths, formatAgeString, getStuntingBadgeInfo } from '../lib/growthStandards';
import { Measurement, Student } from '../types';

interface StudentListAndImportProps {
  students: Student[];
  measurements: Measurement[];
  onImportStudents: (newStudents: Student[]) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onSelectStudentForMeasurement: (studentId: string) => void;
  onSelectStudentForChart: (studentId: string) => void;
  onSendWhatsApp: (studentId: string) => void;
}

export const StudentListAndImport: React.FC<StudentListAndImportProps> = ({
  students,
  measurements,
  onImportStudents,
  onAddStudent,
  onDeleteStudent,
  onSelectStudentForMeasurement,
  onSelectStudentForChart,
  onSendWhatsApp,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // File import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedValidStudents, setParsedValidStudents] = useState<Student[]>([]);
  const [parseErrors, setParseErrors] = useState<{ row: number; reason: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add student form state
  const [formNisn, setFormNisn] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formBirthDate, setFormBirthDate] = useState('2019-05-10');
  const [formGrade, setFormGrade] = useState('Kelas 1A');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('081234567890');
  const [formAddress, setFormAddress] = useState('Cempaka');

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesGrade = selectedGrade === 'all' || s.grade === selectedGrade;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const uniqueGrades = Array.from(new Set(students.map((s) => s.grade))).sort();

  // Find latest measurement for each student
  const latestMeasurementMap = new Map<string, Measurement>();
  measurements.forEach((m) => {
    const existing = latestMeasurementMap.get(m.studentId);
    if (!existing || new Date(m.timestamp) > new Date(existing.timestamp)) {
      latestMeasurementMap.set(m.studentId, m);
    }
  });

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setIsParsing(true);
    setParseErrors([]);
    setParsedValidStudents([]);

    try {
      const res = await parseExcelOrCsvFile(file);
      setParsedValidStudents(res.validStudents);
      setParseErrors(res.errors);
    } catch (err) {
      setParseErrors([{ row: 0, reason: 'Gagal memproses file. Pastikan format .xlsx atau .csv valid.' }]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedValidStudents.length === 0) return;
    onImportStudents(parsedValidStudents);
    setIsImportModalOpen(false);
    setImportFile(null);
    setParsedValidStudents([]);
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNisn || !formName) return;

    const newStudent: Student = {
      id: `std_${Date.now()}`,
      nisn: formNisn,
      name: formName,
      gender: formGender,
      birthDate: formBirthDate,
      grade: formGrade,
      parentName: formParentName || 'Wali Siswa',
      parentPhone: formParentPhone,
      address: formAddress,
      createdDate: new Date().toISOString(),
    };

    onAddStudent(newStudent);
    setIsAddModalOpen(false);
    // Reset form
    setFormNisn('');
    setFormName('');
    setFormParentName('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Data Siswa SDN 1 Cempaka</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Database siswa terintegrasi, import Excel batch, dan riwayat rekam medis antropometri
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={() => downloadTemplateExcel()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors border border-slate-200"
            title="Unduh Format Template Excel untuk diisi"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Template Excel</span>
          </button>

          {/* Import Excel Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel (.xlsx)</span>
          </button>

          {/* Export Anthropometry */}
          <button
            onClick={() => exportAnthropometryToExcel(students, measurements)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-300" />
            <span>Export Hasil (.xlsx)</span>
          </button>

          {/* Add Student Manually */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Kelas:</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedGrade === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({students.length})
            </button>
            {uniqueGrades.map((g) => {
              const count = students.filter((s) => s.grade === g).length;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    selectedGrade === g
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari NISN, nama, atau orang tua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3">JK</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Usia</th>
                <th className="py-3 px-4">Wali & WhatsApp</th>
                <th className="py-3 px-3">TB Terakhir</th>
                <th className="py-3 px-3">Status Stunting</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const m = latestMeasurementMap.get(std.id);
                  const ageMonths = calculateAgeMonths(std.birthDate);
                  const badge = m ? getStuntingBadgeInfo(m.stuntingStatus) : null;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 font-medium whitespace-nowrap">
                        {std.nisn}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{std.name}</div>
                        <div className="text-[11px] text-slate-400">{std.address}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            std.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {std.gender}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium">
                        {std.grade}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {formatAgeString(ageMonths)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{std.parentName}</div>
                        <div className="text-[11px] text-teal-700 font-mono flex items-center gap-1">
                          <span>{std.parentPhone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {m ? (
                          <div>
                            <span className="font-bold text-slate-900 tabular-nums">{m.heightCm} cm</span>
                            <span className="text-[11px] text-slate-400 block tabular-nums">{m.weightKg} kg</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum diukur</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {badge ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badge.color}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`}></span>
                            {badge.shortLabel}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStudentForMeasurement(std.id)}
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                            title="Lakukan Pengukuran IoT Baru"
                          >
                            <Cpu className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectStudentForChart(std.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Lihat Grafik Pertumbuhan WHO"
                          >
                            <LineChart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSendWhatsApp(std.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Kirim Pesan WhatsApp ke Orang Tua"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data siswa ${std.name}?`)) {
                                onDeleteStudent(std.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredStudents.length} dari total {students.length} siswa</span>
          <span className="text-teal-700 font-medium">
            Terhubung otomatis ke Database SIM UKS SDN 1 Cempaka
          </span>
        </div>
      </div>

      {/* Modal: Import Excel (.xlsx / .csv) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Import Data Siswa dari Excel</h3>
                  <p className="text-xs text-slate-500">Mendukung file spreadsheet .xlsx, .xls, dan .csv</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileUp className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">
                Klik untuk Memilih File Excel atau Seret ke Sini
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Format yang didukung: XLSX, XLS, CSV (Maksimal 10 MB)
              </p>
              {importFile && (
                <div className="mt-3 inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                  File Terpilih: {importFile.name}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-600">Belum memiliki format template Excel yang sesuai?</span>
              <button
                onClick={() => downloadTemplateExcel()}
                className="text-teal-700 font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Format Template</span>
              </button>
            </div>

            {/* Parsing State & Preview */}
            {isParsing && (
              <div className="text-center py-4 text-xs text-slate-600">
                Sedang memproses dan memvalidasi file Excel...
              </div>
            )}

            {parsedValidStudents.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Preview Data Valid ({parsedValidStudents.length} Siswa Siap Diimport):
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg text-xs divide-y divide-slate-100">
                  {parsedValidStudents.slice(0, 10).map((s, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between bg-white">
                      <div>
                        <strong className="text-slate-900">{s.name}</strong> ({s.gender}) · {s.grade}
                        <div className="text-[11px] text-slate-500">
                          NISN: {s.nisn} · Ortu: {s.parentName} ({s.parentPhone})
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                  ))}
                  {parsedValidStudents.length > 10 && (
                    <div className="p-2 text-center text-[11px] text-slate-500 bg-slate-50">
                      Dan {parsedValidStudents.length - 10} data siswa lainnya...
                    </div>
                  )}
                </div>
              </div>
            )}

            {parseErrors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Ditemukan {parseErrors.length} Baris Bermasalah:
                </span>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {parseErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>Baris {err.row}: {err.reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                disabled={parsedValidStudents.length === 0}
                onClick={handleConfirmImport}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan {parsedValidStudents.length} Siswa ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleManualAddSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tambah Siswa Baru SDN 1 Cempaka</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Induk Siswa (NISN) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0145892305"
                  value={formNisn}
                  onChange={(e) => setFormNisn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap sesuai akta lahir"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kelas</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Kelas 1A">Kelas 1A</option>
                    <option value="Kelas 1B">Kelas 1B</option>
                    <option value="Kelas 2A">Kelas 2A</option>
                    <option value="Kelas 2B">Kelas 2B</option>
                    <option value="Kelas 3A">Kelas 3A</option>
                    <option value="Kelas 3B">Kelas 3B</option>
                    <option value="Kelas 4">Kelas 4</option>
                    <option value="Kelas 5">Kelas 5</option>
                    <option value="Kelas 6">Kelas 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir (YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  value={formBirthDate}
                  onChange={(e) => setFormBirthDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Orang Tua / Wali</label>
                <input
                  type="text"
                  placeholder="Nama ayah/ibu wali"
                  value={formParentName}
                  onChange={(e) => setFormParentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor WhatsApp Wali</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={formParentPhone}
                  onChange={(e) => setFormParentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Tinggal</label>
                <input
                  type="text"
                  placeholder="Jl. Cempaka No..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
              >
                Simpan Siswa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
