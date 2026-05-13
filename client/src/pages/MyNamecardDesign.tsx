"use client";

/*
 * 기존 명함 디자인 확인 & 업로드 페이지
 * - 담당자명 / 부서명 / 보건소명 이름 검색으로 기존 디자인 조회
 * - 기존 디자인 있으면 미리보기 + 주문 연결
 * - 기존 디자인 없으면 이미지 업로드 폼 제공
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import {
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  ImageIcon,
  FileImage,
  RefreshCw,
  ShoppingCart,
  Search,
  ChevronRight,
} from "lucide-react";

// 세션 스토리지에서 로그인 정보 읽기
function getLoginInfo() {
  try {
    const raw = sessionStorage.getItem("bogunso_login") || localStorage.getItem("bogunso_login");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

type DesignRow = {
  id: number;
  centerCode: string;
  centerName: string;
  deptCode: string;
  deptName: string;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
  description?: string | null;
  status: string;
  uploadedBy?: string | null;
  rejectReason?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function MyNamecardDesign() {
  const loginInfo = getLoginInfo();

  // 이름 검색 상태
  const [searchQuery, setSearchQuery] = useState(
    loginInfo?.managerName ?? loginInfo?.deptName ?? ""
  );
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<DesignRow | null>(null);

  // 업로드 폼 상태
  const [centerCode] = useState(loginInfo?.centerCode ?? "");
  const [centerName, setCenterName] = useState(loginInfo?.centerName ?? "");
  const [deptCode] = useState(loginInfo?.deptCode ?? loginInfo?.issuedCode ?? "");
  const [deptName, setDeptName] = useState(loginInfo?.deptName ?? "");
  const [uploadedBy, setUploadedBy] = useState(loginInfo?.managerName ?? "");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  // 이름 기반 검색
  const { data: searchResults = [], isLoading: isSearching, refetch } =
    trpc.namecardDesigns.searchByName.useQuery(
      { query: submittedQuery },
      { enabled: !!submittedQuery }
    );

  const createMutation = trpc.namecardDesigns.create.useMutation({
    onSuccess: () => {
      toast.success("업로드 완료", { description: "관리자 검토 후 승인되면 알림을 받으실 수 있습니다." });
      refetch();
      setShowUploadForm(false);
    },
    onError: (e) => toast.error("업로드 실패", { description: e.message }),
  });

  function handleSearch() {
    if (!searchQuery.trim()) {
      toast.error("검색어를 입력해 주세요.");
      return;
    }
    setSubmittedQuery(searchQuery.trim());
    setSelectedDesign(null);
    setShowUploadForm(false);
  }

  function handleFileChange(side: "front" | "back", file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (side === "front") { setFrontPreview(e.target?.result as string); setFrontFile(file); }
      else { setBackPreview(e.target?.result as string); setBackFile(file); }
    };
    reader.readAsDataURL(file);
  }

  async function uploadToS3(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-namecard", { method: "POST", body: formData });
    if (!res.ok) throw new Error("파일 업로드 실패");
    const json = await res.json();
    return json.url as string;
  }

  async function handleSubmit() {
    if (!frontFile && !backFile) {
      toast.error("앞면 또는 뒷면 이미지를 업로드해 주세요.");
      return;
    }
    setUploading(true);
    try {
      let frontUrl: string | undefined;
      let backUrl: string | undefined;
      if (frontFile) frontUrl = await uploadToS3(frontFile);
      if (backFile) backUrl = await uploadToS3(backFile);

      await createMutation.mutateAsync({
        centerCode,
        centerName,
        deptCode,
        deptName,
        frontImageUrl: frontUrl,
        backImageUrl: backUrl,
        description,
        uploadedBy,
      });
    } catch (e: any) {
      toast.error("오류", { description: e.message });
    } finally {
      setUploading(false);
    }
  }

  const statusBadge = (status: string) => {
    if (status === "approved") return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[12px] font-semibold">
        <CheckCircle className="w-3.5 h-3.5" /> 승인됨
      </span>
    );
    if (status === "pending") return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[12px] font-semibold">
        <Clock className="w-3.5 h-3.5" /> 검토 중
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[12px] font-semibold">
        <XCircle className="w-3.5 h-3.5" /> 거절됨
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/category/40">
            <button className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#e5e5e5] transition-colors">
              <ArrowLeft className="w-4 h-4 text-[#1d1d1f]" />
            </button>
          </Link>
          <div>
            <h1 className="text-[16px] font-bold text-[#1d1d1f]">기존 명함 디자인 확인</h1>
            <p className="text-[12px] text-[#86868b]">현재 사용 중인 명함 디자인으로 제작 신청</p>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 py-10">
        {/* 안내 배너 */}
        <div className="bg-[#00A39B]/8 border border-[#00A39B]/20 rounded-2xl px-6 py-5 mb-8">
          <h2 className="text-[15px] font-bold text-[#00A39B] mb-1">현재 사용 중인 명함 디자인으로 제작</h2>
          <p className="text-[13px] text-[#424245] leading-relaxed">
            담당자명, 부서명, 보건소명으로 검색하면 기존에 작업한 명함 디자인 이미지를 확인할 수 있습니다.<br />
            기존 디자인이 없는 경우, 현재 사용 중인 명함 이미지를 업로드하면 관리자 검토 후 등록됩니다.
          </p>
        </div>

        {/* 이름 검색 폼 */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 mb-6">
          <h3 className="text-[14px] font-bold text-[#1d1d1f] mb-4">이름으로 디자인 검색</h3>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="담당자명, 부서명, 보건소명 입력 (예: 김보건, 보건행정과)"
                className="text-[13px] pl-9"
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-[#00A39B] hover:bg-[#008f88] text-white text-[13px] px-6 shrink-0"
            >
              검색
            </Button>
          </div>
          <p className="text-[11px] text-[#86868b] mt-2">
            * 담당자명, 부서명, 보건소명 중 하나를 입력하면 관련 디자인을 모두 검색합니다.
          </p>
        </div>

        {/* 검색 결과 */}
        {submittedQuery && (
          <>
            {isSearching && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-10 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-[#00A39B] mx-auto mb-2" />
                <p className="text-[13px] text-[#86868b]">검색 중...</p>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && !selectedDesign && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 mb-6">
                <h3 className="text-[14px] font-bold text-[#1d1d1f] mb-1">
                  검색 결과 <span className="text-[#00A39B]">{searchResults.length}건</span>
                </h3>
                <p className="text-[12px] text-[#86868b] mb-4">확인할 디자인을 선택해 주세요.</p>
                <div className="divide-y divide-[#f5f5f7]">
                  {(searchResults as DesignRow[]).map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-[#f5f5f7] rounded-xl transition-colors text-left group"
                      onClick={() => setSelectedDesign(item)}
                    >
                      <div className="flex items-center gap-3">
                        {item.frontImageUrl ? (
                          <div className="w-14 h-10 rounded-lg overflow-hidden border border-[#e5e5e5] bg-[#f5f5f7] shrink-0">
                            <img src={item.frontImageUrl} alt="앞면" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-10 rounded-lg border border-dashed border-[#d2d2d7] bg-[#f5f5f7] flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-[#c7c7cc]" />
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-semibold text-[#1d1d1f]">
                            {item.centerName} · {item.deptName}
                          </p>
                          <p className="text-[11px] text-[#86868b]">
                            담당자: {item.uploadedBy ?? "-"} · 코드: {item.deptCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {statusBadge(item.status)}
                        <ChevronRight className="w-4 h-4 text-[#c7c7cc] group-hover:text-[#86868b]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 선택된 디자인 상세 */}
            {!isSearching && selectedDesign && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <button
                      className="w-7 h-7 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#e5e5e5] transition-colors"
                      onClick={() => setSelectedDesign(null)}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#1d1d1f]" />
                    </button>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#1d1d1f]">기존 명함 디자인</h3>
                      <p className="text-[12px] text-[#86868b] mt-0.5">
                        {selectedDesign.centerName} · {selectedDesign.deptName} · 담당자: {selectedDesign.uploadedBy ?? "-"}
                      </p>
                    </div>
                  </div>
                  {statusBadge(selectedDesign.status)}
                </div>

                {/* 이미지 미리보기 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {selectedDesign.frontImageUrl ? (
                    <div>
                      <p className="text-[11px] font-semibold text-[#86868b] mb-2">앞면</p>
                      <div className="rounded-xl overflow-hidden border border-[#e5e5e5] bg-[#f5f5f7]">
                        <img src={selectedDesign.frontImageUrl} alt="앞면" className="w-full object-contain max-h-[260px]" />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-[#f5f5f7] flex items-center justify-center h-[180px]">
                      <p className="text-[12px] text-[#86868b]">앞면 이미지 없음</p>
                    </div>
                  )}
                  {selectedDesign.backImageUrl ? (
                    <div>
                      <p className="text-[11px] font-semibold text-[#86868b] mb-2">뒷면</p>
                      <div className="rounded-xl overflow-hidden border border-[#e5e5e5] bg-[#f5f5f7]">
                        <img src={selectedDesign.backImageUrl} alt="뒷면" className="w-full object-contain max-h-[260px]" />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-[#f5f5f7] flex items-center justify-center h-[180px]">
                      <p className="text-[12px] text-[#86868b]">뒷면 이미지 없음</p>
                    </div>
                  )}
                </div>

                {selectedDesign.description && (
                  <p className="text-[13px] text-[#424245] bg-[#f5f5f7] rounded-xl px-4 py-3 mb-5">{selectedDesign.description}</p>
                )}

                {selectedDesign.status === "rejected" && selectedDesign.rejectReason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
                    <p className="text-[12px] text-red-700 font-semibold mb-0.5">거절 사유</p>
                    <p className="text-[13px] text-red-600">{selectedDesign.rejectReason}</p>
                  </div>
                )}

                <div className="flex gap-3 flex-wrap">
                  {selectedDesign.status === "approved" && (
                    <Link href="/category/40">
                      <Button className="bg-[#00A39B] hover:bg-[#008f88] text-white text-[13px] gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        이 디자인으로 주문하기
                      </Button>
                    </Link>
                  )}
                  {selectedDesign.status === "pending" && (
                    <p className="text-[13px] text-amber-700 bg-amber-50 px-4 py-2 rounded-xl">
                      관리자 검토 중입니다. 승인 후 주문이 가능합니다.
                    </p>
                  )}
                  {selectedDesign.status === "rejected" && (
                    <Button
                      variant="outline"
                      className="text-[13px] gap-2"
                      onClick={() => { setShowUploadForm(true); setSelectedDesign(null); }}
                    >
                      <Upload className="w-4 h-4" />
                      새 이미지로 재업로드
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* 검색 결과 없음 */}
            {!isSearching && searchResults.length === 0 && !selectedDesign && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-8 text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-[#c7c7cc]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">검색 결과가 없습니다</h3>
                <p className="text-[13px] text-[#86868b] mb-5">
                  "<span className="text-[#1d1d1f] font-medium">{submittedQuery}</span>"에 해당하는 기존 명함 디자인이 없습니다.
                </p>
                <Button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-[#00A39B] hover:bg-[#008f88] text-white text-[13px] gap-2"
                >
                  <Upload className="w-4 h-4" />
                  새 명함 디자인 업로드하기
                </Button>
              </div>
            )}
          </>
        )}

        {/* 업로드 폼 */}
        {showUploadForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#00A39B]/10 flex items-center justify-center">
                <FileImage className="w-5 h-5 text-[#00A39B]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f]">명함 디자인 업로드</h3>
                <p className="text-[12px] text-[#86868b]">현재 사용 중인 명함 이미지를 업로드해 주세요</p>
              </div>
            </div>

            {/* 보건소 & 부서 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">보건소명</label>
                <Input
                  value={centerName}
                  onChange={e => setCenterName(e.target.value)}
                  placeholder="예: 미추홀 보건소"
                  className="text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">부서명</label>
                <Input
                  value={deptName}
                  onChange={e => setDeptName(e.target.value)}
                  placeholder="예: 보건행정과"
                  className="text-[13px]"
                />
              </div>
            </div>

            {/* 업로드 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* 앞면 업로드 */}
              <div>
                <p className="text-[12px] font-semibold text-[#1d1d1f] mb-2">앞면 이미지</p>
                <div
                  className="border-2 border-dashed border-[#e5e5e5] rounded-xl bg-[#f5f5f7] flex flex-col items-center justify-center cursor-pointer hover:border-[#00A39B] hover:bg-[#00A39B]/4 transition-all"
                  style={{ minHeight: "200px" }}
                  onClick={() => frontRef.current?.click()}
                >
                  {frontPreview ? (
                    <img src={frontPreview} alt="앞면 미리보기" className="w-full max-h-[200px] object-contain rounded-xl" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-[#c7c7cc] mb-2" />
                      <p className="text-[12px] text-[#86868b]">클릭하여 앞면 이미지 선택</p>
                      <p className="text-[11px] text-[#c7c7cc] mt-1">JPG, PNG, PDF (최대 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={frontRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => handleFileChange("front", e.target.files?.[0] ?? null)}
                />
                {frontPreview && (
                  <button
                    className="text-[11px] text-[#86868b] mt-1 hover:text-red-500"
                    onClick={() => { setFrontPreview(null); setFrontFile(null); }}
                  >
                    삭제
                  </button>
                )}
              </div>

              {/* 뒷면 업로드 */}
              <div>
                <p className="text-[12px] font-semibold text-[#1d1d1f] mb-2">뒷면 이미지 <span className="text-[#86868b] font-normal">(선택)</span></p>
                <div
                  className="border-2 border-dashed border-[#e5e5e5] rounded-xl bg-[#f5f5f7] flex flex-col items-center justify-center cursor-pointer hover:border-[#00A39B] hover:bg-[#00A39B]/4 transition-all"
                  style={{ minHeight: "200px" }}
                  onClick={() => backRef.current?.click()}
                >
                  {backPreview ? (
                    <img src={backPreview} alt="뒷면 미리보기" className="w-full max-h-[200px] object-contain rounded-xl" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-[#c7c7cc] mb-2" />
                      <p className="text-[12px] text-[#86868b]">클릭하여 뒷면 이미지 선택</p>
                      <p className="text-[11px] text-[#c7c7cc] mt-1">JPG, PNG, PDF (최대 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={backRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => handleFileChange("back", e.target.files?.[0] ?? null)}
                />
                {backPreview && (
                  <button
                    className="text-[11px] text-[#86868b] mt-1 hover:text-red-500"
                    onClick={() => { setBackPreview(null); setBackFile(null); }}
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>

            {/* 담당자 & 메모 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">담당자 이름</label>
                <Input
                  value={uploadedBy}
                  onChange={e => setUploadedBy(e.target.value)}
                  placeholder="예: 김보건"
                  className="text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">특이사항 / 요청사항 <span className="text-[#86868b] font-normal">(선택)</span></label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="예: 색상 변경 없이 동일하게 제작 요청"
                  className="text-[13px] resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={uploading || (!frontFile && !backFile)}
                className="bg-[#00A39B] hover:bg-[#008f88] text-white text-[13px] gap-2 px-6"
              >
                {uploading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> 업로드 중...</>
                ) : (
                  <><Upload className="w-4 h-4" /> 디자인 업로드 & 검토 요청</>
                )}
              </Button>
              <Button
                variant="outline"
                className="text-[13px]"
                onClick={() => setShowUploadForm(false)}
              >
                취소
              </Button>
              <p className="text-[11px] text-[#86868b]">업로드 후 관리자 검토 → 승인 시 주문 가능</p>
            </div>
          </div>
        )}

        {/* 업로드 폼이 닫혀 있고 검색 결과도 없을 때 업로드 유도 버튼 */}
        {!showUploadForm && !submittedQuery && (
          <div className="text-center py-4">
            <p className="text-[13px] text-[#86868b] mb-3">기존 디자인이 없으신가요?</p>
            <Button
              variant="outline"
              className="text-[13px] gap-2 border-[#00A39B] text-[#00A39B] hover:bg-[#00A39B]/5"
              onClick={() => setShowUploadForm(true)}
            >
              <Upload className="w-4 h-4" />
              새 명함 디자인 업로드하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
