import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CreditCard,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { ConfirmModal } from '../../common/ConfirmModal';
import { ViewOnlyBanner } from '../../common/ViewOnlyBanner';
import { Contract, ContractStatus } from '../../../types';
import { formatCurrency, formatArabicDate } from '../../../utils/formatters';

interface ContractsViewProps {
  onOpenAddContract: () => void;
  onOpenEditContract: (contract: Contract) => void;
  onOpenAddPaymentForContract: (studentId: string, contractId: string) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  onOpenAddContract,
  onOpenEditContract,
  onOpenAddPaymentForContract
}) => {
  const {
    contracts,
    students,
    subjects,
    payments,
    studentsMap,
    subjectsMap,
    deleteContract,
    settings,
    canEditSection
  } = useApp();

  const isEditable = canEditSection('contracts');
  const canAddPayment = canEditSection('payments');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const stName = (studentsMap[c.studentId] || '').toLowerCase();
    const matchesSearch = !q || c.contractNumber.toLowerCase().includes(q) || stName.includes(q);
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-right">
      {/* View Only Banner for restricted departments */}
      <ViewOnlyBanner section="contracts" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            إدارة العقود والاشتراكات وباقات الحصص
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة استهلاك الحصص، الرصيد المتبقي، تجديد العقود، والتنبيهات المبكرة
          </p>
        </div>

        {isEditable && (
          <button
            onClick={onOpenAddContract}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>عقد واشتراك جديد</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث برقم العقد أو اسم الطالب..."
              className="w-full pr-9 pl-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة حالات العقود</option>
            <option value={ContractStatus.ACTIVE}>نشط (Active)</option>
            <option value={ContractStatus.EXPIRING_SOON}>قارب على الانتهاء</option>
            <option value={ContractStatus.COMPLETED}>مكتمل (Completed)</option>
            <option value={ContractStatus.EXPIRED}>منتهي (Expired)</option>
          </select>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.map(contract => {
          const student = students.find(s => s.id === contract.studentId);
          const contractPayments = payments.filter(p => p.contractId === contract.id);
          const totalPaid = contractPayments.reduce((acc, p) => acc + p.amount, 0);
          const remainingAmount = Math.max(0, contract.totalPrice - totalPaid);

          const remainingSessions = Math.max(0, contract.totalSessions - contract.usedSessions);
          const completionPct = Math.min(100, Math.round((contract.usedSessions / contract.totalSessions) * 100));

          return (
            <div
              key={contract.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-200 transition-all text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200 block w-fit mb-1.5">
                    {contract.contractNumber}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{student?.name || 'طالب'}</h3>
                  <p className="text-[11px] text-slate-400">{student?.grade}</p>
                </div>
                <Badge status={contract.status} />
              </div>

              {/* Sessions Progress Bar */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">استهلاك الحصص:</span>
                  <span className="text-indigo-950 font-mono">
                    {contract.usedSessions} من {contract.totalSessions} (متبقي {remainingSessions})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      completionPct >= 90
                        ? 'bg-rose-500'
                        : completionPct >= 75
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Financial Box */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">إجمالي العقد:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(contract.totalPrice, settings.currency)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">المسدد:</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(totalPaid, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => onOpenAddPaymentForContract(contract.studentId, contract.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>سداد دفعة</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditContract(contract)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setContractToDelete(contract)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!contractToDelete}
        onClose={() => setContractToDelete(null)}
        onConfirm={() => {
          if (contractToDelete) {
            deleteContract(contractToDelete.id);
          }
        }}
        title="تأكيد حذف العقد"
        message={`هل أنت متأكد من رغبتك في حذف العقد رقم "${contractToDelete?.contractNumber}"؟`}
        confirmText="نعم، حذف العقد"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
};
