import AdminLayout from "@/admin/components/AdminLayout";
import { useRegistrations } from "@/contexts/RegistrationContext";
import { useTemplate } from "@/contexts/TemplateContext";
import { useNotification } from "@/contexts/NotificationContext";
import {
  Building2, Users, Key, FileText,
  Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Sparkles
} from "lucide-react";
import { Link } from "wouter";

// 최근 계정 승인 요청 (고정 샘플)
const recentAccounts = [
  { name: "김민지", center: "서울 강남구보건소", dept: "건강증진팀", date: "2024.03.11", status: "pending" },
  { name: "이준호", center: "부산 해운대구보건소", dept: "만성질환팀", date: "2024.03.11", status: "pending" },
  { name: "박서연", center: "인천 남동구보건소", dept: "금연클리닉", date: "2024.03.10", status: "approved" },
  { name: "최동현", center: "대전 유성구보건소", dept: "치매안심센터", date: "2024.03.10", status: "approved" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "대기 중", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    approved: { label: "승인 완료", cls: "bg-green-50 text-green-600 border-green-200" },
    rejected: { label: "반려", cls: "bg-red-50 text-red-500 border-red-200" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  );
};

export default function AdminDashboard() {
  const { registrations, pendingCount } = useRegistrations();
  const { orderHistory } = useTemplate();
  const { notifications, unreadCount } = useNotification();

  // 최근 5건
  const recentRegistrations = registrations.slice(0, 5);
  const approvedCount = registrations.filter((r) => r.status === "approved").length;
  const newCount = registrations.filter((r) => r.isNew).length;
  const pendingOrders = orderHistory.filter((o) => o.status === "pending").length;
  const completedOrders = orderHistory.filter((o) => o.status === "completed").length;

  const stats = [
    { label: "등록 보건소", value: String(249 + approvedCount - 7), sub: "전국 17개 시·도", icon: Building2, color: "#00A39B", bg: "#EBF4FF" },
    { label: "대기 중 신청", value: String(pendingCount), sub: "승인 필요", icon: Clock, color: "#FF9500", bg: "#FFF4E5", urgent: pendingCount > 0 },
    { label: "담당자 계정", value: "1,284", sub: "활성 계정", icon: Users, color: "#34C759", bg: "#E8FAF0" },
    { label: "진행 중 주문", value: String(pendingOrders), sub: "처리 필요", icon: FileText, color: "#AF52DE", bg: "#F5EEFF", urgent: pendingOrders > 0 },
  ];

  return (
    <AdminLayout>
      {/* 헤더 */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">대시보드</h1>
          <p className="text-[14px] text-[#6E6E73] mt-1">
            보건소플러스 관리 현황 — {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })} 기준
          </p>
        </div>
        {newCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[13px] font-semibold text-blue-700">신규 신청 {newCount}건 접수</span>
          </div>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl p-5 border ${s.urgent ? "border-amber-200 shadow-amber-50 shadow-md" : "border-black/5"}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              {s.urgent && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                  <AlertTriangle className="w-3 h-3" /> 긴급
                </span>
              )}
            </div>
            <p className="text-[32px] font-bold text-[#1D1D1F] leading-none mb-1">{s.value}</p>
            <p className="text-[13px] font-semibold text-[#1D1D1F]">{s.label}</p>
            <p className="text-[12px] text-[#6E6E73] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 지역별 보건소 현황 */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-[#1D1D1F]">지역별 등록 현황</h2>
          <Link href="/admin/registrations">
            <a className="flex items-center gap-1 text-[13px] text-[#00A39B] font-medium hover:underline">
              전체 보기 <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </Link>
        </div>
        <div className="hidden sm:grid grid-cols-6 gap-3"></div>
        {/* 모바일: 가로 스크롤 */}
        <div className="sm:hidden flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {[
            { region: "서울", count: 25, total: 25 },
            { region: "경기", count: 42, total: 42 },
            { region: "부산", count: 16, total: 16 },
            { region: "인천", count: 10, total: 10 },
            { region: "대구", count: 8, total: 8 },
            { region: "경남", count: 22, total: 22 },
            { region: "경북", count: 24, total: 24 },
            { region: "전남", count: 22, total: 22 },
            { region: "전북", count: 14, total: 14 },
            { region: "충남", count: 16, total: 16 },
            { region: "충북", count: 12, total: 12 },
            { region: "강원", count: 18, total: 18 },
          ].map((r) => (
            <div key={r.region} className="text-center p-3 rounded-xl bg-[#F5F5F7] flex-shrink-0 w-[72px]">
              <p className="text-[20px] font-bold text-[#00A39B]">{r.count}</p>
              <p className="text-[12px] font-medium text-[#1D1D1F]">{r.region}</p>
              <div className="mt-2 h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00A39B] rounded-full"
                  style={{ width: `${(r.count / r.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {/* 데스크톱: 6열 그리드 (위에서 hidden sm:grid로 처리) */}
        <div className="hidden sm:grid grid-cols-6 gap-3">
          {[
            { region: "서울", count: 25, total: 25 },
            { region: "경기", count: 42, total: 42 },
            { region: "부산", count: 16, total: 16 },
            { region: "인천", count: 10, total: 10 },
            { region: "대구", count: 8, total: 8 },
            { region: "경남", count: 22, total: 22 },
            { region: "경북", count: 24, total: 24 },
            { region: "전남", count: 22, total: 22 },
            { region: "전북", count: 14, total: 14 },
            { region: "충남", count: 16, total: 16 },
            { region: "충북", count: 12, total: 12 },
            { region: "강원", count: 18, total: 18 },
          ].map((r) => (
            <div key={r.region} className="text-center p-3 rounded-xl bg-[#F5F5F7]">
              <p className="text-[20px] font-bold text-[#00A39B]">{r.count}</p>
              <p className="text-[12px] font-medium text-[#1D1D1F]">{r.region}</p>
              <div className="mt-2 h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00A39B] rounded-full"
                  style={{ width: `${(r.count / r.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 2컬럼 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 최근 등록 신청 — Context 실시간 연동 */}
        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-[#1D1D1F]">최근 등록 신청</h2>
            <Link href="/admin/registrations">
              <a className="flex items-center gap-1 text-[13px] text-[#00A39B] font-medium hover:underline">
                전체 보기 <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </Link>
          </div>
          <div className="space-y-3">
            {recentRegistrations.map((r) => (
              <div key={r.id} className={`flex items-center justify-between py-2 border-b border-black/5 last:border-0 ${r.isNew ? "rounded-lg px-2 bg-blue-50/40" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF4FF] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-[#00A39B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">{r.name}</p>
                      {r.isNew && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-bold rounded-full">NEW</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E6E73]">{r.region} · {r.appliedAt}</p>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        {/* 최근 계정 승인 요청 */}
        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-[#1D1D1F]">담당자 계정 승인 요청</h2>
            <Link href="/admin/accounts">
              <a className="flex items-center gap-1 text-[13px] text-[#00A39B] font-medium hover:underline">
                전체 보기 <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </Link>
          </div>
          <div className="space-y-3">
            {recentAccounts.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A2B3C] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[12px] font-bold">{a.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1D1D1F]">{a.name} <span className="font-normal text-[#6E6E73]">· {a.dept}</span></p>
                    <p className="text-[11px] text-[#6E6E73]">{a.center} · {a.date}</p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 작업 배너 */}
      {pendingCount > 0 && (
        <div className="mt-6 bg-gradient-to-r from-[#1A2B3C] to-[#243547] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-[17px]">{pendingCount}개의 승인 대기 신청이 있습니다</p>
            <p className="text-white/60 text-[13px] mt-1">빠른 처리로 보건소 담당자의 업무를 지원하세요</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/registrations">
              <a className="px-5 py-2.5 bg-white text-[#1A2B3C] text-[13px] font-semibold rounded-xl hover:bg-white/90 transition-colors">
                등록 신청 처리
              </a>
            </Link>
            <Link href="/admin/accounts">
              <a className="px-5 py-2.5 bg-white/15 text-white text-[13px] font-semibold rounded-xl hover:bg-white/20 transition-colors">
                계정 승인 처리
              </a>
            </Link>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
