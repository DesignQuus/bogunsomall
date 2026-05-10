import { useState } from "react";
import AdminLayout from "@/admin/components/AdminLayout";
import {
  Users, Search, CheckCircle2, XCircle, Eye,
  Download, Shield, Phone, Mail, Building2, Calendar
} from "lucide-react";
import { toast } from "sonner";

interface Account {
  id: string;
  name: string;
  center: string;
  region: string;
  dept: string;
  phone: string;
  email: string;
  appliedAt: string;
  status: "pending" | "approved" | "rejected";
  role: "manager" | "admin";
  note?: string;
}

const SAMPLE_ACCOUNTS: Account[] = [
  { id: "ACC-2024-156", name: "김민지", center: "서울 강남구보건소", region: "서울특별시", dept: "건강증진팀", phone: "010-1234-5678", email: "minji@gangnam.go.kr", appliedAt: "2024.03.11", status: "pending", role: "manager" },
  { id: "ACC-2024-155", name: "이준호", center: "부산 해운대구보건소", region: "부산광역시", dept: "만성질환팀", phone: "010-2345-6789", email: "junho@haeundae.go.kr", appliedAt: "2024.03.11", status: "pending", role: "manager" },
  { id: "ACC-2024-154", name: "박서연", center: "인천 남동구보건소", region: "인천광역시", dept: "금연클리닉", phone: "010-3456-7890", email: "seoyeon@namdong.go.kr", appliedAt: "2024.03.10", status: "approved", role: "manager" },
  { id: "ACC-2024-153", name: "최동현", center: "대전 유성구보건소", region: "대전광역시", dept: "치매안심센터", phone: "010-4567-8901", email: "donghyun@yuseong.go.kr", appliedAt: "2024.03.10", status: "approved", role: "admin" },
  { id: "ACC-2024-152", name: "정수아", center: "광주 북구보건소", region: "광주광역시", dept: "모자보건팀", phone: "010-5678-9012", email: "sua@bukgu.go.kr", appliedAt: "2024.03.09", status: "pending", role: "manager" },
  { id: "ACC-2024-151", name: "윤재원", center: "대구 달서구보건소", region: "대구광역시", dept: "정신건강팀", phone: "010-6789-0123", email: "jaewon@dalseo.go.kr", appliedAt: "2024.03.09", status: "rejected", role: "manager", note: "기관 코드 미등록" },
  { id: "ACC-2024-150", name: "한소희", center: "경기 수원시보건소", region: "경기도", dept: "영양관리팀", phone: "010-7890-1234", email: "sohee@suwon.go.kr", appliedAt: "2024.03.08", status: "approved", role: "manager" },
  { id: "ACC-2024-149", name: "임지훈", center: "경남 창원시보건소", region: "경상남도", dept: "구강보건팀", phone: "010-8901-2345", email: "jihoon@changwon.go.kr", appliedAt: "2024.03.08", status: "approved", role: "admin" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "대기 중", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    approved: { label: "승인 완료", cls: "bg-green-50 text-green-600 border-green-200" },
    rejected: { label: "반려", cls: "bg-red-50 text-red-500 border-red-200" },
  };
  const s = map[status] || map.pending;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>{s.label}</span>;
};

