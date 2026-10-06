/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ApiSyncModal } from './components/ApiSyncModal';
import { DashboardOverview } from './components/DashboardOverview';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { GrowthChartAnalysis } from './components/GrowthChartAnalysis';
import { Header } from './components/Header';
import { IoTMeasurementStation } from './components/IoTMeasurementStation';
import { MonthlyReportView } from './components/MonthlyReportView';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ParentPortalView } from './components/ParentPortalView';
import { RoleLoginModal } from './components/RoleLoginModal';
import { StudentListAndImport } from './components/StudentListAndImport';
import { WhatsAppAlertCenter } from './components/WhatsAppAlertCenter';
import { calculateAgeMonths, calculateGrowthStatus } from './lib/growthStandards';
import { storage } from './lib/storage';
import { dispatchWhatsAppAlert } from './lib/whatsappService';
import {
  IoTDeviceState,
  Measurement,
  NotificationItem,
  Student,
  User,
  WhatsAppAlert
} from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getActiveUser());
  const [activeTab, setActiveTab] = useState<string>(() => {
    const user = storage.getActiveUser();
    return user.role === 'orang_tua' ? 'parent_portal' : 'dashboard';
  });

  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [measurements, setMeasurements] = useState<Measurement[]>(() => storage.getMeasurements());
  const [alerts, setAlerts] = useState<WhatsAppAlert[]>(() => storage.getAlerts());
  const [iotDevice, setIoTDevice] = useState<IoTDeviceState>(() => storage.getIoTDevice());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storage.getNotifications());
  const [isE2eActive, setIsE2eActive] = useState<boolean>(() => storage.isE2eEnabled());

  // Selected student for detail analysis in growth chart
  const [selectedStudentIdForChart, setSelectedStudentIdForChart] = useState<string>(() => {
    const initStds = storage.getStudents();
    return initStds[0]?.id || '';
  });

  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // Sync state to local storage when changed
  useEffect(() => {
    storage.saveStudents(students);
  }, [students]);

  useEffect(() => {
    storage.saveMeasurements(measurements);
  }, [measurements]);

  useEffect(() => {
    storage.saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    storage.saveIoTDevice(iotDevice);
  }, [iotDevice]);

  useEffect(() => {
    storage.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storage.setE2eEnabled(isE2eActive);
  }, [isE2eActive]);

  useEffect(() => {
    storage.setActiveUser(currentUser);
    if (currentUser.role === 'orang_tua') {
      setActiveTab('parent_portal');
    }
  }, [currentUser]);

  // Handler: Save new IoT measurement
  const handleSaveMeasurement = (newMeasurement: Measurement, triggerWhatsAppPrompt: boolean) => {
    setMeasurements((prev) => [newMeasurement, ...prev]);

    // Update IoT Device state
    setIoTDevice((prev) => ({
      ...prev,
      lastSync: new Date().toISOString(),
      liveReadings: {
        heightCm: newMeasurement.heightCm,
        weightKg: newMeasurement.weightKg,
        isStable: true,
      },
    }));

    // If stunting indicated, create automatic WhatsApp alert & notification
    if (newMeasurement.isStuntingIndicated) {
      const student = students.find((s) => s.id === newMeasurement.studentId);
      if (student) {
        const newAlert = dispatchWhatsAppAlert(student, newMeasurement);
        setAlerts((prev) => [newAlert, ...prev]);

        // Add real-time notification
        const newNotif: NotificationItem = {
          id: `notif_${Date.now()}`,
          type: 'stunting_alert',
          title: `Indikasi Stunting: ${student.name}`,
          message: `Pengukuran IoT ${newMeasurement.heightCm} cm (Z-Score ${newMeasurement.zScores.tb_u} SD). WhatsApp pemberitahuan telah disiapkan untuk wali murid (${student.parentName}).`,
          timestamp: new Date().toISOString(),
          read: false,
          urgency: 'high',
          studentId: student.id,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    } else {
      // Normal measurement sync notification
      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        type: 'iot_sync',
        title: `Pengukuran Berhasil: ${newMeasurement.studentName}`,
        message: `Tinggi: ${newMeasurement.heightCm} cm, Berat: ${newMeasurement.weightKg} cm tersimpan ke dasbor guru.`,
        timestamp: new Date().toISOString(),
        read: false,
        urgency: 'low',
        studentId: newMeasurement.studentId,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Handler: Batch import students from Excel
  const handleImportStudents = (newStudents: Student[]) => {
    // Avoid duplicate NISN
    const existingNisns = new Set(students.map((s) => s.nisn));
    const toAdd: Student[] = [];

    newStudents.forEach((std) => {
      if (!existingNisns.has(std.nisn)) {
        toAdd.push(std);
        existingNisns.add(std.nisn);
      }
    });

    if (toAdd.length > 0) {
      setStudents((prev) => [...prev, ...toAdd]);

      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        type: 'excel_import',
        title: 'Import Siswa Excel Berhasil',
        message: `Sebanyak ${toAdd.length} siswa baru SDN 1 Cempaka berhasil ditambahkan ke database.`,
        timestamp: new Date().toISOString(),
        read: false,
        urgency: 'low',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Handler: Manual add student
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  // Handler: Delete student
  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setMeasurements((prev) => prev.filter((m) => m.studentId !== studentId));
  };

  // Handler: Select student for WHO chart
  const handleSelectStudentForChart = (studentId: string) => {
    setSelectedStudentIdForChart(studentId);
    setActiveTab('growth_charts');
  };

  // Handler: Navigate to WhatsApp alerts tab for specific student
  const handleSendWhatsAppForStudent = (studentId: string) => {
    setSelectedStudentIdForChart(studentId);
    setActiveTab('wa_alerts');
  };

  // Handler: Trigger Mock IoT Payload from external simulator
  const handleTriggerMockIotPayload = (mock: Partial<Measurement>) => {
    const student = students.find((s) => s.id === mock.studentId) || students[0];
    if (!student) return;

    const ageMonths = calculateAgeMonths(student.birthDate);
    const heightCm = mock.heightCm || 119.5;
    const weightKg = mock.weightKg || 22.1;
    const status = calculateGrowthStatus(heightCm, weightKg, ageMonths, student.gender);

    const newMeasurement: Measurement = {
      id: `m_mock_${Date.now()}`,
      studentId: student.id,
      studentNisn: student.nisn,
      studentName: student.name,
      studentGender: student.gender,
      studentGrade: student.grade,
      studentBirthDate: student.birthDate,
      timestamp: new Date().toISOString(),
      ageMonths,
      heightCm,
      weightKg,
      armCircumferenceCm: 16.5,
      headCircumferenceCm: 51.5,
      bmi: status.bmi,
      zScores: status.zScores,
      stuntingStatus: status.stuntingStatus,
      nutritionStatus: status.nutritionStatus,
      isStuntingIndicated: status.isStuntingIndicated,
      deviceId: 'IOT-ANTRO-SDN1C-01',
      measuredBy: 'Sensor Otomatis IoT ESP32 (REST API)',
      notes: 'Transmisi payload IoT jarak jauh via endpoint /api/iot/measurements',
      isEncrypted: true,
      cipherHash: `SHA256-${Math.abs(heightCm * 100 + weightKg).toString(16).toUpperCase()}`,
    };

    handleSaveMeasurement(newMeasurement, status.isStuntingIndicated);
  };

  // Handler: Update Alert status
  const handleUpdateAlertStatus = (alertId: string, status: 'terkirim' | 'dibaca' | 'ditindaklanjuti') => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status } : a))
    );
  };

  // Notification actions
  const handleMarkNotifAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        unreadNotifCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenDeploymentGuide={() => setIsDeploymentGuideOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        iotDevice={iotDevice}
        isE2eActive={isE2eActive}
        onToggleE2e={() => setIsE2eActive(!isE2eActive)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            students={students}
            measurements={measurements}
            iotDevice={iotDevice}
            onNavigateTab={setActiveTab}
            onSelectStudentForChart={handleSelectStudentForChart}
            onSendWhatsApp={handleSendWhatsAppForStudent}
            isE2eActive={isE2eActive}
          />
        )}

        {activeTab === 'iot_station' && (
          <IoTMeasurementStation
            students={students}
            iotDevice={iotDevice}
            onSaveMeasurement={handleSaveMeasurement}
            onSendWhatsApp={handleSendWhatsAppForStudent}
          />
        )}

        {activeTab === 'students' && (
          <StudentListAndImport
            students={students}
            measurements={measurements}
            onImportStudents={handleImportStudents}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            onSelectStudentForMeasurement={(studentId) => {
              setSelectedStudentIdForChart(studentId);
              setActiveTab('iot_station');
            }}
            onSelectStudentForChart={handleSelectStudentForChart}
            onSendWhatsApp={handleSendWhatsAppForStudent}
          />
        )}

        {activeTab === 'growth_charts' && (
          <GrowthChartAnalysis
            students={students}
            measurements={measurements}
            selectedStudentId={selectedStudentIdForChart || students[0]?.id || ''}
            onSelectStudent={setSelectedStudentIdForChart}
            onSendWhatsApp={handleSendWhatsAppForStudent}
            isE2eActive={isE2eActive}
          />
        )}

        {activeTab === 'wa_alerts' && (
          <WhatsAppAlertCenter
            students={students}
            measurements={measurements}
            alerts={alerts}
            onAddAlert={(alert) => setAlerts((prev) => [alert, ...prev])}
            onUpdateAlertStatus={handleUpdateAlertStatus}
          />
        )}

        {activeTab === 'monthly_report' && (
          <MonthlyReportView
            students={students}
            measurements={measurements}
            isE2eActive={isE2eActive}
          />
        )}

        {activeTab === 'parent_portal' && (
          <ParentPortalView
            currentUser={currentUser}
            students={students}
            measurements={measurements}
            onOpenWhatsAppUks={() => {
              setActiveTab('wa_alerts');
            }}
            isE2eActive={isE2eActive}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Sistem Antropometri Digital IoT SDN 1 Cempaka</span>
            <span>·</span>
            <span>UKS & Puskesmas Cempaka 2026</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsDeploymentGuideOpen(true)}
              className="text-teal-700 hover:underline font-semibold"
            >
              Panduan Vercel & GitHub
            </button>
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="text-slate-600 hover:text-slate-900"
            >
              REST API IoT
            </button>
            <button
              onClick={() => {
                if (confirm('Kembalikan data ke kondisi awal pabrik?')) {
                  storage.resetToDefaults();
                  window.location.reload();
                }
              }}
              className="text-slate-400 hover:text-red-600"
            >
              Reset Data Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RoleLoginModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
      />

      <NotificationCenterModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifAsRead}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
        onClearAll={handleClearAllNotifs}
        onSelectStudentFromNotif={handleSelectStudentForChart}
      />

      <DeploymentGuideModal
        isOpen={isDeploymentGuideOpen}
        onClose={() => setIsDeploymentGuideOpen(false)}
      />

      <ApiSyncModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onTriggerMockIotPayload={handleTriggerMockIotPayload}
        students={students}
      />
    </div>
  );
}
