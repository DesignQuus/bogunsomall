/**
 * AdminCenters — 기관(보건소) 직접 등록 및 관리
 * - 기관 목록 조회, 신규 등록, 수정, 코드 재발급
 * - 부서 추가/삭제/승인
 */

import { useState } from "react";
import AdminLayout from "@/admin/components/AdminLayout";
import { useCenters, generateCode, type Center, type Department } from "@/contexts/CenterContext";
import {
  Building2, Plus, Search, ChevronDown, ChevronUp, Edit2, Trash2,
  Key, CheckCircle2, XCircle, Clock, MoreHorizontal, X, Save,
  MapPin, Phone, Mail, Users, RefreshCw, Shield
} from "lucide-react";
import { toast } from "sonner";

const REGIONS = [
  "서울특별시", "인천광역시", "경기도", "부산광역시", "대구광역시",
  "광주광역시", "대전광역시", "울산광역시", "세종특별자치시", "강원도",
  "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도",
];

const DEFAULT_DEPARTMENTS = ["건강증진팀", "방문보건팀", "감염병관리팀", "모자보건팀", "치매안심팀", "정신건강팀", "영양관리팀"];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active:    { label: "운영중",   cls: "bg-green-50 text-green-700 border-green-200" },
  inactive:  { label: "비활성",   cls: "bg-gray-50 text-gray-600 border-gray-200" },
  suspended: { label: "정지",     cls: "bg-red-50 text-red-600 border-red-200" },
};

type FormMode = "add" | "edit";

interface CenterForm {
  name: string;
  region: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  initialDepts: string[];
  codeExpiresAt: string;
}

const EMPTY_FORM: CenterForm = {
  name: "", region: "서울특별시", address: "",
  contactName: "", contactPhone: "", contactEmail: "",
  initialDepts: ["건강증진팀"],
  codeExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
};