const RoleBadge = ({ role }: { role: string }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
    role === "admin"
      ? "bg-purple-50 text-purple-600 border-purple-200"
      : "bg-blue-50 text-blue-600 border-blue-200"
  }`}>
    <Shield className="w-2.5 h-2.5" />
    {role === "admin" ? "기관관리자" : "담당자"}
  </span>
);

export default function AdminAccounts() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Account | null>(null);
  const [data, setData] = useState<Account[]>(SAMPLE_ACCOUNTS);
  const [rejectNote, setRejectNote] = useState("");

  const filtered = data.filter((a) => {
    const matchStatus = filter === "all" || a.status === filter;
    const matchSearch = a.name.includes(search) || a.center.includes(search) || a.dept.includes(search);
    return matchStatus && matchSearch;
  });

  const pendingCount = data.filter((a) => a.status === "pending").length;

  const handleApprove = (id: string) => {
    setData((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
    setSelected(null);
    toast.success("담당자 계정이 승인되었습니다. 로그인 안내 이메일이 발송됩니다.");
  };

  const handleReject = (id: string) => {
    setData((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected", note: rejectNote || "검토 후 반려" } : a));
    setSelected(null);
    setRejectNote("");
    toast.error("계정 신청이 반려되었습니다.");
  };

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">담당자 계정 승인 관리</h1>
          <p className="text-[14px] text-[#6E6E73] mt-1">보건소 담당자 계정 신청을 검토하고 승인합니다</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[13px] font-semibold text-amber-700">{pendingCount}건 승인 대기 중</span>
          </div>
        )}
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "전체 신청", value: data.length, color: "#1A2B3C", bg: "#F5F5F7" },
          { label: "대기 중", value: data.filter(a => a.status === "pending").length, color: "#FF9500", bg: "#FFF4E5" },
          { label: "승인 완료", value: data.filter(a => a.status === "approved").length, color: "#34C759", bg: "#E8FAF0" },
          { label: "반려", value: data.filter(a => a.status === "rejected").length, color: "#FF3B30", bg: "#FFF0EF" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-black/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
              <Users className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-[#1D1D1F]">{s.value}</p>
              <p className="text-[12px] text-[#6E6E73]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 필터 & 검색 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름, 기관명, 부서 검색"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A2B3C] bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                filter === s ? "bg-[#1A2B3C] text-white" : "bg-white text-[#6E6E73] border border-black/10 hover:border-[#1A2B3C]"
              }`}
            >
              {s === "all" ? "전체" : s === "pending" ? "대기 중" : s === "approved" ? "승인" : "반려"}
            </button>
          ))}
        </div>
        <button className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-[13px] text-[#6E6E73] bg-white hover:border-[#1A2B3C] transition-all">
          <Download className="w-4 h-4" /> 내보내기
        </button>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5 bg-[#F5F5F7]">
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">신청번호</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">담당자</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">소속 기관</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">역할</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">신청일</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">상태</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">작업</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-black/5 last:border-0 hover:bg-[#F5F5F7]/50 transition-colors">
                <td className="px-5 py-4 text-[12px] font-code text-[#6E6E73]">{a.id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1A2B3C] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[12px] font-bold">{a.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">{a.name}</p>
                      <p className="text-[11px] text-[#6E6E73]">{a.dept}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-[13px] font-medium text-[#1D1D1F]">{a.center}</p>
                  <p className="text-[11px] text-[#6E6E73]">{a.region}</p>
                </td>
                <td className="px-5 py-4"><RoleBadge role={a.role} /></td>
                <td className="px-5 py-4 text-[13px] text-[#6E6E73]">{a.appliedAt}</td>
                <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelected(a)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F5F7] text-[12px] font-medium text-[#424245] hover:bg-[#E8E8ED] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> 상세
                    </button>
                    {a.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(a.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-[12px] font-medium text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> 승인
                        </button>
                        <button
                          onClick={() => handleReject(a.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-[12px] font-medium text-red-500 hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <XCircle className="w-3.5 h-3.5" /> 반려
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-[#AEAEB2] mx-auto mb-3" />
            <p className="text-[14px] text-[#6E6E73]">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden">
            <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A2B3C] flex items-center justify-center">
                  <span className="text-white text-[16px] font-bold">{selected.name[0]}</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#1D1D1F]">{selected.name}</h3>
                  <p className="text-[12px] text-[#6E6E73]">{selected.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={selected.role} />
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5F5F7] rounded-xl space-y-2">
                  <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide">연락처</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#6E6E73]" />
                    <p className="text-[12px] text-[#424245]">{selected.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#6E6E73]" />
                    <p className="text-[12px] text-[#424245]">{selected.email}</p>
                  </div>
                </div>
                <div className="p-4 bg-[#F5F5F7] rounded-xl space-y-2">
                  <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide">소속</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#6E6E73]" />
                    <p className="text-[12px] text-[#424245]">{selected.center}</p>
                  </div>
                  <p className="text-[12px] text-[#6E6E73] pl-5">{selected.dept}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#6E6E73]">
                <Calendar className="w-3.5 h-3.5" />
                신청일: {selected.appliedAt}
              </div>
              {selected.note && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[12px] text-red-600 font-medium">반려 사유: {selected.note}</p>
                </div>
              )}
              {selected.status === "pending" && (
                <div>
                  <label className="block text-[12px] font-semibold text-[#1D1D1F] mb-2">반려 시 사유 입력 (선택)</label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="반려 사유를 입력하세요..."
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[13px] resize-none h-16 focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]"
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-black/5 flex gap-3 justify-end">
              <button
                onClick={() => { setSelected(null); setRejectNote(""); }}
                className="px-5 py-2.5 rounded-xl border border-black/10 text-[13px] font-medium text-[#424245] hover:bg-[#F5F5F7] transition-colors"
              >
                닫기
              </button>
              {selected.status === "pending" && (
                <>
                  <button
                    onClick={() => handleReject(selected.id)}
                    className="px-5 py-2.5 rounded-xl bg-red-50 text-[13px] font-semibold text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    반려
                  </button>
                  <button
                    onClick={() => handleApprove(selected.id)}
                    className="px-5 py-2.5 rounded-xl bg-[#1A2B3C] text-[13px] font-semibold text-white hover:bg-[#243547] transition-colors"
                  >
                    계정 승인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
