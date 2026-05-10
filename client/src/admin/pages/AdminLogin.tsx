import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

// 어드민 인증 상태 (실제 구현 시 서버 인증으로 교체)
export const adminAuth = {
  isLoggedIn: () => localStorage.getItem("admin_auth") === "true",
  login: () => localStorage.setItem("admin_auth", "true"),
  logout: () => localStorage.removeItem("admin_auth"),
};

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // 현재 임시 운영 중: 입력 없이 로그인 버튼 클릭만으로 입장 가능
    adminAuth.login();
    navigate("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 py-16">
      <div className="w-full max-w-[400px] mx-auto">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1A2B3C] mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">관리자 로그인</h1>
          <p className="text-[14px] text-[#6E6E73] mt-1">보건소플러스 어드민 시스템</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* 아이디 */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">관리자 아이디</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#1A2B3C] focus:border-transparent transition-all"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-black/10 text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#1A2B3C] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AEAEB2] hover:text-[#6E6E73]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 임시 운영 안내 */}
            <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-700 leading-relaxed">
                <span className="font-semibold block mb-0.5">임시 운영 안내</span>
                현재 입력 없이 로그인 버튼만 클릭하면 입장할 수 있습니다.
                별도 지시가 있을 때까지 이 방식으로 운영됩니다.
              </p>
            </div>
            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-[13px] text-red-600">{error}</p>
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1A2B3C] text-white text-[15px] font-semibold hover:bg-[#243547] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  인증 중...
                </span>
              ) : (
                "로그인"
              )}
            </button>
          </form>

          {/* 데모 안내 */}
          <div className="mt-6 p-4 bg-[#F5F5F7] rounded-xl">
            <p className="text-[12px] text-[#6E6E73] font-medium mb-1">데모 계정 안내</p>
            <p className="text-[12px] text-[#6E6E73]">아이디: <span className="font-code font-semibold text-[#1D1D1F]">admin</span></p>
            <p className="text-[12px] text-[#6E6E73]">비밀번호: <span className="font-code font-semibold text-[#1D1D1F]">bogunso2024!</span></p>
          </div>
        </div>

        {/* 하단 링크 */}
        <p className="text-center text-[13px] text-[#6E6E73] mt-6">
          <a href="/" className="hover:text-[#1D1D1F] transition-colors">← 보건소플러스 홈으로 돌아가기</a>
        </p>
      </div>
    </div>
  );
}
