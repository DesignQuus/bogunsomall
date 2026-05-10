import AdminLayout from "@/admin/components/AdminLayout";
import { useRegistrations } from "@/contexts/RegistrationContext";
import {
  Building2, Search, CheckCircle2, XCircle,
  Eye, Download, Phone, MapPin, Calendar, Sparkles, Trash2, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "대기 중", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    approved: { label: "승인 완료", cls: "bg-green-50 text-green-600 border-green-200" },
    rejected: { label: "반려", cls: "bg-red-50 text-red-500 border-red-200" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
};

export default function AdminRegistrations() {
  const { registrations, updateStatus, deleteRegistration, pendingCount } = useRegistrations();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof registrations[0] | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteRegistration(id);
    setDeleteConfirm(null);
    if (selected?.id === id) setSelected(null);
    toast.success("신청 내역이 삭제되었습니다.");
  };

  const filtered = registrations.filter((r) => {
    const matchStatus = filter === "all" || r.status === filter;
    const matchSearch = r.name.includes(search) || r.region.includes(search) || r.contactName.includes(search);
    return matchStatus && matchSearch;
  });

  const handleApprove = (id: string) => {
    updateStatus(id, "approved");
    setSelected(null);
    toast.success("보건소 등록이 승인되었습니다. 기관 코드가 자동 발급됩니다.");
  };

  const handleReApprove = (id: string) => {
    updateStatus(id, "approved", "");
    setSelected(null);
    toast.success("반려된 신청이 승인으로 변경되었습니다.");
  };

  const handleReject = (id: string) => {
    updateStatus(id, "rejected", rejectNote || "검토 후 반려");
    setSelected(null);
    setRejectNote("");
    toast.error("등록 신청이 반려되었습니다.");
  };

  return (
    <AdminLayout>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">보건소 등록 신청 관리</h1>
          <p className="text-[14px] text-[#6E6E73] mt-1">신규 보건소 등록 신청을 검토하고 승인합니다</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[13px] font-semibold text-amber-700">{pendingCount}건 승인 대기 중</span>
          </div>
        )}
      </div>

      {/* 필터 & 검색 */}
      {/* 모바일: 검색 + 필터 세로 스택 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-5">
        <div className="relative flex-1 sm:max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="기관명, 지역, 담당자 검색"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A2B3C] bg-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
          {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
                filter === s
                  ? "bg-[#1A2B3C] text-white"
                  : "bg-white text-[#6E6E73] border border-black/10 hover:border-[#1A2B3C]"
              }`}
            >
              {s === "all" ? "전체" : s === "pending" ? "대기 중" : s === "approved" ? "승인" : "반려"}
              {s === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
          <button className="flex-shrink-0 ml-1 flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 text-[13px] text-[#6E6E73] bg-white hover:border-[#1A2B3C] transition-all whitespace-nowrap">
            <Download className="w-4 h-4" /> 내보내기
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-black/5 bg-[#F5F5F7]">
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73] whitespace-nowrap">신청번호</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">기관명</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">지역</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">담당자</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">신청일</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">상태</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#6E6E73]">작업</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className={`border-b border-black/5 last:border-0 transition-colors ${
                  r.isNew ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-[#F5F5F7]/50"
                }`}
              >
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-nowrap">
                    <span className="text-[12px] font-code text-[#6E6E73] whitespace-nowrap">{r.id}</span>
                    {r.isNew && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">
                        <Sparkles className="w-2.5 h-2.5" /> NEW
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 max-w-[200px]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EBF4FF] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-[#00A39B]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{r.name}</p>
                      <p className="text-[11px] text-[#6E6E73] truncate">{r.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[13px] text-[#424245] whitespace-nowrap">{r.region}</td>
                <td className="px-5 py-4 max-w-[120px]">
                  <p className="text-[13px] font-medium text-[#1D1D1F] truncate">{r.contactName}</p>
                  <p className="text-[11px] text-[#6E6E73] truncate">{r.contactDept}</p>
                </td>
                <td className="px-5 py-4 text-[13px] text-[#6E6E73]">{r.appliedAt}</td>
                <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 flex-nowrap">
                    <button
                      onClick={() => setSelected(r)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F5F7] text-[12px] font-medium text-[#424245] hover:bg-[#E8E8ED] transition-colors whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5 flex-shrink-0" /> 상세
                    </button>
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-[12px] font-medium text-green-600 hover:bg-green-100 transition-colors border border-green-200 whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> 승인
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-[12px] font-medium text-red-500 hover:bg-red-100 transition-colors border border-red-200 whitespace-nowrap"
                        >
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> 반려
                        </button>
                      </>
                    )}
                    {r.status === "rejected" && (
                      <button
                        onClick={() => handleReApprove(r.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-[12px] font-medium text-green-600 hover:bg-green-100 transition-colors border border-green-200 whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" /> 재승인
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(r.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-[12px] font-medium text-red-500 hover:bg-red-100 transition-colors border border-red-200 whitespace-nowrap"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5 flex-shrink-0" /> 삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-[#AEAEB2] mx-auto mb-3" />
            <p className="text-[14px] text-[#6E6E73]">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF4FF] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#00A39B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-bold text-[#1D1D1F]">{selected.name}</h3>
                    {selected.isNew && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">
                        <Sparkles className="w-2.5 h-2.5" /> 신규 신청
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#6E6E73] mt-0.5">{selected.id}</p>
                </div>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* 기관 정보 */}
              <div className="p-4 bg-[#F5F5F7] rounded-xl space-y-2.5">
                <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide mb-3">기관 정보</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#6E6E73] mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-[#424245]">{selected.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6E6E73]" />
                  <p className="text-[12px] text-[#424245]">{selected.phone}</p>
                </div>
                {selected.businessNumber && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#6E6E73] w-3.5 text-center">사</span>
                    <p className="text-[12px] font-code text-[#424245]">{selected.businessNumber}</p>
                  </div>
                )}
              </div>

              {/* 담당자 정보 */}
              <div className="p-4 bg-[#F5F5F7] rounded-xl space-y-2.5">
                <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide mb-3">담당자 정보</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#6E6E73] w-3.5 text-center">이</span>
                  <p className="text-[12px] text-[#424245]">{selected.contactName} ({selected.contactDept})</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6E6E73]" />
                  <p className="text-[12px] text-[#424245]">{selected.contactPhone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#6E6E73] w-3.5 text-center">@</span>
                  <p className="text-[12px] text-[#424245]">{selected.contactEmail}</p>
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

            <div className="px-6 py-4 border-t border-black/5 flex gap-3 justify-end sticky bottom-0 bg-white">
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
                    등록 승인
                  </button>
                </>
              )}
              {selected.status === "rejected" && (
                <button
                  onClick={() => handleReApprove(selected.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-[13px] font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> 승인으로 변경
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#1D1D1F]">신청 내역 삭제</h3>
                <p className="text-[13px] text-[#6E6E73] mt-0.5">이 작업은 되돌릴 수 없습니다.</p>
              </div>
            </div>
            <p className="text-[13px] text-[#424245] mb-6 leading-relaxed">
              선택한 등록 신청 내역을 영구적으로 삭제합니다.<br />
              삭제 후 복구가 불가능합니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-black/10 text-[13px] font-semibold text-[#424245] hover:bg-[#F5F5F7] transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
