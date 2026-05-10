import { useLocation, Link } from "wouter";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Building2, Users, Key, FileText,
  LogOut, Shield, ChevronRight, Bell, Settings, Menu, X
} from "lucide-react";
import { adminAuth } from "@/admin/pages/AdminLogin";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/centers", icon: Building2, label: "기관 관리" },
  { href: "/admin/staff", icon: Users, label: "담당자 관리" },
  { href: "/admin/accounts", icon: Users, label: "계정 승인" },
  { href: "/admin/codes", icon: Key, label: "코드 발급 관리" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!adminAuth.isLoggedIn()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    adminAuth.logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      {/* 사이드바 — 모바일에서 숨김 */}
      <aside className="hidden lg:flex w-[240px] bg-[#1A2B3C] flex-col flex-shrink-0 fixed h-full z-10">
        {/* 로고 */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00A39B] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-[14px] font-bold leading-tight">보건소플러스</p>
              <p className="text-white/50 text-[11px]">Admin System</p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* 하단 */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 모바일 메뉴 오버레이 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[240px] bg-[#1A2B3C] flex flex-col z-10">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00A39B] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-[14px] font-bold leading-tight">보건소플러스</p>
                  <p className="text-white/50 text-[11px]">Admin System</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "text-white/60 hover:bg-white/8 hover:text-white/90"
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </a>
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-white/10 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-1 lg:ml-[240px] min-h-screen w-full overflow-x-hidden">
        {/* 상단 헤더 */}
        <header className="bg-white border-b border-black/5 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#F5F5F7] transition-colors"
            >
              <Menu className="w-5 h-5 text-[#6E6E73]" />
            </button>
            {navItems.find(n => location.startsWith(n.href)) && (
              <div className="flex items-center gap-2 text-[13px] text-[#6E6E73]">
                <span className="hidden sm:inline">관리자</span>
                <ChevronRight className="w-3 h-3 hidden sm:inline" />
                <span className="text-[#1D1D1F] font-medium">
                  {navItems.find(n => location.startsWith(n.href))?.label}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-[#F5F5F7] transition-colors">
              <Bell className="w-5 h-5 text-[#6E6E73]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F5F7]">
              <div className="w-7 h-7 rounded-full bg-[#1A2B3C] flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">A</span>
              </div>
              <span className="text-[13px] font-medium text-[#1D1D1F]">관리자</span>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
