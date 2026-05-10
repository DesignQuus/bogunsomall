/**
 * NameInputStep — Step 3: 담당자 이름 입력
 */
import { ArrowLeft, Building2, Users, CheckCircle2 } from "lucide-react";
import type { Center, Department } from "@/contexts/CenterContext";

interface Props {
  center: Center;
  dept: Department;
  userName: string;
  setUserName: (v: string) => void;
  onEnter: () => void;
  onBack: () => void;
}

export default function NameInputStep({ center, dept, userName, setUserName, onEnter, onBack }: Props) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] text-[#86868b] hover:text-[#00A39B] transition-colors mb-4 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        부서 다시 선택
      </button>

      {/* 선택 요약 */}
      <div className="p-3.5 bg-blue-50 rounded-2xl mb-5 border border-[#00A39B]/15 space-y-1.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#00A39B]" />
          <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">{center.name}</p>
          <span className="text-[10px] font-code text-[#00A39B] bg-white px-1.5 py-0.5 rounded border border-[#00A39B]/20 shrink-0">{center.code}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#00A39B]" />
          <p className="text-[13px] text-[#424245]">{dept.name}</p>
          <CheckCircle2 className="w-3 h-3 text-green-500" />
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-[18px] font-bold text-[#1d1d1f] tracking-tight mb-1">담당자 이름</h2>
        <p className="text-[13px] text-[#86868b]">주문 이력 식별에 사용됩니다</p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onEnter()}
          placeholder="예: 홍길동"
          autoFocus
          className="w-full px-4 py-3.5 text-[15px] bg-[#f5f5f7] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-[#00A39B] focus:ring-2 focus:ring-[#00A39B]/10 transition-all placeholder:text-[#c7c7cc] text-center font-medium"
        />
        <button
          onClick={onEnter}
          disabled={!userName.trim()}
          className="w-full py-3.5 bg-[#00A39B] text-white text-[14px] font-semibold rounded-xl hover:bg-[#0055AA] active:bg-[#004499] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          확인 →
        </button>
      </div>
    </div>
  );
}
