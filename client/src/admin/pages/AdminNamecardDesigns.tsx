/**
 * 관리자용 기존 명함 디자인 승인 워크플로우
 * - 업로드된 디자인 목록 조회
 * - 승인 / 거절 처리
 * - 이미지 미리보기
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
  ImageIcon,
} from "lucide-react";

type Status = "all" | "pending" | "approved" | "rejected";

export default function AdminNamecardDesigns() {
  const [filter, setFilter] = useState<Status>("all");
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: designs = [], isLoading, refetch } = trpc.namecardDesigns.list.useQuery();

  const approveMutation = trpc.namecardDesigns.approve.useMutation({
    onSuccess: () => { toast.success("승인되었습니다."); refetch(); },
    onError: (e) => toast.error("오류", { description: e.message }),
  });

  const rejectMutation = trpc.namecardDesigns.reject.useMutation({
    onSuccess: () => { toast.success("거절 처리되었습니다."); setRejectId(null); setRejectReason(""); refetch(); },
    onError: (e) => toast.error("오류", { description: e.message }),
  });

  const deleteMutation = trpc.namecardDesigns.delete.useMutation({
    onSuccess: () => { toast.success("삭제되었습니다."); refetch(); },
    onError: (e) => toast.error("오류", { description: e.message }),
  });

  const filtered = designs.filter(d => filter === "all" || d.status === filter);
  const pendingCount = designs.filter(d => d.status === "pending").length;

  const statusBadge = (status: string) => {
    if (status === "approved") return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
        <CheckCircle className="w-3 h-3" /> 승인
      </span>
    );
    if (status === "pending") return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
        <Clock className="w-3 h-3" /> 검토중
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold">
        <XCircle className="w-3 h-3" /> 거절
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-[#1d1d1f]">기존 명함 디자인 관리</h2>
          <p className="text-[12px] text-[#86868b] mt-0.5">보건소 담당자가 업로드한 기존 명함 디자인을 검토하고 승인합니다.</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-[12px] text-[#86868b] hover:text-[#1d1d1f]">
          <RefreshCw className="w-3.5 h-3.5" /> 새로고침
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { key: "all", label: "전체", count: designs.length, color: "#1d1d1f" },
          { key: "pending", label: "검토 대기", count: pendingCount, color: "#f59e0b" },
          { key: "approved", label: "승인됨", count: designs.filter(d => d.status === "approved").length, color: "#00A39B" },
          { key: "rejected", label: "거절됨", count: designs.filter(d => d.status === "rejected").length, color: "#ef4444" },
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key as Status)}
            className={`bg-white rounded-xl p-4 text-left border transition-all ${filter === stat.key ? "border-[#00A39B] shadow-sm" : "border-[#e5e5e5] hover:border-[#c7c7cc]"}`}
          >
            <p className="text-[11px] text-[#86868b] mb-1">{stat.label}</p>
            <p className="text-[22px] font-bold" style={{ color: stat.color }}>{stat.count}</p>
          </button>
        ))}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-5 h-5 animate-spin text-[#00A39B]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] flex flex-col items-center justify-center py-16">
          <ImageIcon className="w-10 h-10 text-[#c7c7cc] mb-3" />
          <p className="text-[14px] text-[#86868b]">해당하는 디자인이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(design => (
            <div key={design.id} className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
              <div className="flex items-start gap-4">
                {/* 썸네일 */}
                <div className="flex gap-2 shrink-0">
                  {design.frontImageUrl ? (
                    <img
                      src={design.frontImageUrl}
                      alt="앞면"
                      className="w-[100px] h-[70px] object-cover rounded-lg border border-[#e5e5e5] cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setPreviewItem(design)}
                    />
                  ) : (
                    <div className="w-[100px] h-[70px] rounded-lg border border-dashed border-[#e5e5e5] bg-[#f5f5f7] flex items-center justify-center">
                      <p className="text-[10px] text-[#c7c7cc]">앞면 없음</p>
                    </div>
                  )}
                  {design.backImageUrl ? (
                    <img
                      src={design.backImageUrl}
                      alt="뒷면"
                      className="w-[100px] h-[70px] object-cover rounded-lg border border-[#e5e5e5] cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setPreviewItem(design)}
                    />
                  ) : (
                    <div className="w-[100px] h-[70px] rounded-lg border border-dashed border-[#e5e5e5] bg-[#f5f5f7] flex items-center justify-center">
                      <p className="text-[10px] text-[#c7c7cc]">뒷면 없음</p>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(design.status)}
                    <span className="text-[13px] font-bold text-[#1d1d1f]">{design.centerName}</span>
                    <span className="text-[12px] text-[#86868b]">· {design.deptName} · 코드: {design.deptCode}</span>
                  </div>
                  {design.uploadedBy && (
                    <p className="text-[11px] text-[#86868b] mb-1">담당자: {design.uploadedBy}</p>
                  )}
                  {design.description && (
                    <p className="text-[12px] text-[#424245] bg-[#f5f5f7] rounded-lg px-3 py-1.5 mt-1 mb-2">{design.description}</p>
                  )}
                  {design.status === "rejected" && design.rejectReason && (
                    <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-3 py-1.5 mt-1">거절 사유: {design.rejectReason}</p>
                  )}
                  <p className="text-[10px] text-[#c7c7cc] mt-1">
                    업로드: {new Date(design.createdAt).toLocaleString("ko-KR")}
                    {design.approvedAt && ` · 승인: ${new Date(design.approvedAt).toLocaleString("ko-KR")}`}
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewItem(design)}
                    className="p-2 rounded-lg text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] transition-colors"
                    title="크게 보기"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {design.status !== "approved" && (
                    <Button
                      size="sm"
                      className="bg-[#00A39B] hover:bg-[#008f88] text-white text-[12px] h-8 px-3"
                      onClick={() => approveMutation.mutate({ id: design.id })}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> 승인
                    </Button>
                  )}
                  {design.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 text-[12px] h-8 px-3"
                      onClick={() => { setRejectId(design.id); setRejectReason(""); }}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> 거절
                    </Button>
                  )}
                  <button
                    onClick={() => { if (confirm("삭제하시겠습니까?")) deleteMutation.mutate({ id: design.id }); }}
                    className="p-2 rounded-lg text-[#c7c7cc] hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 거절 사유 입력 인라인 */}
              {rejectId === design.id && (
                <div className="mt-4 pt-4 border-t border-[#f5f5f7]">
                  <p className="text-[12px] font-semibold text-[#1d1d1f] mb-2">거절 사유 입력</p>
                  <Textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="거절 사유를 입력해 주세요 (선택)"
                    className="text-[13px] resize-none mb-3"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white text-[12px] h-8 px-4"
                      onClick={() => rejectMutation.mutate({ id: design.id, rejectReason })}
                      disabled={rejectMutation.isPending}
                    >
                      거절 확정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[12px] h-8 px-4"
                      onClick={() => { setRejectId(null); setRejectReason(""); }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 이미지 미리보기 모달 */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-[800px] w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f]">{previewItem.centerName} · {previewItem.deptName}</h3>
                <p className="text-[12px] text-[#86868b]">코드: {previewItem.deptCode} {previewItem.uploadedBy && `· 담당자: ${previewItem.uploadedBy}`}</p>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-[#86868b] hover:text-[#1d1d1f] text-[20px] leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {previewItem.frontImageUrl ? (
                <div>
                  <p className="text-[11px] font-semibold text-[#86868b] mb-2">앞면</p>
                  <img src={previewItem.frontImageUrl} alt="앞면" className="w-full object-contain rounded-xl border border-[#e5e5e5] max-h-[300px]" />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-[#f5f5f7] flex items-center justify-center h-[200px]">
                  <p className="text-[12px] text-[#86868b]">앞면 이미지 없음</p>
                </div>
              )}
              {previewItem.backImageUrl ? (
                <div>
                  <p className="text-[11px] font-semibold text-[#86868b] mb-2">뒷면</p>
                  <img src={previewItem.backImageUrl} alt="뒷면" className="w-full object-contain rounded-xl border border-[#e5e5e5] max-h-[300px]" />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-[#f5f5f7] flex items-center justify-center h-[200px]">
                  <p className="text-[12px] text-[#86868b]">뒷면 이미지 없음</p>
                </div>
              )}
            </div>
            {previewItem.description && (
              <p className="text-[13px] text-[#424245] bg-[#f5f5f7] rounded-xl px-4 py-3 mt-4">{previewItem.description}</p>
            )}
            <div className="flex gap-2 mt-4 justify-end">
              {previewItem.status !== "approved" && (
                <Button
                  className="bg-[#00A39B] hover:bg-[#008f88] text-white text-[13px]"
                  onClick={() => { approveMutation.mutate({ id: previewItem.id }); setPreviewItem(null); }}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" /> 승인
                </Button>
              )}
              {previewItem.status !== "rejected" && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 text-[13px]"
                  onClick={() => { setPreviewItem(null); setRejectId(previewItem.id); setRejectReason(""); }}
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> 거절
                </Button>
              )}
              <Button variant="outline" className="text-[13px]" onClick={() => setPreviewItem(null)}>닫기</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
