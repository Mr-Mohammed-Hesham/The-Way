import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  User,
  Plus,
  BookOpen,
  DollarSign,
  Calendar,
  Sparkles,
  Check,
  UserCheck,
  CreditCard,
  Phone,
  GraduationCap,
  X
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { Contract, ContractStatus, PaymentMethod } from '../../../types';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractToEdit?: Contract | null;
  defaultStudentId?: string;
}

export const ContractFormModal: React.FC<ContractFormModalProps> = ({
  isOpen,
  onClose,
  contractToEdit,
  defaultStudentId
}) => {
  const {
    students,
    subjects,
    users,
    addContract,
    updateContract,
    addStudent,
    updateStudent,
    addSubject,
    settings,
    addToast
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Form Fields
  const [studentName, setStudentName] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentUsername, setStudentUsername] = useState('');
  const [salesRep, setSalesRep] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentGrade, setStudentGrade] = useState('الثانوية العامة - الصف الثالث الثانوي');
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [totalSessions, setTotalSessions] = useState<number>(12);
  const [totalPrice, setTotalPrice] = useState<number>(1800);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextMonthStr);
  const [status, setStatus] = useState<ContractStatus>(ContractStatus.ACTIVE);
  const [notes, setNotes] = useState('');

  // Manual Subject Addition state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // Suggestions for Student Name input
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter Sales staff list
  const salesStaff = useMemo(() => {
    return users.filter(u => u.department === 'سيلز' || u.department === 'إدارة' || u.role === 'admin' || u.role === 'super_admin');
  }, [users]);

  // Matching existing students
  const matchingStudents = useMemo(() => {
    if (!studentName.trim()) return [];
    return students.filter(s =>
      s.name.toLowerCase().includes(studentName.toLowerCase().trim()) ||
      s.code.toLowerCase().includes(studentName.toLowerCase().trim()) ||
      (s.username && s.username.toLowerCase().includes(studentName.toLowerCase().trim())) ||
      (s.phone && s.phone.includes(studentName.trim()))
    );
  }, [students, studentName]);

  useEffect(() => {
    if (contractToEdit) {
      const existingStudent = students.find(s => s.id === contractToEdit.studentId);
      setSelectedStudentId(contractToEdit.studentId);
      setStudentName(existingStudent ? existingStudent.name : '');
      setStudentUsername(contractToEdit.studentUsername || existingStudent?.username || '');
      setSalesRep(contractToEdit.salesRep || existingStudent?.salesRep || '');
      setStudentPhone(existingStudent?.phone || '');
      setStudentGrade(existingStudent?.grade || 'الثانوية العامة - الصف الثالث الثانوي');
      setSubjectIds(contractToEdit.subjectIds || []);
      setTotalSessions(contractToEdit.totalSessions);
      setTotalPrice(contractToEdit.totalPrice);
      setInitialPayment(contractToEdit.paidAmount || 0);
      setStartDate(contractToEdit.startDate);
      setEndDate(contractToEdit.endDate);
      setStatus(contractToEdit.status);
      setNotes(contractToEdit.notes || '');
    } else {
      let initStudent = students.find(s => s.id === defaultStudentId);
      if (initStudent) {
        setSelectedStudentId(initStudent.id);
        setStudentName(initStudent.name);
        setStudentUsername(initStudent.username || '');
        setSalesRep(initStudent.salesRep || (salesStaff[0]?.name || ''));
        setStudentPhone(initStudent.phone || '');
        setStudentGrade(initStudent.grade || 'الثانوية العامة - الصف الثالث الثانوي');
        setSubjectIds(initStudent.subjectIds.length > 0 ? initStudent.subjectIds : (subjects[0] ? [subjects[0].id] : []));
      } else {
        setSelectedStudentId('');
        setStudentName('');
        setStudentUsername('');
        setSalesRep(salesStaff[0]?.name || '');
        setStudentPhone('');
        setStudentGrade('الثانوية العامة - الصف الثالث الثانوي');
        setSubjectIds(subjects.length > 0 ? [subjects[0].id] : []);
      }
      setTotalSessions(12);
      setTotalPrice(1800);
      setInitialPayment(0);
      setPaymentMethod(PaymentMethod.CASH);
      setStartDate(todayStr);
      setEndDate(nextMonthStr);
      setStatus(ContractStatus.ACTIVE);
      setNotes('');
    }
    setErrors({});
    setIsAddingSubject(false);
    setNewSubjectName('');
  }, [contractToEdit, defaultStudentId, isOpen, students, subjects, salesStaff, todayStr, nextMonthStr]);

  const handleSelectExistingStudent = (st: typeof students[0]) => {
    setSelectedStudentId(st.id);
    setStudentName(st.name);
    setStudentUsername(st.username || st.name.trim().toLowerCase().replace(/\s+/g, '_'));
    setSalesRep(st.salesRep || salesRep || salesStaff[0]?.name || '');
    setStudentPhone(st.phone || '');
    setStudentGrade(st.grade || 'الثانوية العامة - الصف الثالث الثانوي');
    if (st.subjectIds && st.subjectIds.length > 0) {
      setSubjectIds(prev => Array.from(new Set([...prev, ...st.subjectIds])));
    }
    setShowStudentDropdown(false);
  };

  const handleNameChange = (val: string) => {
    setStudentName(val);
    setShowStudentDropdown(true);
    // If user changes text, check if exact match exists or clear selected ID
    const exact = students.find(s => s.name.trim().toLowerCase() === val.trim().toLowerCase());
    if (exact) {
      setSelectedStudentId(exact.id);
      if (!studentUsername) setStudentUsername(exact.username || exact.name.replace(/\s+/g, '_'));
      if (!salesRep && exact.salesRep) setSalesRep(exact.salesRep);
      if (!studentPhone && exact.phone) setStudentPhone(exact.phone);
    } else {
      setSelectedStudentId('');
      if (!studentUsername && val.trim()) {
        setStudentUsername(val.trim().toLowerCase().replace(/\s+/g, '_'));
      }
    }
  };

  const toggleSubject = (id: string) => {
    setSubjectIds(prev => {
      const exists = prev.includes(id);
      return exists ? prev.filter(sId => sId !== id) : [...prev, id];
    });
  };

  const handleAddManualSubject = () => {
    if (!newSubjectName.trim()) return;
    const added = addSubject({
      name: newSubjectName.trim(),
      code: `SUB-${subjects.length + 101}`,
      grade: studentGrade || 'جميع الصفوف',
      description: `مادة مضافة يدوياً أثناء تسجيل العقد`
    });
    if (added) {
      setSubjectIds(prev => [...prev, added.id]);
      setNewSubjectName('');
      setIsAddingSubject(false);
      addToast('success', `تم إضافة المادة الدراسية "${added.name}" وتضمينها بالعقد`, 'إضافة مادة');
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!studentName.trim()) errs.studentName = 'يرجى كتابة اسم الطالب';
    if (subjectIds.length === 0) errs.subjectIds = 'يجب اختيار مادة دراسية واحدة على الأقل أو إضافة مادة يدوياً';
    if (totalSessions <= 0) errs.totalSessions = 'عدد الحصص يجب أن يكون أكبر من الصفر';
    if (totalPrice <= 0) errs.totalPrice = 'إجمالي السعر يجب أن يكون أكبر من الصفر';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalStudentId = selectedStudentId;

    // If no existing student was selected, automatically create the new student in one step!
    if (!finalStudentId) {
      const newSt = addStudent({
        name: studentName.trim(),
        username: studentUsername.trim().toLowerCase() || studentName.trim().replace(/\s+/g, '_').toLowerCase(),
        salesRep: salesRep.trim() || undefined,
        gender: 'male',
        grade: studentGrade || 'الصف الثالث الثانوي',
        phone: studentPhone.trim() || undefined,
        parent: {
          name: `ولي أمر ${studentName.trim()}`,
          phone: studentPhone.trim() || '01000000000',
          relationship: 'ولي أمر'
        },
        status: 'active' as any,
        subjectIds: subjectIds,
        notes: `تم التسجيل عبر نافذة عقد الاشتراك الجديد. السيلز المسؤول: ${salesRep || 'غير محدد'}`
      });
      finalStudentId = newSt.id;
    } else {
      // Update existing student with username, salesRep, and appended subjects
      updateStudent(finalStudentId, {
        name: studentName.trim(),
        username: studentUsername.trim().toLowerCase() || undefined,
        salesRep: salesRep.trim() || undefined,
        phone: studentPhone.trim() || undefined,
        grade: studentGrade || undefined,
        subjectIds: Array.from(new Set([...subjectIds]))
      });
    }

    const contractPayload = {
      studentId: finalStudentId,
      studentUsername: studentUsername.trim().toLowerCase() || undefined,
      salesRep: salesRep.trim() || undefined,
      subjectIds,
      totalSessions,
      totalPrice,
      startDate,
      endDate,
      status,
      notes: notes.trim(),
      paymentMethod: paymentMethod
    };

    if (contractToEdit) {
      updateContract(contractToEdit.id, contractPayload);
    } else {
      addContract(contractPayload as any, initialPayment);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contractToEdit ? `تعديل العقد (${contractToEdit.contractNumber})` : 'إنشاء عقد اشتراك جديد للطالب'}
      subtitle="تسجيل بيانات الطالب، السيلز، المواد المشمولة، وباقة الحصص بالكامل"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-right">
        {/* Student Name & Username Section (Editable Student Name + Username + Sales Rep) */}
        <div className="p-4 rounded-2xl bg-[#FAF8F2] dark:bg-slate-800/80 border border-amber-400/30 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 dark:text-amber-200 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>بيانات الطالب والسيلز المسجل:</span>
            </h4>
            {selectedStudentId ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                طالب مسجل مسبقاً ✓
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                طالب جديد (سيتم تسجيله مع العقد تلقائياً)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Editable Student Name Input */}
            <div className="relative space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>اسم الطالب (يمكنك الكتابة مباشرة): <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={e => handleNameChange(e.target.value)}
                onFocus={() => setShowStudentDropdown(true)}
                placeholder="اكتب اسم الطالب هنا..."
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                required
              />
              {errors.studentName && <p className="text-[11px] text-rose-500 font-semibold">{errors.studentName}</p>}

              {/* Autocomplete Dropdown if typing matches existing students */}
              {showStudentDropdown && matchingStudents.length > 0 && (
                <div className="absolute top-full right-0 left-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-amber-400/40 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400">طلاب مقترحين (انقر للاختيار):</div>
                  {matchingStudents.map(st => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => handleSelectExistingStudent(st)}
                      className="w-full text-right p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{st.name}</span>
                        <span className="text-[10px] text-slate-400 mr-2">({st.code} - {st.grade})</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                        {st.username || 'بدون يوزر'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Student Username Field (يوزر الطالب) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                يوزر الطالب (اسم المستخدم للدخول أو كود الحساب):
              </label>
              <input
                type="text"
                value={studentUsername}
                onChange={e => setStudentUsername(e.target.value.replace(/\s+/g, '_').toLowerCase())}
                placeholder="مثال: ahmed_2025 أو std_nour"
                className="w-full px-3.5 py-2.5 text-xs font-mono text-left rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            {/* 3. Sales Rep (السيلز المسجل) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                السيلز المسجل:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={salesRep}
                  onChange={e => setSalesRep(e.target.value)}
                  placeholder="اسم موظف السيلز..."
                  className="flex-1 px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
                {salesStaff.length > 0 && (
                  <select
                    onChange={e => {
                      if (e.target.value) setSalesRep(e.target.value);
                    }}
                    className="px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                    value=""
                  >
                    <option value="" disabled>اختر سيلز</option>
                    {salesStaff.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* 4. Student Phone & Grade (Quick registration fields) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  هاتف الطالب / ولي الأمر:
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={e => setStudentPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full px-3 py-2.5 text-xs font-mono text-left rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  الصف الدراسي:
                </label>
                <select
                  value={studentGrade}
                  onChange={e => setStudentGrade(e.target.value)}
                  className="w-full px-2.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                >
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الثانوية العامة - الصف الثالث الثانوي">الثانوية العامة - الصف الثالث الثانوي</option>
                  <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                  <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                  <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                  <option value="المرحلة الابتدائية">المرحلة الابتدائية</option>
                  <option value="لغات / تجريبي / IG / SAT">لغات / تجريبي / IG / SAT</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Selection with Manual Subject Addition */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>المواد المشمولة بالعقد: <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal mr-1">(تم تحديد {subjectIds.length} مادة)</span>
            </label>

            {/* Button to toggle Manual Subject Addition */}
            <button
              type="button"
              onClick={() => setIsAddingSubject(!isAddingSubject)}
              className="flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300/60 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>+ إضافة مادة يدوياً</span>
            </button>
          </div>

          {/* Manual Subject Input Box */}
          {isAddingSubject && (
            <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-2xl flex flex-col sm:flex-row items-center gap-2 animate-in fade-in duration-150">
              <input
                type="text"
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                placeholder="اكتب اسم المادة الجديدة (مثال: فيزياء لغات، قدرات وتحصيلي، كيمياء ثانوية عامة)..."
                className="flex-1 w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAddManualSubject}
                  className="flex-1 sm:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  حفظ وتحديد المادة
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Subjects Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
            {subjects.map(sub => {
              const isSelected = subjectIds.includes(sub.id);
              return (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all text-xs font-bold flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-950 dark:text-amber-200 ring-1 ring-amber-500 shadow-xs'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                  }`}
                >
                  <span className="truncate">{sub.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          {errors.subjectIds && <p className="text-[11px] text-rose-500 font-semibold">{errors.subjectIds}</p>}
        </div>

        {/* Sessions Count & Financial Package */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-amber-400/20 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              عدد الحصص بالباقة <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={totalSessions}
              onChange={e => setTotalSessions(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            {errors.totalSessions && <p className="text-[11px] text-rose-500 mt-1">{errors.totalSessions}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              إجمالي سعر العقد ({settings.currency}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={totalPrice}
              onChange={e => setTotalPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            {errors.totalPrice && <p className="text-[11px] text-rose-500 mt-1">{errors.totalPrice}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              دفعة التعاقد الفورية (سند قبض):
            </label>
            <input
              type="number"
              value={initialPayment}
              onChange={e => setInitialPayment(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3.5 py-2 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Payment Method & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {initialPayment > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">طريقة سداد الدفعة</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none"
              >
                <option value={PaymentMethod.CASH}>نقداً (كاش بالخزينة)</option>
                <option value={PaymentMethod.BANK_TRANSFER}>تحويل بنكي / محافظ إلكترونية / إنستاباي</option>
                <option value={PaymentMethod.CARD}>بطاقة بنكية / فيزا (POS)</option>
                <option value={PaymentMethod.OTHER}>أخرى</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">تاريخ بداية العقد</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">تاريخ نهاية العقد</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ملاحظات العقد / شروط الدفع والخصومات:</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="مثال: خصم الأخوة 10%، السداد على دفعتين، متابعة دورية مع ولي الأمر..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Submit Buttons with Luxury Gold Palette */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-600 rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            {contractToEdit ? 'حفظ تعديلات العقد' : 'إنشاء وحفظ عقد الاشتراك ✓'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
