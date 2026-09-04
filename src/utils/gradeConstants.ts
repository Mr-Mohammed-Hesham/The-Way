// UAE Educational Grades and Stages (KG to Grade 12 + Track Options)

export interface GradeOption {
  value: string;
  label: string;
  stage: 'kindergarten' | 'primary' | 'middle' | 'secondary';
  tracksAllowed?: boolean; // Grades 9-12 have General (عام) vs Advanced (متقدم)
}

export const UAE_STAGES = [
  { id: 'kindergarten', name: 'مرحلة رياض الأطفال (KG1 - KG2)' },
  { id: 'primary', name: 'المرحلة التأسيسية / الابتدائية (الصف 1 - 5)' },
  { id: 'middle', name: 'المرحلة المتوسطة (الصف 6 - 8)' },
  { id: 'secondary', name: 'المرحلة الثانوية (الصف 9 - 12)' }
];

export const UAE_GRADES_BASE = [
  { value: 'KG 1', label: 'روضة أولى (KG 1)', stage: 'kindergarten' as const, tracksAllowed: false },
  { value: 'KG 2', label: 'روضة ثانية (KG 2)', stage: 'kindergarten' as const, tracksAllowed: false },
  { value: 'Grade 1', label: 'الصف الأول الابتدائي (Grade 1)', stage: 'primary' as const, tracksAllowed: false },
  { value: 'Grade 2', label: 'الصف الثاني الابتدائي (Grade 2)', stage: 'primary' as const, tracksAllowed: false },
  { value: 'Grade 3', label: 'الصف الثالث الابتدائي (Grade 3)', stage: 'primary' as const, tracksAllowed: false },
  { value: 'Grade 4', label: 'الصف الرابع الابتدائي (Grade 4)', stage: 'primary' as const, tracksAllowed: false },
  { value: 'Grade 5', label: 'الصف الخامس الابتدائي (Grade 5)', stage: 'primary' as const, tracksAllowed: false },
  { value: 'Grade 6', label: 'الصف السادس (Grade 6)', stage: 'middle' as const, tracksAllowed: false },
  { value: 'Grade 7', label: 'الصف السابع (Grade 7)', stage: 'middle' as const, tracksAllowed: false },
  { value: 'Grade 8', label: 'الصف الثامن (Grade 8)', stage: 'middle' as const, tracksAllowed: false },
  { value: 'Grade 9', label: 'الصف التاسع (Grade 9)', stage: 'secondary' as const, tracksAllowed: true },
  { value: 'Grade 10', label: 'الصف العاشر (Grade 10)', stage: 'secondary' as const, tracksAllowed: true },
  { value: 'Grade 11', label: 'الصف الحادي عشر (Grade 11)', stage: 'secondary' as const, tracksAllowed: true },
  { value: 'Grade 12', label: 'الصف الثاني عشر (Grade 12)', stage: 'secondary' as const, tracksAllowed: true }
];

export type AcademicTrack = 'general' | 'advanced' | 'elite' | 'none';

export const TRACK_OPTIONS = [
  { value: 'none', label: 'بدون مسار (الصفوف الأساسية)' },
  { value: 'general', label: 'المسار العام (General Track)' },
  { value: 'advanced', label: 'المسار المتقدم (Advanced Track)' },
  { value: 'elite', label: 'مسار النخبة (Elite Track)' }
];

export function formatUAEGrade(gradeName: string, track?: string): string {
  if (!track || track === 'none' || track === '') {
    return gradeName;
  }
  const trackLabel =
    track === 'advanced' || track === 'متقدم'
      ? 'متقدم'
      : track === 'elite' || track === 'نخبة'
      ? 'نخبة'
      : 'عام';
  
  if (gradeName.includes('متقدم') || gradeName.includes('عام') || gradeName.includes('نخبة')) {
    return gradeName;
  }
  return `${gradeName} - مسار ${trackLabel}`;
}
