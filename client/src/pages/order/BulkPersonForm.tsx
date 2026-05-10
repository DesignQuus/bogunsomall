/**
 * 2명 이상 입력 폼 (웹 테이블 + 엑셀 업로드)
 * - 웹 테이블로 행 추가/삭제
 * - 엑셀 템플릿 다운로드/업로드
 */

import { useState } from "react";
import { ChevronLeft, Plus, Trash2, Download, Upload } from "lucide-react";
import { StandardTemplate, PersonalInfoRow, TemplateField } from "@/types/order";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface BulkPersonFormProps {
  template: StandardTemplate;
  onNext: (data: PersonalInfoRow[]) => void;
  onBack: () => void;
}

export default function BulkPersonForm({
  template,
  onNext,
  onBack,
}: BulkPersonFormProps) {
  const [rows, setRows] = useState<PersonalInfoRow[]>([
    createEmptyRow(),
    createEmptyRow(),
  ]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  function createEmptyRow(): PersonalInfoRow {
    return {
      id: `row_${Date.now()}_${Math.random()}`,
      ...template.fields.reduce((acc, field) => {
        acc[field.key] = "";
        return acc;
      }, {} as PersonalInfoRow),
    };
  }

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length <= 1) {
      toast.error("최소 1명 이상 입력해야 합니다.");
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    setRows((prev) => {
      const newRows = [...prev];
      newRows[rowIndex] = { ...newRows[rowIndex], [key]: value };
      return newRows;
    });

    // 에러 제거
    if (errors[rowIndex]?.[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[rowIndex]) {
          delete newErrors[rowIndex][key];
          if (Object.keys(newErrors[rowIndex]).length === 0) {
            delete newErrors[rowIndex];
          }
        }
        return newErrors;
      });
    }
  };

  const validateRows = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};

    rows.forEach((row, rowIndex) => {
      const rowErrors: Record<string, string> = {};

      template.fields.forEach((field) => {
        const value = row[field.key];

        if (field.required && !value) {
          rowErrors[field.key] = `필수 입력`;
        }

        if (value && field.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            rowErrors[field.key] = "유효한 이메일";
          }
        }

        if (value && field.type === "phone") {
          const phoneRegex = /^[0-9\-]{10,}$/;
          if (!phoneRegex.test(value)) {
            rowErrors[field.key] = "유효한 전화번호";
          }
        }
      });

      if (Object.keys(rowErrors).length > 0) {
        newErrors[rowIndex] = rowErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (rows.length === 0) {
      toast.error("최소 1명 이상 입력해야 합니다.");
      return;
    }

    if (validateRows()) {
      onNext(rows);
    } else {
      toast.error("입력 내용을 확인해주세요.");
    }
  };

  // 엑셀 템플릿 다운로드
  const handleDownloadTemplate = () => {
    const templateData = [
      template.fields.map((f) => f.label),
      template.fields.map((f) => f.placeholder || ""),
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, template.name);
    XLSX.writeFile(wb, `${template.name}_template.xlsx`);

    toast.success("템플릿이 다운로드되었습니다.");
  };

  // 엑셀 파일 업로드
  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 });

        if (jsonData.length === 0) {
          toast.error("엑셀 파일에 데이터가 없습니다.");
          return;
        }

        const newRows: PersonalInfoRow[] = jsonData.map((row: any) => {
          const newRow: PersonalInfoRow = {
            id: `row_${Date.now()}_${Math.random()}`,
          };

          template.fields.forEach((field) => {
            // 첫 번째 행이 헤더인 경우 처리
            const value = row[field.label] || row[field.key] || "";
            newRow[field.key] = String(value);
          });

          return newRow;
        });

        setRows(newRows);
        toast.success(`${newRows.length}명의 데이터가 업로드되었습니다.`);
      } catch (error) {
        toast.error("엑셀 파일 읽기에 실패했습니다.");
        console.error(error);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-[#e5e5e7] z-10">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#00A39B] hover:text-[#0055AA] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[14px] font-semibold">뒤로</span>
          </button>
          <h1 className="text-[18px] font-bold text-[#1d1d1f]">정보 입력 (대량)</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-2">
            {template.name}
          </h2>
          <p className="text-[15px] text-[#86868b]">
            2명 이상의 정보를 입력해주세요 (현재 {rows.length}명)
          </p>
        </div>

        {/* 도구 모음 */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#00A39B] text-[#00A39B] text-[14px] font-semibold rounded-lg hover:bg-[#EBF4FF] transition-colors"
          >
            <Download className="w-4 h-4" />
            템플릿 다운로드
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-[#00A39B] text-[#00A39B] text-[14px] font-semibold rounded-lg hover:bg-[#EBF4FF] transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            엑셀 업로드
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUploadExcel}
              className="hidden"
            />
          </label>

          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-4 py-2 bg-[#00A39B] text-white text-[14px] font-semibold rounded-lg hover:bg-[#0055AA] transition-colors ml-auto"
          >
            <Plus className="w-4 h-4" />
            행 추가
          </button>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto border border-[#e5e5e7] rounded-xl mb-12">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f7] border-b border-[#e5e5e7]">
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#1d1d1f] w-12">
                  #
                </th>
                {template.fields.map((field) => (
                  <th
                    key={field.key}
                    className="px-4 py-3 text-left text-[13px] font-semibold text-[#1d1d1f] min-w-[150px]"
                  >
                    {field.label}
                    {field.required && <span className="text-[#FF3B30]"> *</span>}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#1d1d1f] w-12">
                  삭제
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="border-b border-[#e5e5e7] hover:bg-[#f5f5f7] transition-colors"
                >
                  <td className="px-4 py-3 text-[13px] text-[#86868b]">
                    {rowIndex + 1}
                  </td>
                  {template.fields.map((field) => {
                    const value = row[field.key] || "";
                    const error = errors[rowIndex]?.[field.key];

                    return (
                      <td key={field.key} className="px-4 py-3">
                        <input
                          type={field.type === "email" ? "email" : "text"}
                          value={value}
                          onChange={(e) =>
                            handleCellChange(rowIndex, field.key, e.target.value)
                          }
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          className={`w-full px-3 py-2 border rounded text-[13px] font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A39B] focus:border-transparent ${
                            error
                              ? "border-[#FF3B30]"
                              : "border-[#e5e5e7] hover:border-[#d5d5d7]"
                          }`}
                        />
                        {error && (
                          <p className="text-[11px] text-[#FF3B30] mt-1">
                            {error}
                          </p>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteRow(rowIndex)}
                      className="text-[#FF3B30] hover:text-[#FF2D20] transition-colors p-1"
                      title="행 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-[#e5e5e7]">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-6 bg-white border border-[#1d1d1f]/15 text-[#1d1d1f] text-[15px] font-semibold rounded-full hover:bg-[#f5f5f7] transition-colors"
          >
            뒤로
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-6 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
