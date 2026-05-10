/**
 * SuccessStep — Step 4: 입장 성공 화면
 */
import { CheckCircle2 } from "lucide-react";
import type { Center, Department } from "@/contexts/CenterContext";

interface Props {
  center: Center | null;
  dept: Department | null;
  userName: string;
}

export default function SuccessStep({ center, dept, userName }: Props) {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#EBF4FF] to-[#D6EAFF] mb-4">
        <CheckCircle2 className="w-8 h-8 text-[#00A39B]" />
      </div>
      <h2 className="text-[22px] font-bold text-[#1d1d1f] mb-2 tracking-tight">입장 완료!</h2>
      <p className="text-[14px] text-[#86868b] leading-relaxed">
        <span className="text-[#1d1d1f] font-medium">{center?.name}</span><br />
        <span className="text-[#00A39B] font-medium">{dept?.name}</span> · {userName}<br />
        대시보드로 이동 중입니다...
      </p>
      <div className="mt-5 flex justify-center">
        <div className="w-5 h-5 border-2 border-[#00A39B]/20 border-t-[#00A39B] rounded-full animate-spin" />
      </div>
    </div>
  );
}
