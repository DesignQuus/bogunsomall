/**
 * 멤버십 안내 페이지
 * - 5개 탭: 회원가입 / 아이디·비밀번호 찾기 / 회원약관 / 이용약관 / 개인정보 취급방침
 */

import { useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle, Phone, Mail, ChevronRight, AlertCircle } from "lucide-react";

const TABS = [
  { id: "join", label: "회원가입" },
  { id: "find", label: "아이디/비밀번호 찾기" },
  { id: "member-terms", label: "회원약관" },
  { id: "terms", label: "이용약관" },
  { id: "privacy", label: "개인정보 취급방침" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Membership() {
  const [location] = useLocation();
  const hashTab = location.split("#")[1] as TabId | undefined;
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS.find((t) => t.id === hashTab)?.id ?? "join"
  );

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-black/5">
        <div className="max-w-[900px] mx-auto px-5 md:px-8 py-10 text-center">
          <h1 className="text-[32px] md:text-[38px] font-bold tracking-tight text-[#1d1d1f]">
            멤버십
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            보건소플러스 회원 안내 및 이용 약관
          </p>
        </div>

        {/* 탭 버튼 */}
        <div className="max-w-[900px] mx-auto px-5 md:px-8">
          <div className="flex flex-wrap gap-0 border-b border-black/8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "relative px-5 py-3 text-[14px] font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-[#00A39B] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00A39B] after:rounded-t"
                    : "text-[#424245] hover:text-[#1d1d1f]",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="max-w-[900px] mx-auto px-5 md:px-8 py-12">
        {activeTab === "join" && <JoinTab />}
        {activeTab === "find" && <FindTab />}
        {activeTab === "member-terms" && <MemberTermsTab />}
        {activeTab === "terms" && <TermsTab />}
        {activeTab === "privacy" && <PrivacyTab />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   탭별 콘텐츠 컴포넌트
───────────────────────────────────────────── */

function JoinTab() {
  return (
    <div>
      <SectionTitle
        title="회원가입"
        desc="보건소플러스 회원가입 절차 및 안내"
      />

      {/* 가입 자격 안내 */}
      <div className="mb-8 p-6 bg-[#00A39B]/5 rounded-2xl border border-[#00A39B]/15">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">가입 대상</h3>
        <p className="text-[14px] text-[#424245] leading-relaxed">
          보건소플러스는 <strong className="text-[#00A39B]">전국 보건소 담당자</strong>를 위한 전용 발주 플랫폼입니다.
          보건소 소속 직원만 가입 신청이 가능하며, 관리자 승인 후 서비스를 이용하실 수 있습니다.
        </p>
      </div>

      {/* 가입 절차 */}
      <div className="mb-8">
        <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-5">가입 절차</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "등록 신청", desc: "보건소명·부서명·담당자 정보 입력 후 신청" },
            { step: "02", title: "관리자 검토", desc: "영업일 기준 1~2일 이내 신청 내용 검토" },
            { step: "03", title: "승인 및 코드 발급", desc: "승인 시 간편 로그인 번호를 이메일로 안내" },
            { step: "04", title: "서비스 이용", desc: "발급된 코드로 로그인 후 서비스 이용" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-black/6 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#00A39B] text-white text-[13px] font-bold flex items-center justify-center mb-3">
                {item.step}
              </div>
              <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1">{item.title}</div>
              <div className="text-[12px] text-[#86868b] leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 필요 정보 */}
      <div className="mb-8">
        <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-4">신청 시 필요한 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "보건소명 (시·도, 시·군·구)",
            "부서명",
            "담당자 성명",
            "연락처 (전화번호)",
            "이메일 주소",
            "사업자등록번호",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-black/6">
              <CheckCircle className="w-4 h-4 text-[#00A39B] flex-shrink-0" />
              <span className="text-[14px] text-[#424245]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 등록 신청 CTA */}
      <div className="flex flex-col items-center gap-3 py-8 bg-[#f5f5f7] rounded-2xl">
        <p className="text-[15px] text-[#424245] text-center">
          보건소 담당자이신가요? 지금 바로 등록을 신청하세요.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#008f88] transition-all shadow-md shadow-[#00A39B]/20"
        >
          지금 등록 신청하기
          <ChevronRight className="w-4 h-4" />
        </Link>
        <p className="text-[12px] text-[#86868b]">
          신청 후 영업일 기준 1~2일 이내 승인 처리됩니다.
        </p>
      </div>
    </div>
  );
}

function FindTab() {
  return (
    <div>
      <SectionTitle
        title="아이디 / 비밀번호 찾기"
        desc="간편 로그인 번호 분실 시 재발급 안내"
      />

      {/* 안내 박스 */}
      <div className="mb-8 p-6 bg-amber-50 rounded-2xl border border-amber-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-semibold text-amber-800 mb-1">간편 로그인 번호 안내</h3>
            <p className="text-[13px] text-amber-700 leading-relaxed">
              보건소플러스는 별도의 아이디·비밀번호 없이 <strong>간편 로그인 번호</strong>로 로그인합니다.
              간편 로그인 번호는 가입 승인 시 등록하신 이메일로 발송됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 재발급 방법 */}
      <div className="mb-8">
        <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-5">간편 로그인 번호 재발급 방법</h3>
        <div className="space-y-4">
          {[
            {
              num: "1",
              title: "이메일 확인",
              desc: "가입 승인 시 발송된 이메일을 다시 확인해 주세요. 스팸 메일함도 확인해 보세요.",
            },
            {
              num: "2",
              title: "고객센터 문의",
              desc: "이메일을 찾을 수 없는 경우, 아래 고객센터로 연락하시면 재발급 도와드립니다.",
            },
            {
              num: "3",
              title: "재발급 신청",
              desc: "담당자 확인 후 등록된 이메일로 새 간편 로그인 번호를 발송해 드립니다.",
            },
          ].map((item) => (
            <div key={item.num} className="flex gap-4 p-5 bg-white rounded-2xl border border-black/6 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#00A39B]/10 text-[#00A39B] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                {item.num}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1">{item.title}</div>
                <div className="text-[13px] text-[#86868b] leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 고객센터 연락처 */}
      <div className="p-6 bg-[#f5f5f7] rounded-2xl">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-4">고객센터 연락처</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/6">
            <div className="w-9 h-9 rounded-full bg-[#00A39B]/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-[#00A39B]" />
            </div>
            <div>
              <div className="text-[11px] text-[#86868b] mb-0.5">전화 문의</div>
              <a href="tel:15226401" className="text-[15px] font-semibold text-[#1d1d1f] hover:text-[#00A39B] transition-colors">
                1522-6401
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/6">
            <div className="w-9 h-9 rounded-full bg-[#00A39B]/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-[#00A39B]" />
            </div>
            <div>
              <div className="text-[11px] text-[#86868b] mb-0.5">이메일 문의</div>
              <a href="mailto:032indesign@naver.com" className="text-[14px] font-semibold text-[#1d1d1f] hover:text-[#00A39B] transition-colors">
                032indesign@naver.com
              </a>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-[#86868b] text-center">
          운영시간: 평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00, 주말·공휴일 휴무)
        </p>
      </div>
    </div>
  );
}

function MemberTermsTab() {
  return (
    <div>
      <SectionTitle
        title="회원약관"
        desc="보건소플러스 회원 이용 약관"
      />
      <TermsDocument
        lastUpdated="2025년 1월 1일"
        articles={[
          {
            title: "제1조 (목적)",
            content: `이 약관은 보건소플러스(이하 "회사")가 운영하는 보건소플러스 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`,
          },
          {
            title: "제2조 (정의)",
            content: `① "서비스"란 회사가 제공하는 보건소 전용 인쇄물 발주 플랫폼 및 관련 서비스를 의미합니다.\n② "회원"이란 이 약관에 동의하고 회사와 이용계약을 체결하여 서비스를 이용하는 보건소 담당자를 의미합니다.\n③ "간편 로그인 번호"란 회원이 서비스에 로그인하기 위해 사용하는 고유 식별 코드를 의미합니다.`,
          },
          {
            title: "제3조 (약관의 효력 및 변경)",
            content: `① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.\n② 회사는 합리적인 사유가 있는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 적용일자 7일 전부터 공지합니다.\n③ 회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.`,
          },
          {
            title: "제4조 (회원 가입)",
            content: `① 서비스 이용을 원하는 자는 회사가 정한 양식에 따라 회원정보를 기입하고 이 약관에 동의한다는 의사표시를 함으로써 회원 가입을 신청합니다.\n② 회사는 신청자의 정보를 검토한 후 승인 여부를 결정하며, 승인 시 간편 로그인 번호를 발급합니다.\n③ 다음 각 호에 해당하는 경우 가입 신청을 거절할 수 있습니다.\n  1. 보건소 소속 직원이 아닌 경우\n  2. 타인의 명의를 도용한 경우\n  3. 허위 정보를 기재한 경우`,
          },
          {
            title: "제5조 (회원의 의무)",
            content: `① 회원은 다음 각 호의 행위를 하여서는 안 됩니다.\n  1. 타인의 간편 로그인 번호를 무단으로 사용하는 행위\n  2. 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 유통, 상업적으로 이용하는 행위\n  3. 회사의 서비스 운영을 방해하는 행위\n  4. 기타 관계 법령에 위반되는 행위\n② 회원은 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.`,
          },
          {
            title: "제6조 (서비스 이용)",
            content: `① 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.\n② 회사는 서비스를 일정 범위로 분할하여 각 범위별로 이용 가능한 시간을 별도로 정할 수 있습니다.\n③ 회사는 시스템 정기점검, 증설 및 교체를 위해 서비스를 일시 중단할 수 있으며, 이 경우 사전에 공지합니다.`,
          },
          {
            title: "제7조 (계약 해지)",
            content: `① 회원은 언제든지 서비스 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.\n② 회사는 회원이 이 약관을 위반한 경우 사전 통보 없이 이용 계약을 해지할 수 있습니다.`,
          },
          {
            title: "제8조 (면책조항)",
            content: `① 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.\n② 회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.`,
          },
        ]}
      />
    </div>
  );
}

function TermsTab() {
  return (
    <div>
      <SectionTitle
        title="이용약관"
        desc="서비스 이용에 관한 약관"
      />
      <TermsDocument
        lastUpdated="2025년 1월 1일"
        articles={[
          {
            title: "제1조 (목적)",
            content: `이 약관은 보건소플러스(이하 "회사")가 제공하는 인쇄물 발주 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.`,
          },
          {
            title: "제2조 (서비스의 내용)",
            content: `① 회사는 다음과 같은 서비스를 제공합니다.\n  1. 보건소 전용 인쇄물 발주 서비스\n  2. 명함, 스티커, 봉투, 리플렛, 쇼핑백, 달력 등 인쇄물 제작\n  3. 발주 이력 관리 및 조회 서비스\n  4. 기타 회사가 정하는 서비스\n② 회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경 내용을 공지합니다.`,
          },
          {
            title: "제3조 (발주 및 계약)",
            content: `① 이용자가 발주 신청을 완료하면 회사는 이를 확인하고 수락 여부를 통보합니다.\n② 발주 계약은 회사가 수락 의사를 통보한 시점에 성립됩니다.\n③ 회사는 다음 각 호에 해당하는 경우 발주를 거절할 수 있습니다.\n  1. 발주 내용이 관계 법령에 위반되는 경우\n  2. 서비스 제공이 기술적으로 불가능한 경우`,
          },
          {
            title: "제4조 (발주 취소 및 변경)",
            content: `① 발주 취소 및 변경은 제작 착수 전까지 가능합니다.\n② 제작 착수 후에는 취소 또는 변경이 불가능하며, 이 경우 발생하는 비용은 이용자가 부담합니다.\n③ 취소 및 변경 요청은 고객센터를 통해 접수하시기 바랍니다.`,
          },
          {
            title: "제5조 (납품 및 검수)",
            content: `① 회사는 약정된 납기일에 맞추어 제품을 납품합니다.\n② 이용자는 납품 후 3영업일 이내에 검수를 완료하여야 합니다.\n③ 검수 기간 내에 이의를 제기하지 않은 경우 납품이 완료된 것으로 간주합니다.`,
          },
          {
            title: "제6조 (하자 처리)",
            content: `① 납품된 제품에 회사의 귀책사유로 인한 하자가 발생한 경우, 회사는 재제작 또는 환불 처리합니다.\n② 하자 접수는 납품일로부터 7영업일 이내에 하여야 합니다.\n③ 이용자의 귀책사유(오탈자, 디자인 오류 등)로 인한 하자는 회사가 책임지지 않습니다.`,
          },
          {
            title: "제7조 (지적재산권)",
            content: `① 서비스에 관한 저작권 및 지적재산권은 회사에 귀속됩니다.\n② 이용자는 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 전송, 출판, 배포, 방송 등의 방법으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.`,
          },
        ]}
      />
    </div>
  );
}

function PrivacyTab() {
  return (
    <div>
      <SectionTitle
        title="개인정보 취급방침"
        desc="개인정보 수집·이용·보호에 관한 방침"
      />
      <TermsDocument
        lastUpdated="2025년 1월 1일"
        articles={[
          {
            title: "제1조 (개인정보의 처리 목적)",
            content: `보건소플러스(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.\n\n1. 회원 가입 및 관리: 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적으로 개인정보를 처리합니다.\n2. 서비스 제공: 인쇄물 발주 서비스 제공, 발주 이력 관리, 납품 안내 등을 목적으로 개인정보를 처리합니다.\n3. 고충 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 목적으로 개인정보를 처리합니다.`,
          },
          {
            title: "제2조 (개인정보의 처리 및 보유기간)",
            content: `① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.\n② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.\n  1. 회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)\n  2. 발주 서비스 제공: 서비스 공급 완료 및 요금 결제·정산 완료 시까지`,
          },
          {
            title: "제3조 (개인정보의 제3자 제공)",
            content: `① 회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.\n② 회사는 현재 개인정보를 제3자에게 제공하고 있지 않습니다.`,
          },
          {
            title: "제4조 (수집하는 개인정보의 항목)",
            content: `회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.\n\n[필수 항목]\n- 보건소명, 부서명, 담당자 성명\n- 연락처 (전화번호)\n- 이메일 주소\n- 사업자등록번호\n\n[자동 수집 항목]\n- 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보`,
          },
          {
            title: "제5조 (개인정보의 파기)",
            content: `① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.\n② 정보주체로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.\n③ 개인정보 파기의 절차 및 방법은 다음과 같습니다.\n  1. 파기절차: 불필요한 개인정보 및 개인정보 파일은 개인정보보호책임자의 책임 하에 파기합니다.\n  2. 파기방법: 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기합니다.`,
          },
          {
            title: "제6조 (정보주체의 권리·의무 및 행사방법)",
            content: `① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.\n  1. 개인정보 열람 요구\n  2. 오류 등이 있을 경우 정정 요구\n  3. 삭제 요구\n  4. 처리정지 요구\n② 제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.`,
          },
          {
            title: "제7조 (개인정보보호책임자)",
            content: `① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.\n\n▶ 개인정보보호책임자\n  - 성명: 관리자\n  - 연락처: 1522-6401\n  - 이메일: 032indesign@naver.com\n\n② 정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보보호책임자에게 문의하실 수 있습니다.`,
          },
        ]}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   공통 컴포넌트
───────────────────────────────────────────── */

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-[22px] font-bold text-[#1d1d1f] mb-1">{title}</h2>
      <p className="text-[14px] text-[#86868b]">{desc}</p>
      <div className="mt-4 h-px bg-black/8" />
    </div>
  );
}

function TermsDocument({
  lastUpdated,
  articles,
}: {
  lastUpdated: string;
  articles: { title: string; content: string }[];
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[13px] text-[#86868b]">시행일: {lastUpdated}</p>
      </div>
      <div className="space-y-6">
        {articles.map((article) => (
          <div key={article.title} className="p-6 bg-white rounded-2xl border border-black/6">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">{article.title}</h3>
            <p className="text-[13px] text-[#424245] leading-relaxed whitespace-pre-line">
              {article.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
