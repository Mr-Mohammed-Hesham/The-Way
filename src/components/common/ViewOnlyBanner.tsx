import React from 'react';
import { Eye, ShieldAlert, Lock, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppSection } from '../../types';

interface ViewOnlyBannerProps {
  section: AppSection;
  entityName?: string;
  className?: string;
}

export const ViewOnlyBanner: React.FC<ViewOnlyBannerProps> = ({
  section,
  entityName,
  className = ''
}) => {
  const { currentUser, canEditSection, getSectionMeta } = useApp();

  const isEditable = canEditSection(section);
  if (isEditable) return null;

  const meta = getSectionMeta(section);

  return (
    <div
      className={`p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs text-xs animate-in fade-in slide-in-from-top-1 duration-200 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-xl bg-amber-100/90 text-amber-800 shrink-0">
          <Eye className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-amber-950 flex items-center gap-2">
            <span>وضع المشاهدة فقط (View Only)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 text-amber-900">
              قسم: {currentUser.department}
            </span>
          </p>
          <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
            تمتلك صلاحية الاستعراض والاطلاع على {entityName || meta.title}. صلاحيات الإضافة والتعديل والحذف مخصصة لقسم{' '}
            <span className="font-bold underline decoration-amber-400">
              ({meta.allowedDepts.join(' و ')})
            </span>{' '}
            والإدارة.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-xl shrink-0">
        <Lock className="w-3.5 h-3.5" />
        <span>محمي ضد التعديل</span>
      </div>
    </div>
  );
};
