/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/layout/ToastContainer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { LoginView } from './components/auth/LoginView';
import { InstallAppButton } from './components/common/InstallAppPrompt';

// Modals
import { ReceiptModal } from './components/common/ReceiptModal';
import { StudentIdCardModal } from './components/common/StudentIdCardModal';
import { AppLoader } from './components/common/AppLoader';
import { StudentFormModal } from './components/features/students/StudentFormModal';
import { TeacherFormModal } from './components/features/teachers/TeacherFormModal';
import { SessionFormModal } from './components/features/sessions/SessionFormModal';
import { ContractFormModal } from './components/features/contracts/ContractFormModal';
import { PaymentFormModal } from './components/features/payments/PaymentFormModal';
import { EditProfileModal } from './components/features/profile/EditProfileModal';

// Feature Views
import { DashboardView } from './components/features/dashboard/DashboardView';
import { LiveCenterView } from './components/features/live/LiveCenterView';
import { StudentsView } from './components/features/students/StudentsView';
import { StudentDetailView } from './components/features/students/StudentDetailView';
import { TeachersView } from './components/features/teachers/TeachersView';
import { TeacherDetailView } from './components/features/teachers/TeacherDetailView';
import { SessionsView } from './components/features/sessions/SessionsView';
import { AttendanceView } from './components/features/attendance/AttendanceView';
import { AssignmentsView } from './components/features/assignments/AssignmentsView';
import { ContractsView } from './components/features/contracts/ContractsView';
import { PaymentsView } from './components/features/payments/PaymentsView';
import { TeacherPaymentsView } from './components/features/payments/TeacherPaymentsView';
import { RoomsView } from './components/features/rooms/RoomsView';
import { SubjectsView } from './components/features/subjects/SubjectsView';
import { ReportsView } from './components/features/reports/ReportsView';
import { SettingsView } from './components/features/settings/SettingsView';
import { AuditLogView } from './components/features/audit/AuditLogView';
import { UsersView } from './components/features/users/UsersView';
import { NotificationsView } from './components/features/notifications/NotificationsView';

import { Student, Teacher, Session, Contract, AppSection } from './types';