export default function AdminCenters() {
  const { centers, addCenter, updateCenter, deleteCenter, addDepartment, updateDepartmentStatus, deleteDepartment } = useCenters();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CenterForm>(EMPTY_FORM);
  const [newDeptName, setNewDeptName] = useState<Record<string, string>>({});

  const filtered = centers.filter(c => {
    const matchSearch = !search || c.name.includes(search) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === "전체" || c.region === regionFilter;
    const matchStatus = statusFilter === "전체" || c.status === statusFilter;
    return matchSearch && matchRegion && matchStatus;
  });

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setFormMode("add");
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (center: Center) => {
    setForm({
      name: center.name, region: center.region, address: center.address,
      contactName: center.contactName, contactPhone: center.contactPhone,
      contactEmail: center.contactEmail,
      initialDepts: center.departments.map(d => d.name),
      codeExpiresAt: center.codeExpiresAt,
    });
    setFormMode("edit");
    setEditingId(center.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.address.trim() || !form.contactName.trim()) {
      toast.error("필수 항목을 모두 입력해 주세요.");
      return;
    }
    if (formMode === "add") {
      const code = generateCode(form.region, centers.map(c => c.code));
      const depts: Department[] = form.initialDepts
        .filter(n => n.trim())
        .map((name, i) => ({
          id: `d${Date.now()}${i}`,
          name,
          createdAt: new Date().toISOString().split("T")[0],
          status: "active" as const,
        }));
      addCenter({
        code, name: form.name, region: form.region, address: form.address,
        contactName: form.contactName, contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        departments: depts,
        status: "active",
        codeExpiresAt: form.codeExpiresAt,
      });
      toast.success(`${form.name} 등록 완료 · 코드: ${code}`);
    } else if (editingId) {
      updateCenter(editingId, {
        name: form.name, region: form.region, address: form.address,
        contactName: form.contactName, contactPhone: form.contactPhone,
        contactEmail: form.contactEmail, codeExpiresAt: form.codeExpiresAt,
      });
      toast.success("기관 정보가 수정되었습니다.");
    }
    setShowForm(false);
  };

  const handleDelete = (center: Center) => {
    if (!confirm(`"${center.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    deleteCenter(center.id);
    toast.success("기관이 삭제되었습니다.");
  };

  const handleReissueCode = (center: Center) => {
    const newCode = generateCode(center.region, centers.filter(c => c.id !== center.id).map(c => c.code));
    updateCenter(center.id, { code: newCode });
    toast.success(`코드 재발급 완료: ${newCode}`);
  };

  const handleToggleStatus = (center: Center) => {
    const next = center.status === "active" ? "suspended" : "active";
    updateCenter(center.id, { status: next });
    toast.success(next === "active" ? "기관이 활성화되었습니다." : "기관이 정지되었습니다.");
  };

  const handleAddDept = (centerId: string) => {
    const name = (newDeptName[centerId] || "").trim();
    if (!name) { toast.error("부서명을 입력해 주세요."); return; }
    addDepartment(centerId, name, false);
    setNewDeptName(prev => ({ ...prev, [centerId]: "" }));
    toast.success(`"${name}" 부서가 추가되었습니다.`);
  };

  const toggleDept = (name: string) => {
    setForm(prev => ({
      ...prev,
      initialDepts: prev.initialDepts.includes(name)
        ? prev.initialDepts.filter(d => d !== name)
        : [...prev.initialDepts, name],
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1D1D1F] tracking-tight">기관 관리</h1>
            <p className="text-[13px] text-[#6E6E73] mt-0.5">
              등록된 보건소 기관을 관리하고 신규 기관을 직접 등록합니다.
            </p>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A2B3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#243547] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            기관 등록
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "전체 기관", value: centers.length, icon: Building2, color: "text-[#00A39B]", bg: "bg-blue-50" },
            { label: "운영중", value: centers.filter(c => c.status === "active").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "정지", value: centers.filter(c => c.status === "suspended").length, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
            { label: "전체 부서", value: centers.reduce((acc, c) => acc + c.departments.filter(d => d.status === "active").length, 0), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-[22px] font-bold text-[#1D1D1F] leading-none">{value}</p>
                <p className="text-[12px] text-[#6E6E73] mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-2xl border border-black/5 p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
            <input
              type="text"
              placeholder="기관명 또는 코드 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20 focus:border-[#1A2B3C]"
            />
          </div>
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="px-3 py-2.5 text-[13px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20 bg-white"
          >
            <option value="전체">전체 지역</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-[13px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20 bg-white"
          >
            <option value="전체">전체 상태</option>
            <option value="active">운영중</option>
            <option value="inactive">비활성</option>
            <option value="suspended">정지</option>
          </select>
          <span className="text-[12px] text-[#AEAEB2]">{filtered.length}개 기관</span>
        </div>

        {/* 기관 목록 */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-black/5 p-12 text-center">
              <Building2 className="w-10 h-10 text-[#AEAEB2] mx-auto mb-3" />
              <p className="text-[14px] text-[#6E6E73]">검색 결과가 없습니다.</p>
            </div>
          )}
          {filtered.map(center => (
            <div key={center.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden">
              {/* 기관 헤더 행 */}
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EBF4FF] to-[#D6EAFF] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#00A39B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[15px] font-semibold text-[#1D1D1F]">{center.name}</p>
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${STATUS_BADGE[center.status].cls}`}>
                      {STATUS_BADGE[center.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[12px] font-code font-bold text-[#00A39B] bg-blue-50 px-2 py-0.5 rounded-md">{center.code}</span>
                    <span className="text-[12px] text-[#6E6E73]">{center.region}</span>
                    <span className="text-[12px] text-[#AEAEB2]">부서 {center.departments.filter(d => d.status === "active").length}개</span>
                    <span className="text-[12px] text-[#AEAEB2]">만료: {center.codeExpiresAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditForm(center)}
                    className="p-2 rounded-lg hover:bg-[#F5F5F7] transition-colors text-[#6E6E73]"
                    title="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReissueCode(center)}
                    className="p-2 rounded-lg hover:bg-[#F5F5F7] transition-colors text-[#6E6E73]"
                    title="코드 재발급"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(center)}
                    className={`p-2 rounded-lg transition-colors ${center.status === "active" ? "hover:bg-red-50 text-red-400" : "hover:bg-green-50 text-green-500"}`}
                    title={center.status === "active" ? "정지" : "활성화"}
                  >
                    {center.status === "active" ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(center)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === center.id ? null : center.id)}
                    className="p-2 rounded-lg hover:bg-[#F5F5F7] transition-colors text-[#6E6E73]"
                  >
                    {expandedId === center.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 확장 패널: 상세 정보 + 부서 관리 */}
              {expandedId === center.id && (
                <div className="border-t border-black/5 px-5 py-4 bg-[#FAFAFA] space-y-5">
                  {/* 기관 상세 정보 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#AEAEB2] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-[#AEAEB2] font-medium">주소</p>
                        <p className="text-[13px] text-[#1D1D1F]">{center.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#AEAEB2] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-[#AEAEB2] font-medium">담당자 · 연락처</p>
                        <p className="text-[13px] text-[#1D1D1F]">{center.contactName} · {center.contactPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-[#AEAEB2] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-[#AEAEB2] font-medium">이메일</p>
                        <p className="text-[13px] text-[#1D1D1F]">{center.contactEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* 부서 관리 */}
                  <div>
                    <p className="text-[12px] font-semibold text-[#6E6E73] uppercase tracking-wide mb-2">부서 관리</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {center.departments.map(dept => (
                        <div
                          key={dept.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border ${
                            dept.status === "active"
                              ? "bg-white border-black/10 text-[#1D1D1F]"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}
                        >
                          {dept.status === "pending" && <Clock className="w-3 h-3" />}
                          {dept.name}
                          {dept.status === "pending" && (
                            <button
                              onClick={() => updateDepartmentStatus(center.id, dept.id, "active")}
                              className="ml-1 text-green-600 hover:text-green-700"
                              title="승인"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteDepartment(center.id, dept.id)}
                            className="ml-1 text-[#AEAEB2] hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="새 부서명 입력"
                        value={newDeptName[center.id] || ""}
                        onChange={e => setNewDeptName(prev => ({ ...prev, [center.id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleAddDept(center.id)}
                        className="flex-1 px-3 py-2 text-[13px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20"
                      />
                      <button
                        onClick={() => handleAddDept(center.id)}
                        className="px-4 py-2 bg-[#1A2B3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#243547] transition-colors"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 기관 등록/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-black/5 flex items-center justify-between z-10">
              <h2 className="text-[17px] font-bold text-[#1D1D1F]">
                {formMode === "add" ? "신규 기관 등록" : "기관 정보 수정"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[#F5F5F7] transition-colors">
                <X className="w-5 h-5 text-[#6E6E73]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* 기관명 */}
              <div>
                <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1.5">기관명 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="예: 서울특별시 종로구보건소"
                  className="w-full px-4 py-3 text-[14px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20"
                />
              </div>

              {/* 지역 + 코드 미리보기 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1.5">지역 <span className="text-red-500">*</span></label>
                  <select
                    value={form.region}
                    onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                    className="w-full px-4 py-3 text-[14px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20 bg-white"
                  >
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {formMode === "add" && (
                  <div>
                    <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1.5">자동 발급 코드</label>
                    <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-[14px] font-code font-bold text-[#00A39B]">
                        {generateCode(form.region, centers.map(c => c.code))}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1.5">주소 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="예: 서울 종로구 종로53길 23"
                  className="w-full px-4 py-3 text-[14px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20"
                />
              </div>

              {/* 담당자 정보 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1.5">담당자명 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 text-[14px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1.5">연락처</label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                    placeholder="02-0000-0000"
                    className="w-full px-4 py-3 text-[14px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20"
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1.5">이메일</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                  placeholder="example@gov.go.kr"
                  className="w-full px-4 py-3 text-[14px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20"
                />
              </div>

              {/* 코드 만료일 */}
              <div>
                <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1.5">코드 만료일</label>
                <input
                  type="date"
                  value={form.codeExpiresAt}
                  onChange={e => setForm(p => ({ ...p, codeExpiresAt: e.target.value }))}
                  className="w-full px-4 py-3 text-[14px] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B3C]/20"
                />
              </div>

              {/* 초기 부서 선택 (신규 등록 시만) */}
              {formMode === "add" && (
                <div>
                  <label className="block text-[12px] font-semibold text-[#6E6E73] mb-2">초기 부서 설정</label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_DEPARTMENTS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDept(d)}
                        className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-all ${
                          form.initialDepts.includes(d)
                            ? "bg-[#1A2B3C] text-white border-[#1A2B3C]"
                            : "bg-white text-[#424245] border-black/10 hover:border-[#1A2B3C]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#AEAEB2] mt-2">등록 후 부서를 자유롭게 추가/삭제할 수 있습니다.</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-black/5 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-black/10 text-[14px] font-semibold text-[#424245] rounded-xl hover:bg-[#F5F5F7] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-[#1A2B3C] text-white text-[14px] font-semibold rounded-xl hover:bg-[#243547] transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {formMode === "add" ? "기관 등록" : "수정 완료"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
