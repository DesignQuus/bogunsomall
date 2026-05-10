/**
 * AdminCodes.tsx — 코드 발급 관리 페이지
 * - CenterContext 기반: 기관 등록 시 자동 발급된 코드가 즉시 반영
 * - 코드 상태 변경(활성/정지/만료), 코드 재발급, 복사 기능
 */

import { useState } from "react";
import AdminLayout from "@/admin/components/AdminLayout";
import { useCenters } from "@/contexts/CenterContext";
import {
  Key, Search, Copy, RefreshCw, Plus, Download,
  Building2, CheckCircle2, Clock, Eye, EyeOff, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "활성", cls: "bg-green-50 text-green-600 border-green-200" },
    expired: { label: "만료", cls: "bg-gray-50 text-gray-500 border-gray-200" },
    suspended: { label: "정지", cls: "bg-red-50 text-red-500 border-red-200" },
  };
  const s = map[status] || map.active;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  );
};

export default function AdminCodes() {
  const { centers, updateCodeStatus, reissueCode } = useCenters();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "suspended">("all");
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set());

  // 필터링
  const filtered = centers.filter((c) => {
    const matchStatus = filter === "all" || c.codeStatus === filter;
    const matchSearch =
      c.name.includes(search) ||
      c.code.includes(search.toUpperCase()) ||
      c.region.includes(search);
    return matchStatus && matchSearch;
  });

  const activeCount = centers.filter(c => c.codeStatus === "active").length;
  const expiredCount = centers.filter(c => c.codeStatus === "expired").length;
  const suspendedCount = centers.filter(c => c.codeStatus === "suspended").length;

  // 이번 달 신규 등록
  const thisMonth = new Date().toISOString().slice(0, 7);
  const newThisMonth = centers.filter(c => c.createdAt.startsWith(thisMonth)).length;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`코드 "${code}"가 클립보드에 복사되었습니다.`);
  };

  const toggleVisibility = (id: string) => {
    setVisibleCodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleReissue = (centerId: string, centerName: string) => {
    const newCode = reissueCode(centerId);
    toast.success(`"${centerName}"의 코드가 ${newCode}로 재발급되었습니다.`);
  };

  const handleSuspend = (centerId: string, centerName: string) => {
    updateCodeStatus(centerId, "suspended");
    toast.error(`"${centerName}"의 코드가 정지되었습니다.`);
  };

  const handleActivate = (centerId: string, centerName: string) => {
    updateCodeStatus(centerId, "active");
    toast.success(`"${centerName}"의 코드가 활성화되었습니다.`);
  };

  const handleExport = () => {
    const rows = [
      ["기관명", "지역", "코드", "상태", "사용횟수", "마지막접속", "등록일", "만료일"],
      ...centers.map(c => [
        c.name, c.region, c.code, c.codeStatus,
        String(c.usageCount), c.lastUsed || "—", c.createdAt, c.codeExpiresAt,
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `보건소코드_${new Date().toLocaleDateString("ko-KR").replace(/\. /g, "-").replace(".", "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("코드 목록이 CSV로 내보내졌습니다.");
  };

  return (
    <AdminLayout>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">코드 발급 관리</h1>
          <p className="text-[14px] text-[#6E6E73] mt-1">
            보건소별 접근 코드를 관리합니다 — 기관 등록 시 자동 발급됩니다
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A2B3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#243547] transition-colors"
        >
          <Download className="w-4 h-4" /> 전체 내보내기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "전체 발급 코드", value: centers.length, icon: Key, color: "#1A2B3C", bg: "#F5F5F7" },
          { label: "활성 코드", value: activeCount, icon: CheckCircle2, color: "#34C759", bg: "#E8FAF0" },
          { label: "만료 코드", value: expiredCount, icon: Clock, color: "#FF9500", bg: "#FFF4E5" },
          { label: "이번 달 신규", value: newThisMonth, icon: Plus, color: "#00A39B", bg: "#EBF4FF" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-black/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-[#1D1D1F]">{s.value}</p>
              <p className="text-[12px] text-[#6E6E73]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 안내 배너 */}
      <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <p className="text-[13px] text-blue-700">
          기관 관리 페이지에서 신규 기관을 등록하면 코드가 자동 발급되어 이 목록에 즉시 반영됩니다.
        </p>
        <a href="/admin/centers" className="ml-auto text-[12px] font-semibold text-blue-600 hover:underline flex-shrink-0">
          기관 관리 →
        </a>
      </div>

      {/* 필터 & 검색 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="기관명, 코드, 지역 검색"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A2B3C] bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "expired", "suspended"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                filter === s
                  ? "bg-[#1A2B3C] text-white"
                  : "bg-white text-[#6E6E73] border border-black/10 hover:border-[#1A2B3C]"
              }`}
            >
              {s === "all" ? `전체 (${centers.length})` : s === "active" ? `활성 (${activeCount})` : s === "expired" ? `만료 (${expiredCount})` : `정지 (${suspendedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5 bg-[#F5F5F7]">
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">기관명</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">발급 코드</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">등록일</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">만료일</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">사용 횟수</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">마지막 접속</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">상태</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">작업</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-[14px] text-[#AEAEB2]">
                  <Key className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  검색 결과가 없습니다
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-black/5 last:border-0 hover:bg-[#F5F5F7]/50 transition-colors">
                  {/* 기관명 */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF4FF] flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-[#00A39B]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1D1D1F]">{c.name}</p>
                        <p className="text-[11px] text-[#6E6E73]">{c.region}</p>
                      </div>
                    </div>
                  </td>

                  {/* 코드 */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-[13px] font-code font-bold text-[#1A2B3C] bg-[#F5F5F7] px-2.5 py-1 rounded-lg">
                        {visibleCodes.has(c.id) ? c.code : c.code.replace(/[A-Z]/g, "•")}
                      </code>
                      <button
                        onClick={() => toggleVisibility(c.id)}
                        className="text-[#AEAEB2] hover:text-[#6E6E73] transition-colors"
                        title={visibleCodes.has(c.id) ? "코드 숨기기" : "코드 보기"}
                      >
                        {visibleCodes.has(c.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="text-[#AEAEB2] hover:text-[#00A39B] transition-colors"
                        title="코드 복사"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* 날짜 */}
                  <td className="px-5 py-4 text-[13px] text-[#6E6E73]">{c.createdAt}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[13px] ${
                      new Date(c.codeExpiresAt) < new Date()
                        ? "text-red-500 font-semibold"
                        : new Date(c.codeExpiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? "text-orange-500 font-semibold"
                          : "text-[#6E6E73]"
                    }`}>
                      {c.codeExpiresAt}
                    </span>
                  </td>

                  {/* 사용 횟수 */}
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-semibold text-[#1D1D1F]">{c.usageCount}</span>
                    <span className="text-[11px] text-[#6E6E73] ml-1">회</span>
                  </td>

                  {/* 마지막 접속 */}
                  <td className="px-5 py-4 text-[13px] text-[#6E6E73]">{c.lastUsed || "—"}</td>

                  {/* 상태 */}
                  <td className="px-5 py-4"><StatusBadge status={c.codeStatus} /></td>

                  {/* 작업 */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReissue(c.id, c.name)}
                        title="코드 재발급"
                        className="p-1.5 rounded-lg text-[#6E6E73] hover:text-[#00A39B] hover:bg-blue-50 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      {c.codeStatus === "suspended" ? (
                        <button
                          onClick={() => handleActivate(c.id, c.name)}
                          title="코드 활성화"
                          className="p-1.5 rounded-lg text-[#6E6E73] hover:text-green-600 hover:bg-green-50 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(c.id, c.name)}
                          title="코드 정지"
                          className="p-1.5 rounded-lg text-[#6E6E73] hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 요약 */}
      {filtered.length > 0 && (
        <p className="mt-3 text-[12px] text-[#AEAEB2] text-right">
          총 {filtered.length}개 기관 코드 표시 중
        </p>
      )}
    </AdminLayout>
  );
}