const MainContent: React.FC = () => {
  const {
    isAuthenticated,
    activeTab,
    selectedStudentId,
    setSelectedStudentId,
    selectedTeacherId,
    setSelectedTeacherId,
    students,
    teachers,
    activeReceiptPayment,
    setActiveReceiptPayment,
    activeIdCardStudent,
    setActiveIdCardStudent,
    canViewSection
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);

  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [contractDefaultStudentId, setContractDefaultStudentId] = useState<string | undefined>();

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentDefaultStudentId, setPaymentDefaultStudentId] = useState<string | undefined>();
  const [paymentDefaultContractId, setPaymentDefaultContractId] = useState<string | undefined>();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileTargetUser, setEditProfileTargetUser] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  // Global keyboard shortcut for Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsAddStudentOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsAddStudentOpen(true);
  };

  const handleOpenAddTeacher = () => {
    setTeacherToEdit(null);
    setIsAddTeacherOpen(true);
  };

  const handleOpenEditTeacher = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setIsAddTeacherOpen(true);
  };

  const handleOpenAddSession = () => {
    setSessionToEdit(null);
    setIsAddSessionOpen(true);
  };

  const handleOpenEditSession = (session: Session) => {
    setSessionToEdit(session);
    setIsAddSessionOpen(true);
  };

  const handleOpenAddContract = (defaultStudentId?: string) => {
    setContractToEdit(null);
    setContractDefaultStudentId(defaultStudentId);
    setIsAddContractOpen(true);
  };

  const handleOpenEditContract = (contract: Contract) => {
    setContractToEdit(contract);
    setIsAddContractOpen(true);
  };

  const handleOpenAddPayment = (defaultStudentId?: string, defaultContractId?: string) => {
    setPaymentDefaultStudentId(defaultStudentId);
    setPaymentDefaultContractId(defaultContractId);
    setIsAddPaymentOpen(true);
  };

  const handleOpenEditProfile = (user?: any) => {
    setEditProfileTargetUser(user || null);
    setIsEditProfileOpen(true);
  };

  if (isInitialLoading) {
    return <AppLoader message="The Way Training Center" subMessage="جاري تهيئة المنظومة ولوحة التحكم..." />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const currentStudentForEdit = students.find(s => s.id === selectedStudentId);
  const currentTeacherForEdit = teachers.find(t => t.id === selectedTeacherId);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans antialiased text-slate-900 dark:text-slate-100 overflow-hidden transition-colors" dir="rtl">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
          onOpenAddSession={handleOpenAddSession}
          onOpenAddContract={() => handleOpenAddContract()}
          onOpenAddStudent={handleOpenAddStudent}
          onOpenEditProfile={() => handleOpenEditProfile()}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        {/* Dynamic Page Views Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Detailed Student View */}
          {selectedStudentId ? (
            <StudentDetailView
              studentId={selectedStudentId}
              onBack={() => setSelectedStudentId(null)}
              onEdit={() => {
                if (currentStudentForEdit) handleOpenEditStudent(currentStudentForEdit);
              }}
              onOpenAddContract={stId => handleOpenAddContract(stId)}
              onOpenAddPayment={stId => handleOpenAddPayment(stId)}
            />
          ) : selectedTeacherId ? (
            <TeacherDetailView
              teacherId={selectedTeacherId}
              onBack={() => setSelectedTeacherId(null)}
              onEdit={() => {
                if (currentTeacherForEdit) handleOpenEditTeacher(currentTeacherForEdit);
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenAddContract={() => handleOpenAddContract()}
                  onOpenAddStudent={handleOpenAddStudent}
                  onOpenAddSession={handleOpenAddSession}
                  onOpenAddPayment={() => handleOpenAddPayment()}
                />
              )}

              {activeTab === 'live' && (
                <LiveCenterView
                  onOpenAddSession={handleOpenAddSession}
                />
              )}

              {activeTab === 'students' && canViewSection('students') && (
                <StudentsView
                  onOpenAddContract={() => handleOpenAddContract()}
                  onOpenAddStudent={handleOpenAddStudent}
                  onOpenEditStudent={handleOpenEditStudent}
                />
              )}

              {activeTab === 'teachers' && canViewSection('teachers') && (
                <TeachersView
                  onOpenAddTeacher={handleOpenAddTeacher}
                  onOpenEditTeacher={handleOpenEditTeacher}
                />
              )}

              {activeTab === 'sessions' && canViewSection('sessions') && (
                <SessionsView
                  onOpenAddSession={handleOpenAddSession}
                  onOpenEditSession={handleOpenEditSession}
                />
              )}

              {activeTab === 'attendance' && canViewSection('attendance') && (
                <AttendanceView />
              )}

              {activeTab === 'assignments' && canViewSection('assignments') && <AssignmentsView />}

              {activeTab === 'contracts' && canViewSection('contracts') && (
                <ContractsView
                  onOpenAddContract={() => handleOpenAddContract()}
                  onOpenEditContract={handleOpenEditContract}
                  onOpenAddPaymentForContract={(stId, cntId) => handleOpenAddPayment(stId, cntId)}
                />
              )}

              {activeTab === 'payments' && canViewSection('payments') && (
                <PaymentsView onOpenAddPayment={() => handleOpenAddPayment()} />
              )}

              {activeTab === 'teacher_payments' && canViewSection('teacher_payments') && <TeacherPaymentsView />}

              {activeTab === 'rooms' && canViewSection('rooms') && <RoomsView />}

              {activeTab === 'subjects' && canViewSection('subjects') && <SubjectsView />}

              {activeTab === 'reports' && canViewSection('reports') && <ReportsView />}

              {activeTab === 'notifications' && canViewSection('notifications') && <NotificationsView />}

              {activeTab === 'users' && canViewSection('users') && <UsersView />}

              {activeTab === 'settings' && canViewSection('settings') && <SettingsView />}

              {activeTab === 'audit' && canViewSection('audit') && <AuditLogView />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      <ReceiptModal
        isOpen={!!activeReceiptPayment}
        onClose={() => setActiveReceiptPayment(null)}
        payment={activeReceiptPayment}
      />

      <StudentIdCardModal
        isOpen={!!activeIdCardStudent}
        onClose={() => setActiveIdCardStudent(null)}
        student={activeIdCardStudent}
      />

      <StudentFormModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        studentToEdit={studentToEdit}
      />

      <TeacherFormModal
        isOpen={isAddTeacherOpen}
        onClose={() => setIsAddTeacherOpen(false)}
        teacherToEdit={teacherToEdit}
      />

      <SessionFormModal
        isOpen={isAddSessionOpen}
        onClose={() => setIsAddSessionOpen(false)}
        sessionToEdit={sessionToEdit}
      />

      <ContractFormModal
        isOpen={isAddContractOpen}
        onClose={() => setIsAddContractOpen(false)}
        contractToEdit={contractToEdit}
        defaultStudentId={contractDefaultStudentId}
      />

      <PaymentFormModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        defaultStudentId={paymentDefaultStudentId}
        defaultContractId={paymentDefaultContractId}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => {
          setIsEditProfileOpen(false);
          setEditProfileTargetUser(null);
        }}
        targetUser={editProfileTargetUser}
      />

      {/* 4U Floating Install Action Button */}
      <InstallAppButton variant="floating" />

      {/* Interactive Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
