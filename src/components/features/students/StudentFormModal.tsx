import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { Student, StudentStatus } from '../../../types';
import { UAE_GRADES_BASE, TRACK_OPTIONS, formatUAEGrade } from '../../../utils/gradeConstants';
import { BookOpen, Plus, Sparkles, X, Check } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit
}) => {
  const { subjects, addStudent, updateStudent, addSubject, addToast } = useApp();

  const [isAddingManualSubject, setIsAddingManualSubject] = useState(false);
  const [manualSubjectName, setManualSubjectName] = useState('');
  const [manualSubjectCode, setManualSubjectCode] = useState('');
  const [manualSubjectPrice, setManualSubjectPrice] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    grade: 'الصف الثاني عشر (Grade 12)',
    track: 'advanced' as 'general' | 'advanced' | 'elite' | 'none',
    school: '',
    birthDate: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    parentWhatsapp: '',
    parentEmail: '',
    parentRelationship: 'الأب',
    address: '',
    notes: '',
    status: StudentStatus.ACTIVE,
    subjectIds: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name,
        gender: studentToEdit.gender,
        grade: studentToEdit.grade || 'الصف الثاني عشر (Grade 12)',
        track: studentToEdit.track || (studentToEdit.grade?.includes('متقدم') ? 'advanced' : 'general'),
        school: studentToEdit.school || '',
        birthDate: studentToEdit.birthDate || '',
        phone: studentToEdit.phone || '',
        parentName: studentToEdit.parent?.name || '',
        parentPhone: studentToEdit.parent?.phone || '',
        parentWhatsapp: studentToEdit.parent?.whatsapp || '',
        parentEmail: studentToEdit.parent?.email || '',
        parentRelationship: studentToEdit.parent?.relationship || 'الأب',
        address: studentToEdit.address || '',
        notes: studentToEdit.notes || '',
        status: studentToEdit.status,
        subjectIds: studentToEdit.subjectIds || []
      });
    } else {
      setFormData({
        name: '',
        gender: 'male',
        grade: 'الصف الثاني عشر (Grade 12)',
        track: 'advanced',
        school: '',
        birthDate: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        parentWhatsapp: '',
        parentEmail: '',
        parentRelationship: 'الأب',
        address: '',
        notes: '',
        status: StudentStatus.ACTIVE,
        subjectIds: subjects.length > 0 ? [subjects[0].id] : []
      });
    }
    setErrors({});
  }, [isOpen, studentToEdit?.id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'اسم الطالب الكامل مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const parentName = formData.parentName.trim() || `ولي أمر (${formData.name})`;
      const parentPhone = formData.parentPhone.trim() || formData.phone.trim() || '+971 50 000 0000';
      const assignedSubjects = formData.subjectIds.length > 0
        ? formData.subjectIds
        : (subjects.length > 0 ? [subjects[0].id] : []);

      if (studentToEdit) {
        updateStudent(studentToEdit.id, {
          name: formData.name.trim(),
          gender: formData.gender,
          grade: formData.grade,
          track: formData.track,
          school: formData.school.trim(),
          birthDate: formData.birthDate,
          phone: formData.phone.trim(),
          parent: {
            id: studentToEdit.parent?.id || `par-${Date.now()}`,
            name: parentName,
            phone: parentPhone,
            whatsapp: formData.parentWhatsapp.trim() || parentPhone,
            email: formData.parentEmail.trim(),
            relationship: formData.parentRelationship || 'الأب'
          },
          address: formData.address.trim(),
          notes: formData.notes.trim(),
          status: formData.status,
          subjectIds: assignedSubjects
        });
      } else {
        addStudent({
          name: formData.name.trim(),
          gender: formData.gender,
          grade: formData.grade,
          track: formData.track,
          school: formData.school.trim(),
          birthDate: formData.birthDate,
          phone: formData.phone.trim(),
          parent: {
            id: `par-${Date.now()}`,
            name: parentName,
            phone: parentPhone,
            whatsapp: formData.parentWhatsapp.trim() || parentPhone,
            email: formData.parentEmail.trim(),
            relationship: formData.parentRelationship || 'الأب'
          },
          address: formData.address.trim(),
          notes: formData.notes.trim(),
          status: formData.status,
          subjectIds: assignedSubjects,
          avatarColor: formData.gender === 'male' ? '#1d4ed8' : '#ec4899'
        });
      }
      onClose();
    } catch (err) {
      console.error('Error submitting student form:', err);
    }
  };

  const handleSubjectToggle = (subId: string) => {
    setFormData(prev => {
      const exists = prev.subjectIds.includes(subId);
      const next = exists ? prev.subjectIds.filter(id => id !== subId) : [...prev.subjectIds, subId];
      return { ...prev, subjectIds: next };
    });
  };

  const handleAddManualSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = manualSubjectName.trim();
    if (!trimmedName) {
      addToast('warning', 'يرجى إدخال اسم المادة الدراسية المراد إضافتها', 'تنبيه');
      return;
    }

    const finalCode = manualSubjectCode.trim() || `SUB-${subjects.length + 101}`;
    const priceNum = manualSubjectPrice ? parseFloat(manualSubjectPrice) : undefined;

    const newSubject = addSubject({
      name: trimmedName,
      code: finalCode,
      isActive: true,
      gradeLevels: [formData.grade],
      category: 'عام',
      description: `مادة مضافة يدوياً أثناء تسجيل الطالب (${formData.name || 'طالب جديد'})`,
      defaultSessionPrice: priceNum
    });

    if (newSubject) {
      setFormData(prev => ({
        ...prev,
        subjectIds: prev.subjectIds.includes(newSubject.id)
          ? prev.subjectIds
          : [...prev.subjectIds, newSubject.id]
      }));

      addToast('success', `تمت إضافة مادة "${newSubject.name}" واختيارها للطالب فوراً ✨`, 'إضافة مادة يدوياً');
      setManualSubjectName('');
      setManualSubjectCode('');
      setManualSubjectPrice('');
      setIsAddingManualSubject(false);
    }
  };

  // Check if chosen grade allows tracks (Grades 9 to 12)
  const isHighSchool =
    formData.grade.includes('9') ||
    formData.grade.includes('10') ||
    formData.grade.includes('11') ||
    formData.grade.includes('12') ||
    formData.grade.includes('ثانوي') ||
    formData.grade.includes('عاشر') ||
    formData.grade.includes('حادي عشر') ||
    formData.grade.includes('ثاني عشر');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? `تعديل بيانات الطالب (${studentToEdit.name})` : 'تسجيل طالب جديد في السنتر (UAE)'}
      subtitle="إدخال البيانات الشخصية، المرحلة والمسار التعليمي، ومعلومات ولي الأمر"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-right">
        {/* Student Personal Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>1. المعلومات الأكاديمية والشخصية للطالب</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم الطالب الكامل <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: حمد سلطان النعيمي"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* UAE Educational Grades from KG to 12 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الصف / المرحلة الدراسية (KG 1 - Grade 12) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.grade}
                onChange={e => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <optgroup label="رياض الأطفال (KG)">
                  <option value="روضة أولى (KG 1)">روضة أولى (KG 1)</option>
                  <option value="روضة ثانية (KG 2)">روضة ثانية (KG 2)</option>
                </optgroup>
                <optgroup label="المرحلة التأسيسية والابتدائية (Primary)">
                  <option value="الصف الأول الابتدائي (Grade 1)">الصف الأول الابتدائي (Grade 1)</option>
                  <option value="الصف الثاني الابتدائي (Grade 2)">الصف الثاني الابتدائي (Grade 2)</option>
                  <option value="الصف الثالث الابتدائي (Grade 3)">الصف الثالث الابتدائي (Grade 3)</option>
                  <option value="الصف الرابع الابتدائي (Grade 4)">الصف الرابع الابتدائي (Grade 4)</option>
                  <option value="الصف الخامس الابتدائي (Grade 5)">الصف الخامس الابتدائي (Grade 5)</option>
                </optgroup>
                <optgroup label="المرحلة المتوسطة (Middle School)">
                  <option value="الصف السادس (Grade 6)">الصف السادس (Grade 6)</option>
                  <option value="الصف السابع (Grade 7)">الصف السابع (Grade 7)</option>
                  <option value="الصف الثامن (Grade 8)">الصف الثامن (Grade 8)</option>
                </optgroup>
                <optgroup label="المرحلة الثانوية (Secondary / High School)">
                  <option value="الصف التاسع (Grade 9)">الصف التاسع (Grade 9)</option>
                  <option value="الصف العاشر (Grade 10)">الصف العاشر (Grade 10)</option>
                  <option value="الصف الحادي عشر (Grade 11)">الصف الحادي عشر (Grade 11)</option>
                  <option value="الصف الثاني عشر (Grade 12)">الصف الثاني عشر (Grade 12)</option>
                </optgroup>
              </select>
            </div>

            {/* Academic Track: General vs Advanced vs Elite vs None */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المسار الأكاديمي (Track Option)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={formData.track}
                  onChange={e => setFormData({ ...formData, track: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="advanced">المسار المتقدم (Advanced Track)</option>
                  <option value="general">المسار العام (General Track)</option>
                  <option value="elite">مسار النخبة (Elite Track)</option>
                  <option value="none">بدون مسار (رياض أطفال / ابتدائي / عام)</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isHighSchool ? 'متوفر لصفوف الثانوية (عام / متقدم / نخبة)' : 'الصفوف الأساسية تتبع المنهاج العام'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المدرسة (دولة الإمارات)</label>
              <input
                type="text"
                value={formData.school}
                onChange={e => setFormData({ ...formData, school: e.target.value })}
                placeholder="مثال: مدرسة دبي الوطنية / مدرسة المواكب"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">هاتف الطالب الشخصي</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="مثال: +971 50 123 4567"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">النوع / الجنس</label>
              <div className="flex gap-4 pt-1.5">
                <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="gender"
                    checked={formData.gender === 'male'}
                    onChange={() => setFormData({ ...formData, gender: 'male' })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>طالب (ذكر)</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="gender"
                    checked={formData.gender === 'female'}
                    onChange={() => setFormData({ ...formData, gender: 'female' })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>طالبة (أنثى)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">حالة القيد</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value={StudentStatus.ACTIVE}>نشط (Active)</option>
                <option value={StudentStatus.INACTIVE}>غير نشط (Inactive)</option>
                <option value={StudentStatus.SUSPENDED}>موقوف (Suspended)</option>
                <option value={StudentStatus.GRADUATED}>متخرج (Graduated)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Info */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
            2. بيانات ولي الأمر والتواصل
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم ولي الأمر
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="مثال: سلطان النعيمي"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                هاتف ولي الأمر (الاتصال)
              </label>
              <input
                type="text"
                value={formData.parentPhone}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="مثال: +971 50 991 1223"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">صلة القرابة</label>
              <select
                value={formData.parentRelationship}
                onChange={e => setFormData({ ...formData, parentRelationship: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="الأب">الأب</option>
                <option value="الأم">الأم</option>
                <option value="الأخ / الأخت">الأخ / الأخت</option>
                <option value="العم / الخال">العم / الخال</option>
                <option value="ولي أمر قانوني">ولي أمر قانوني</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان السكن (الإمارات)</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="مثال: دبي - ند الشبا / الورقاء 2"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Subjects Registration */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>3. المواد الدراسية المسجل بها الطالب</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                اختر مادة أو أكثر لربط الطالب بالحصص والكشوف، أو أضف مادة دراسية يدوياً فوراً
              </p>
            </div>

            {/* Button: إضافة مادة يدوياً */}
            <button
              type="button"
              onClick={() => setIsAddingManualSubject(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-sm shadow-amber-600/30 transition-all cursor-pointer select-none active:scale-95"
              title="إضافة مادة دراسية يدوياً وتعيينها للطالب"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>إضافة مادة يدوياً</span>
            </button>
          </div>

          {/* Inline Manual Subject Creation Box */}
          {isAddingManualSubject && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  إدخال بيانات المادة يدوياً وتعيينها للطالب
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingManualSubject(false)}
                  className="text-amber-700 dark:text-amber-300 hover:text-amber-900 text-xs px-2 py-0.5 rounded-lg hover:bg-amber-200/50"
                >
                  <X className="w-4 h-4 inline" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المادة الدراسية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualSubjectName}
                    onChange={e => setManualSubjectName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddManualSubject();
                      }
                    }}
                    placeholder="مثال: فيزياء متقدمة - ثانوية / EmSAT Math / كيمياء لغات"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كود المادة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={manualSubjectCode}
                    onChange={e => setManualSubjectCode(e.target.value)}
                    placeholder="مثال: SUB-PHY"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                  ✨ سيتم إنشاء المادة فوراً وتثبيتها في النظام واختيارها لهذا الطالب تلقائياً.
                </span>
                <button
                  type="button"
                  onClick={() => handleAddManualSubject()}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة المادة واختيارها</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
            {subjects.map(sub => {
              const isSelected = formData.subjectIds.includes(sub.id);
              return (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => handleSubjectToggle(sub.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all text-xs font-bold cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 pl-1">
                      <span className="truncate block">{sub.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 block">{sub.code}</span>
                    </div>
                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] shrink-0 ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && '✓'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات إدارية / أكاديمية</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="أي ملاحظات خاصة بالطالب، أهداف اختبارات EmSAT، أو متابعة المستوى..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{studentToEdit ? 'حفظ التعديلات' : 'تسجيل الطالب وتوليد الكود'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
