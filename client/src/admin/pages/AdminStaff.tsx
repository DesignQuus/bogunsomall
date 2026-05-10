/*
 * AdminStaff — 담당자 관리 스프레드시트 뷰
 *
 * 기능:
 * 1. 전국 보건소 + 담당자 통합 테이블 (엑셀 스타일)
 * 2. CSV/엑셀 업로드로 담당자 일괄 등록
 * 3. CSV 다운로드 (전체 / 필터된 데이터)
 * 4. 인라인 편집 (이름, 직책, 연락처)
 * 5. 시도 / 기관 / 부서 / 상태 필터
 * 6. 담당자 개별 추가 모달
 *
 * 나중에 관리자 페이지 확장 시: 이 파일만 유지하고 기능 추가
 */

import { useState, useRef, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import AdminLayout from "@/admin/components/AdminLayout";
import { useStaff, parseCSVToStaffRows, type Staff } from "@/contexts/StaffContext";
import { useCenters } from "@/contexts/CenterContext";
import {
  Users, Upload, Download, Plus, Search, X, ChevronDown,
  Edit2, Trash2, Save, XCircle, Filter, FileSpreadsheet,
  CheckCircle2, AlertCircle, Building2, RefreshCw, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const REGIONS = [
  "서울특별시", "인천광역시", "경기도", "부산광역시", "대구광역시",
  "광주광역시", "대전광역시", "울산광역시", "세종특별자치시", "강원도",
  "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도",
];

const ROLES = ["담당자", "주무관", "계장", "팀장", "과장", "기타"];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active:   { label: "활성", cls: "bg-green-50 text-green-700 border-green-200" },
  inactive: { label: "비활성", cls: "bg-gray-50 text-gray-500 border-gray-200" },
};

// ─── CSV 다운로드 유틸 ────────────────────────────────────────────────────────

function downloadCSV(rows: Record<string, string>[], filename: string) {
  if (rows.length === 0) { toast.error("다운로드할 데이터가 없습니다."); return; }
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => `"${(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// 엑셀 업로드 템플릿 다운로드 (xlsx 형식)
function downloadTemplate() {
  const headers = ["기관코드", "부서명", "이름", "직책", "일반전화", "휴대폰", "이메일", "메모"];
  const sampleRows = [
    ["SEO-001", "건강증진과", "홍길동", "담당자", "02-1234-5678", "010-1234-5678", "hong@example.go.kr", ""],
    ["PUS-001", "감염병관리과", "김영희", "팀장", "051-9876-5432", "", "", "신규 담당자"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  // 열 너비 설정
  ws["!cols"] = [12, 16, 10, 10, 16, 16, 24, 20].map(w => ({ wch: w }));
  // 헤더 스타일 (배경색)
  headers.forEach((_, i) => {
    const cell = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!ws[cell]) return;
    ws[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: "00A39B" }, patternType: "solid" }, alignment: { horizontal: "center" } };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "담당자 업로드");
  XLSX.writeFile(wb, "담당자_업로드_템플릿.xlsx");
  toast.success("템플릿 파일(.xlsx)이 다운로드됩니다. 작성 후 CSV 업로드를 이용해 주세요.");
}

// ─── 인라인 편집 셀 ──────────────────────────────────────────────────────────

function EditableCell({
  value, onSave, type = "text", options,
}: {
  value: string;
  onSave: (v: string) => void;
  type?: "text" | "select" | "tel";
  options?: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLSelectElement>(null);

  const commit = () => { onSave(val); setEditing(false); };
  const cancel = () => { setVal(value); setEditing(false); };

  if (!editing) {
    return (
      <span
        className="group flex items-center gap-1 cursor-pointer hover:text-[#00A39B] transition-colors"
        onClick={() => { setVal(value); setEditing(true); setTimeout(() => ref.current?.focus(), 30); }}
      >
        {value || <span className="text-[#c7c7cc] italic">미입력</span>}
        <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 shrink-0" />
      </span>
    );
  }

  if (type === "select" && options) {
    return (
      <select
        ref={ref as React.RefObject<HTMLSelectElement>}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        className="text-[12px] border border-[#00A39B] rounded px-1.5 py-0.5 bg-white focus:outline-none"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
        className="text-[12px] border border-[#00A39B] rounded px-1.5 py-0.5 w-28 focus:outline-none bg-white"
      />
      <button onClick={commit} className="text-green-600 hover:text-green-700"><Save className="w-3 h-3" /></button>
      <button onClick={cancel} className="text-gray-400 hover:text-gray-600"><XCircle className="w-3 h-3" /></button>
    </div>
  );
}

// ─── 담당자 추가 모달 ─────────────────────────────────────────────────────────

function AddStaffModal({ onClose }: { onClose: () => void }) {
  const { addStaff } = useStaff();
  const { centers } = useCenters();
  const [form, setForm] = useState({
    centerCode: "", deptName: "", name: "", role: "담당자", phone: "", mobile: "", email: "", memo: "",
  });
  const [error, setError] = useState("");

  const selectedCenter = centers.find(c => c.code === form.centerCode);
  const depts = selectedCenter?.departments.filter(d => d.status === "active") || [];

  const handleSubmit = () => {
    if (!form.centerCode || !form.name) { setError("기관코드와 이름은 필수입니다."); return; }
    if (!selectedCenter) { setError("등록되지 않은 기관코드입니다."); return; }
    const dept = depts.find(d => d.name === form.deptName) || depts[0];
    addStaff({
      name: form.name,
      centerId: selectedCenter.id,
      centerCode: selectedCenter.code,
      centerName: selectedCenter.name,
      region: selectedCenter.region,
      departmentId: dept?.id || "",
      deptName: form.deptName || dept?.name || "미지정",
      role: form.role,
      phone: form.phone,
      mobile: form.mobile || "",
      email: form.email,
      status: "active",
      memo: form.memo,
    });
    toast.success(`${form.name} 담당자가 등록되었습니다.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00A39B]" />
            <h2 className="text-[16px] font-semibold text-[#1d1d1f]">담당자 개별 추가</h2>
          </div>
          <button onClick={onClose} className="text-[#86868b] hover:text-[#1d1d1f]"><X className="w-4 h-4" /></button>
        </div>

        {/* 폼 */}
        <div className="px-6 py-5 space-y-4">
          {/* 기관코드 */}
          <div>
            <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">기관코드 <span className="text-red-500">*</span></label>
            <input
              value={form.centerCode}
              onChange={e => setForm(f => ({ ...f, centerCode: e.target.value.toUpperCase(), deptName: "" }))}
              placeholder="예: SEO-001"
              className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B] font-code"
            />
            {selectedCenter && (
              <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />{selectedCenter.name} ({selectedCenter.region})
              </p>
            )}
          </div>

          {/* 부서 */}
          <div>
            <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">부서</label>
            {depts.length > 0 ? (
              <select
                value={form.deptName}
                onChange={e => setForm(f => ({ ...f, deptName: e.target.value }))}
                className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B]"
              >
                <option value="">부서 선택</option>
                {depts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            ) : (
              <input
                value={form.deptName}
                onChange={e => setForm(f => ({ ...f, deptName: e.target.value }))}
                placeholder="부서명 직접 입력"
                className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B]"
              />
            )}
          </div>

          {/* 이름 + 직책 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">이름 <span className="text-red-500">*</span></label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="홍길동"
                className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B]"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">직책</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B]"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* 일반전화 + 휴대폰 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">일반전화</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="02-1234-5678"
                className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B] font-numeric"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">휴대폰</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                placeholder="010-1234-5678"
                className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B] font-numeric"
              />
            </div>
          </div>

          {/* 이메일 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="hong@go.kr"
                className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B]"
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5 block">메모</label>
            <input
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
              placeholder="관리자 메모 (선택)"
              className="w-full px-3 py-2.5 text-[13px] bg-[#f5f5f7] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#00A39B]"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#d1d1d6] text-[13px] font-medium text-[#86868b] hover:bg-[#f5f5f7] transition-colors">
            취소
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-[#00A39B] text-white text-[13px] font-semibold hover:bg-[#0055AA] transition-colors">
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 엑셀 업로드 모달 ─────────────────────────────────────────────────────────

function UploadModal({ onClose }: { onClose: () => void }) {
  const { importFromRows } = useStaff();
  const { centers } = useCenters();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ReturnType<typeof parseCSVToStaffRows>>([]);
  const [result, setResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Center 맵 생성
  const centerMap = useMemo(() => {
    const map: Record<string, { id: string; name: string; region: string; departments: { id: string; name: string }[] }> = {};
    centers.forEach(c => {
      map[c.code] = { id: c.id, name: c.name, region: c.region, departments: c.departments };
    });
    return map;
  }, [centers]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSVToStaffRows(text);
      setPreview(rows.slice(0, 10)); // 미리보기 최대 10행
    };
    reader.readAsText(f, "UTF-8");
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".txt"))) handleFile(f);
    else toast.error("CSV 파일만 업로드 가능합니다.");
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSVToStaffRows(text);
      const res = importFromRows(rows, centerMap);
      setResult(res);
      setLoading(false);
      if (res.added > 0) toast.success(`${res.added}명 담당자가 등록되었습니다.`);
    };
    reader.readAsText(file, "UTF-8");
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#00A39B]" />
            <h2 className="text-[16px] font-semibold text-[#1d1d1f]">CSV 일괄 업로드</h2>
          </div>
          <button onClick={onClose} className="text-[#86868b] hover:text-[#1d1d1f]"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 템플릿 안내 */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <AlertCircle className="w-4 h-4 text-[#00A39B] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-[#00A39B] mb-1">업로드 형식 안내</p>
              <p className="text-[12px] text-[#424245] leading-relaxed">
                CSV 파일의 열 순서: <span className="font-code font-semibold">기관코드, 부서명, 이름, 직책, 연락처, 이메일, 메모</span><br />
                첫 번째 행은 헤더로 자동 인식됩니다. 기관코드와 이름은 필수입니다.
              </p>
              <button
                onClick={downloadTemplate}
                className="mt-2 text-[12px] font-semibold text-[#00A39B] hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> 템플릿 파일 다운로드
              </button>
            </div>
          </div>

          {/* 드래그 앤 드롭 영역 */}
          {!result && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-[#d1d1d6] rounded-2xl p-8 text-center cursor-pointer hover:border-[#00A39B] hover:bg-blue-50/30 transition-all"
            >
              <Upload className="w-8 h-8 text-[#c7c7cc] mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-[#1d1d1f] mb-1">
                {file ? file.name : "CSV 파일을 드래그하거나 클릭하여 선택"}
              </p>
              <p className="text-[12px] text-[#86868b]">.csv 파일 (UTF-8 인코딩 권장)</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* 미리보기 */}
          {preview.length > 0 && !result && (
            <div>
              <p className="text-[12px] font-semibold text-[#1d1d1f] mb-2">미리보기 (최대 10행)</p>
              <div className="overflow-x-auto rounded-xl border border-black/5">
                <table className="w-full text-[11px]">
                  <thead className="bg-[#f5f5f7]">
                    <tr>
                      {["기관코드", "부서명", "이름", "직책", "연락처", "이메일"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-[#1d1d1f] whitespace-nowrap">{h}</th>
                      ))}
                      <th className="px-3 py-2 text-left font-semibold text-[#1d1d1f]">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className={`border-t border-black/5 ${row._error ? "bg-red-50" : ""}`}>
                        <td className="px-3 py-2 font-code text-[#00A39B]">{row.centerCode}</td>
                        <td className="px-3 py-2 text-[#424245]">{row.deptName}</td>
                        <td className="px-3 py-2 font-semibold text-[#1d1d1f]">{row.name}</td>
                        <td className="px-3 py-2 text-[#424245]">{row.role}</td>
                        <td className="px-3 py-2 font-numeric text-[#424245]">{row.phone}</td>
                        <td className="px-3 py-2 text-[#424245]">{row.email}</td>
                        <td className="px-3 py-2">
                          {row._error
                            ? <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />오류</span>
                            : <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />정상</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 업로드 결과 */}
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <p className="text-[24px] font-bold font-numeric text-green-600">{result.added}</p>
                  <p className="text-[11px] text-green-700 mt-0.5">등록 완료</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                  <p className="text-[24px] font-bold font-numeric text-amber-600">{result.skipped}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">스킵 (중복/오류)</p>
                </div>
                <div className="p-4 bg-[#f5f5f7] rounded-xl border border-black/5 text-center">
                  <p className="text-[24px] font-bold font-numeric text-[#1d1d1f]">{result.added + result.skipped}</p>
                  <p className="text-[11px] text-[#86868b] mt-0.5">전체 행</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 max-h-32 overflow-y-auto">
                  <p className="text-[11px] font-semibold text-red-600 mb-1.5">오류 내역</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-[11px] text-red-500 leading-relaxed">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 px-6 pb-5 sticky bottom-0 bg-white pt-3 border-t border-black/5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#d1d1d6] text-[13px] font-medium text-[#86868b] hover:bg-[#f5f5f7] transition-colors">
            {result ? "닫기" : "취소"}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="flex-1 py-2.5 rounded-xl bg-[#00A39B] text-white text-[13px] font-semibold hover:bg-[#0055AA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {loading ? "처리 중..." : "업로드 실행"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function AdminStaff() {
  const { staffList, updateStaff, deleteStaff, exportToRows, totalCount, activeCount } = useStaff();
  const { centers } = useCenters();

  // 필터 상태
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("전체");
  const [filterStatus, setFilterStatus] = useState<"전체" | "active" | "inactive">("전체");
  const [filterDept, setFilterDept] = useState("전체");

  // 모달 상태
  const [showAdd, setShowAdd] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // 보기 모드: 담당자 목록 | 보건소별 현황
  const [viewMode, setViewMode] = useState<"staff" | "center">("staff");

  // 선택된 행 (일괄 삭제용)
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── 필터링 ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return staffList.filter(s => {
      if (filterRegion !== "전체" && s.region !== filterRegion) return false;
      if (filterStatus !== "전체" && s.status !== filterStatus) return false;
      if (filterDept !== "전체" && s.deptName !== filterDept) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.name.includes(search) || s.code.toLowerCase().includes(q)
          || s.centerName.includes(search) || s.centerCode.toLowerCase().includes(q)
          || s.phone.includes(search);
      }
      return true;
    });
  }, [staffList, filterRegion, filterStatus, filterDept, search]);

  // 부서 목록 (필터용)
  const allDepts = useMemo(() => {
    const set = new Set(staffList.map(s => s.deptName));
    return ["전체", ...Array.from(set).sort()];
  }, [staffList]);

  // ── 보건소별 현황 데이터 ────────────────────────────────────────────────────
  const centerStats = useMemo(() => {
    return centers.map(c => {
      const staff = staffList.filter(s => s.centerId === c.id);
      return {
        ...c,
        staffCount: staff.length,
        activeStaff: staff.filter(s => s.status === "active").length,
        deptCount: c.departments.filter(d => d.status === "active").length,
      };
    }).filter(c => filterRegion === "전체" || c.region === filterRegion);
  }, [centers, staffList, filterRegion]);

  // ── 전체 선택 ───────────────────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(s => s.id)));
  };
  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`선택한 ${selected.size}명의 담당자를 삭제하시겠습니까?`)) return;
    selected.forEach(id => deleteStaff(id));
    setSelected(new Set());
    toast.success(`${selected.size}명 삭제 완료`);
  };

  const handleExport = () => {
    const allRows = exportToRows();
    // filtered 아이디 세트로 필터링
    const filteredIds = new Set(filtered.map(s => s.id));
    const exportRows = filtered.length < staffList.length
      ? allRows.filter((_, i) => filteredIds.has(staffList[i]?.id))
      : allRows;
    if (exportRows.length === 0) { toast.error("다운로드할 데이터가 없습니다."); return; }
    const ws = XLSX.utils.json_to_sheet(exportRows);
    // 열 너비 자동 설정
    const cols = Object.keys(exportRows[0]);
    ws["!cols"] = cols.map(k => ({ wch: Math.max(k.length + 2, 14) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "담당자 목록");
    XLSX.writeFile(wb, `담당자_목록_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success(`${exportRows.length}건 다운로드 완료 (.xlsx)`);
  };

  return (
    <AdminLayout>
      {/* 모달 */}
      {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight">담당자 관리</h1>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            전국 보건소 담당자 등록 · 조회 · 엑셀 업로드/다운로드
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#d1d1d6] text-[12px] font-medium text-[#424245] hover:bg-[#f5f5f7] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> 템플릿
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#00A39B] text-[12px] font-semibold text-[#00A39B] hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> CSV 업로드
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00A39B] text-white text-[12px] font-semibold hover:bg-[#0055AA] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> 담당자 추가
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "전체 담당자", value: totalCount, icon: Users, color: "#00A39B", bg: "#EBF4FF" },
          { label: "활성 담당자", value: activeCount, icon: CheckCircle2, color: "#34C759", bg: "#E8FAF0" },
          { label: "등록 보건소", value: centers.filter(c => c.status === "active").length, icon: Building2, color: "#FF9500", bg: "#FFF4E5" },
          { label: "담당자 없는 기관", value: centers.filter(c => !staffList.some(s => s.centerId === c.id)).length, icon: AlertCircle, color: "#FF3B30", bg: "#FFF0EF" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] text-[#6E6E73] font-medium">{label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
            </div>
            <p className="text-[26px] font-bold font-numeric text-[#1D1D1F]">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 뷰 모드 탭 */}
      <div className="flex items-center gap-1 mb-4 bg-[#f5f5f7] rounded-xl p-1 w-fit">
        {[
          { key: "staff", label: "담당자 목록", icon: Users },
          { key: "center", label: "보건소별 현황", icon: Building2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as "staff" | "center")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              viewMode === key ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* 필터 바 */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {/* 검색 */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b] pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름, 코드, 기관명, 연락처 검색..."
            className="w-full pl-9 pr-3 py-2 text-[12px] bg-white border border-[#d1d1d6] rounded-xl focus:outline-none focus:border-[#00A39B] focus:ring-2 focus:ring-[#00A39B]/10"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b]"><X className="w-3 h-3" /></button>}
        </div>

        {/* 시도 필터 */}
        <select
          value={filterRegion}
          onChange={e => setFilterRegion(e.target.value)}
          className="px-4 py-2 text-[13px] bg-white border border-[#d1d1d6] rounded-xl focus:outline-none focus:border-[#00A39B] min-w-[110px]"
        >
          <option value="전체">전체 시도</option>
          {REGIONS.map(r => <option key={r} value={r}>{r.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, "")}</option>)}
        </select>

        {/* 상태 필터 */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as "전체" | "active" | "inactive")}
          className="px-4 py-2 text-[13px] bg-white border border-[#d1d1d6] rounded-xl focus:outline-none focus:border-[#00A39B] min-w-[110px]"
        >
          <option value="전체">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>

        {/* 부서 필터 */}
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="px-4 py-2 text-[13px] bg-white border border-[#d1d1d6] rounded-xl focus:outline-none focus:border-[#00A39B] min-w-[120px]"
        >
          {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> {selected.size}명 삭제
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#d1d1d6] text-[12px] font-medium text-[#424245] hover:bg-[#f5f5f7] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> 엑셀 내보내기
          </button>
          <span className="text-[12px] text-[#86868b] font-numeric">{filtered.length.toLocaleString()}건</span>
        </div>
      </div>

      {/* ── 담당자 목록 테이블 ─────────────────────────────────────────────── */}
      {viewMode === "staff" && (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-max w-full text-[12px]">
              <thead className="bg-[#f5f5f7] border-b border-black/5">
                <tr>
                  <th className="px-4 py-3 text-left w-8">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f] whitespace-nowrap">담당자코드</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">이름</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">직책</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f] whitespace-nowrap">기관코드</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">기관명</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">시도</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">부서</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f] whitespace-nowrap">일반전화</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f] whitespace-nowrap">휴대폰</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f] whitespace-nowrap">이메일</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">상태</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">등록일</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f] w-16">작업</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-16 text-center">
                      <Users className="w-8 h-8 text-[#c7c7cc] mx-auto mb-3" />
                      <p className="text-[13px] font-semibold text-[#86868b]">
                        {search || filterRegion !== "전체" ? "검색 결과가 없습니다" : "등록된 담당자가 없습니다"}
                      </p>
                      <p className="text-[12px] text-[#c7c7cc] mt-1">
                        CSV 업로드 또는 개별 추가로 담당자를 등록하세요
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-t border-black/[0.04] transition-colors ${
                        selected.has(s.id) ? "bg-blue-50/40" : idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                      } hover:bg-blue-50/20`}
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-code text-[11px] font-semibold text-[#00A39B] bg-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                          {s.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1d1d1f]">
                        <EditableCell value={s.name} onSave={v => updateStaff(s.id, { name: v })} />
                      </td>
                      <td className="px-4 py-3 text-[#424245]">
                        <EditableCell value={s.role} onSave={v => updateStaff(s.id, { role: v })} type="select" options={ROLES} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-code text-[11px] text-[#86868b]">{s.centerCode}</span>
                      </td>
                      <td className="px-4 py-3 text-[#1d1d1f] max-w-[140px] truncate">{s.centerName}</td>
                      <td className="px-4 py-3 text-[#86868b] whitespace-nowrap">
                        {s.region.replace(/(특별시|광역시|특별자치시|특별자치도)/, "")}
                      </td>
                      <td className="px-4 py-3 text-[#424245] max-w-[100px] truncate">{s.deptName}</td>
                      <td className="px-4 py-3 font-numeric text-[#424245]">
                        <EditableCell value={s.phone} onSave={v => updateStaff(s.id, { phone: v })} type="tel" />
                      </td>
                      <td className="px-4 py-3 font-numeric text-[#424245]">
                        <EditableCell value={s.mobile || ""} onSave={v => updateStaff(s.id, { mobile: v })} type="tel" />
                      </td>
                      <td className="px-4 py-3 text-[#424245] max-w-[160px] truncate">
                        <EditableCell value={s.email || ""} onSave={v => updateStaff(s.id, { email: v })} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => updateStaff(s.id, { status: s.status === "active" ? "inactive" : "active" })}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${STATUS_BADGE[s.status].cls}`}
                        >
                          {STATUS_BADGE[s.status].label}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-numeric text-[#86868b] whitespace-nowrap">{s.createdAt}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { if (confirm(`${s.name} 담당자를 삭제하시겠습니까?`)) { deleteStaff(s.id); toast.success("삭제되었습니다."); } }}
                          className="text-[#c7c7cc] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 보건소별 현황 테이블 ───────────────────────────────────────────── */}
      {viewMode === "center" && (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f5f5f7] border-b border-black/5">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f] whitespace-nowrap">기관코드</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">기관명</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">시도</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#1d1d1f]">부서 수</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#1d1d1f]">담당자 수</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#1d1d1f]">활성</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">기관 상태</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1d1d1f]">코드 상태</th>
                </tr>
              </thead>
              <tbody>
                {centerStats.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`border-t border-black/[0.04] ${idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"} hover:bg-blue-50/20 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-code text-[11px] font-semibold text-[#00A39B] bg-blue-50 px-2 py-0.5 rounded-md">{c.code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1d1d1f]">{c.name}</td>
                    <td className="px-4 py-3 text-[#86868b] whitespace-nowrap">
                      {c.region.replace(/(특별시|광역시|특별자치시|특별자치도)/, "")}
                    </td>
                    <td className="px-4 py-3 text-center font-numeric text-[#424245]">{c.deptCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-numeric font-bold ${c.staffCount === 0 ? "text-red-400" : "text-[#1d1d1f]"}`}>
                        {c.staffCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-numeric text-green-600">{c.activeStaff}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        {c.status === "active" ? "운영중" : "비활성"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.codeStatus === "active" ? "bg-blue-50 text-blue-700 border-blue-200"
                        : c.codeStatus === "expired" ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "bg-red-50 text-red-600 border-red-200"
                      }`}>
                        {c.codeStatus === "active" ? "활성" : c.codeStatus === "expired" ? "만료" : "정지"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-black/5 bg-[#f5f5f7] flex items-center justify-between">
            <p className="text-[11px] text-[#86868b]">
              총 <span className="font-numeric font-semibold text-[#1d1d1f]">{centerStats.length}</span>개 기관
              · 담당자 없는 기관: <span className="font-numeric font-semibold text-red-500">{centerStats.filter(c => c.staffCount === 0).length}</span>개
            </p>
            <button
              onClick={() => {
                const rows = centerStats.map(c => ({
                  기관코드: c.code, 기관명: c.name, 시도: c.region,
                  부서수: String(c.deptCount), 담당자수: String(c.staffCount),
                  활성담당자: String(c.activeStaff), 기관상태: c.status, 코드상태: c.codeStatus,
                }));
                downloadCSV(rows, `보건소_현황_${new Date().toISOString().split("T")[0]}.csv`);
              }}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00A39B] hover:underline"
            >
              <Download className="w-3 h-3" /> 현황 다운로드
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
