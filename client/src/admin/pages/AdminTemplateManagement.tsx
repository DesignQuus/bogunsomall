/**
 * AdminTemplateManagement.tsx
 * Design: "Clean Canvas" — Apple Store Style
 * - Admin page for managing standard product templates
 * - CRUD operations for templates
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, ChevronRight, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  productType: string;
  standardSpec: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

const mockTemplates: Template[] = [
  {
    id: "tpl-001",
    name: "표준 명함",
    productType: "namecard",
    standardSpec: {
      size: "90mm × 50mm",
      paper: "300g 매트 코팅지",
      printing: "양면 컬러",
      finishing: "모서리 라운딩",
    },
    createdAt: "2024-01-15",
    updatedAt: "2024-03-10",
  },
  {
    id: "tpl-002",
    name: "A4 전단지",
    productType: "flyer",
    standardSpec: {
      size: "210mm × 297mm",
      paper: "150g 백상지",
      printing: "양면 컬러",
      finishing: "재단",
    },
    createdAt: "2024-02-01",
    updatedAt: "2024-03-05",
  },
];

export default function AdminTemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    productType: "namecard",
    spec1: "",
    spec2: "",
    spec3: "",
    spec4: "",
  });

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      productType: template.productType,
      spec1: template.standardSpec.size || "",
      spec2: template.standardSpec.paper || "",
      spec3: template.standardSpec.printing || "",
      spec4: template.standardSpec.finishing || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("이 템플릿을 삭제하시겠습니까?")) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("템플릿이 삭제되었습니다.");
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.spec1) {
      toast.error("필수 정보를 입력해주세요.");
      return;
    }

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: formData.name,
                productType: formData.productType,
                standardSpec: {
                  size: formData.spec1,
                  paper: formData.spec2,
                  printing: formData.spec3,
                  finishing: formData.spec4,
                },
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : t
        )
      );
      toast.success("템플릿이 수정되었습니다.");
    } else {
      const newTemplate: Template = {
        id: `tpl-${Date.now()}`,
        name: formData.name,
        productType: formData.productType,
        standardSpec: {
          size: formData.spec1,
          paper: formData.spec2,
          printing: formData.spec3,
          finishing: formData.spec4,
        },
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setTemplates((prev) => [...prev, newTemplate]);
      toast.success("새 템플릿이 생성되었습니다.");
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      productType: "namecard",
      spec1: "",
      spec2: "",
      spec3: "",
      spec4: "",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      productType: "namecard",
      spec1: "",
      spec2: "",
      spec3: "",
      spec4: "",
    });
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-[#f5f5f7] border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-[12px]">
            <Link href="/admin/dashboard" className="text-[#86868b] hover:text-[#00A39B] transition-colors">
              관리자
            </Link>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
            <span className="text-[#1d1d1f] font-medium">표준 양식 관리</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-[#1d1d1f] mb-2">
                표준 양식 관리
              </h1>
              <p className="text-[17px] text-[#86868b]">
                제품별 표준 양식을 생성, 수정, 삭제할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              새 템플릿 추가
            </button>
          </motion.div>
        </div>
      </section>

      {/* Templates List */}
      <section className="bg-[#f5f5f7] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          {templates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12 bg-white rounded-2xl"
            >
              <div className="text-[#86868b] text-[15px] mb-4">
                표준 양식이 없습니다.
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all"
              >
                <Plus className="w-4 h-4" />
                첫 템플릿 추가
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-white rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-2">
                        {template.name}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2 text-[13px] text-[#86868b]">
                        <div>
                          <span className="font-medium">제품:</span> {template.productType}
                        </div>
                        <div>
                          <span className="font-medium">크기:</span> {template.standardSpec.size}
                        </div>
                        <div>
                          <span className="font-medium">용지:</span> {template.standardSpec.paper}
                        </div>
                        <div>
                          <span className="font-medium">수정일:</span> {template.updatedAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPreview(template.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] text-[13px] font-medium rounded-lg hover:bg-[#e8e8ed] transition-all"
                      >
                        미리보기
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00A39B] text-white text-[13px] font-medium rounded-lg hover:bg-[#0055AA] transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 text-[13px] font-medium rounded-lg hover:bg-red-200 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-[#1d1d1f]">
                {editingId ? "템플릿 수정" : "새 템플릿 추가"}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-[#86868b]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  템플릿 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 표준 명함"
                  className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  제품 종류 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                >
                  <option value="namecard">명함</option>
                  <option value="flyer">전단지</option>
                  <option value="poster">포스터</option>
                  <option value="leaflet">리플렛</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  크기 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.spec1}
                  onChange={(e) => setFormData({ ...formData, spec1: e.target.value })}
                  placeholder="예: 90mm × 50mm"
                  className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  용지
                </label>
                <input
                  type="text"
                  value={formData.spec2}
                  onChange={(e) => setFormData({ ...formData, spec2: e.target.value })}
                  placeholder="예: 300g 매트 코팅지"
                  className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  인쇄
                </label>
                <input
                  type="text"
                  value={formData.spec3}
                  onChange={(e) => setFormData({ ...formData, spec3: e.target.value })}
                  placeholder="예: 양면 컬러"
                  className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  후가공
                </label>
                <input
                  type="text"
                  value={formData.spec4}
                  onChange={(e) => setFormData({ ...formData, spec4: e.target.value })}
                  placeholder="예: 모서리 라운딩"
                  className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all"
              >
                <Save className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#e8e8ed] text-[#1d1d1f] text-[15px] font-semibold rounded-full hover:bg-[#d2d2d7] transition-all"
              >
                <X className="w-4 h-4" />
                취소
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {templates.find((t) => t.id === showPreview) && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[20px] font-bold text-[#1d1d1f]">
                    {templates.find((t) => t.id === showPreview)?.name} - 미리보기
                  </h2>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-[#86868b]" />
                  </button>
                </div>

                <div className="bg-[#f5f5f7] rounded-xl p-6 space-y-4">
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-[#d2d2d7]">
                    <div className="text-[48px] mb-3">📋</div>
                    <p className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                      {templates.find((t) => t.id === showPreview)?.name}
                    </p>
                    <p className="text-[13px] text-[#86868b]">
                      표준 양식 미리보기
                    </p>
                  </div>

                  <div className="space-y-3">
                    {templates.find((t) => t.id === showPreview)?.standardSpec && (
                      Object.entries(
                        templates.find((t) => t.id === showPreview)?.standardSpec || {}
                      ).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-[13px] font-medium text-[#86868b]">
                            {key === "size" && "크기"}
                            {key === "paper" && "용지"}
                            {key === "printing" && "인쇄"}
                            {key === "finishing" && "후가공"}
                          </span>
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">
                            {value}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowPreview(null)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all"
                  >
                    닫기
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
