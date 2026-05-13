"use client";

import { useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { LayoutList, Table2, BarChart3 } from "lucide-react";

// 2026년 4월 ~ 2027년 4월 보건소 연간 사업 일정
// 출처: 보건복지부, 한국건강증진개발원, WHO 글로벌 헬스 데이
const months = [
  {
    month: "2026년 4월",
    key: "2026-04",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    events: [
      {
        date: "4월 2일",
        title: "세계 자폐증 인식의 날",
        category: "캠페인",
        desc: "자폐 스펙트럼 장애 인식 제고 캠페인. 파란색 조명 점등 행사, 홍보물 배포.",
        printItems: ["캠페인 포스터", "리플릿", "배너"],
      },
      {
        date: "4월 7일",
        title: "보건의 날 (세계 보건의 날)",
        category: "기념일",
        desc: "WHO 창립 기념일. 국민 보건의식 향상 행사, 보건의료 종사자 격려. 지역 보건 행사 개최.",
        printItems: ["기념 현수막", "포스터", "홍보 책자"],
      },
      {
        date: "4월 중",
        title: "국가건강검진 시작",
        category: "검진",
        desc: "일반건강검진, 암검진(위암·대장암·간암·유방암·자궁경부암) 시작. 대상자 안내 발송.",
        printItems: ["검진 안내문", "대상자 통보서", "홍보 포스터"],
      },
      {
        date: "4월 25일",
        title: "세계 말라리아의 날",
        category: "캠페인",
        desc: "말라리아 예방 홍보. 해외여행 전 예방접종 안내.",
        printItems: ["예방 안내 포스터"],
      },
      {
        date: "4월 26~30일",
        title: "세계 예방접종 주간",
        category: "예방접종",
        desc: "WHO 지정 세계 예방접종 주간. 어린이·성인 예방접종 독려 캠페인.",
        printItems: ["예방접종 일정표", "홍보 포스터", "배너"],
      },
    ],
  },
  {
    month: "2026년 5월",
    key: "2026-05",
    color: "bg-green-500",
    lightColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    events: [
      {
        date: "5월 10일",
        title: "여성 건강의 날",
        category: "캠페인",
        desc: "여성 건강 증진 캠페인. 자궁경부암·유방암 검진 독려.",
        printItems: ["검진 안내 포스터", "홍보 리플릿"],
      },
      {
        date: "5월 17일",
        title: "세계 고혈압의 날",
        category: "캠페인",
        desc: "고혈압 예방·관리 캠페인. 혈압 측정 무료 행사, 저염식 홍보.",
        printItems: ["캠페인 포스터", "혈압 관리 안내서", "배너"],
      },
      {
        date: "5월 31일",
        title: "세계 금연의 날",
        category: "금연",
        desc: "WHO 지정 세계 금연의 날. 금연 클리닉 특별 등록 행사, 금연 캠페인.",
        printItems: ["금연 캠페인 포스터", "금연 안내 리플릿", "현수막", "배너"],
      },
    ],
  },
  {
    month: "2026년 6월",
    key: "2026-06",
    color: "bg-teal-500",
    lightColor: "bg-teal-50",
    borderColor: "border-teal-200",
    textColor: "text-teal-700",
    events: [
      {
        date: "6월 9일",
        title: "구강 보건의 날 (치아의 날)",
        category: "구강보건",
        desc: "구강 건강 캠페인. 무료 구강 검진, 불소 도포, 스케일링 홍보.",
        printItems: ["구강 건강 포스터", "칫솔질 안내 리플릿", "배너"],
      },
      {
        date: "6월 14일",
        title: "세계 헌혈자의 날",
        category: "캠페인",
        desc: "헌혈 참여 독려 캠페인. 헌혈 행사 개최.",
        printItems: ["헌혈 홍보 포스터", "현수막"],
      },
      {
        date: "6월 26일",
        title: "세계 마약퇴치의 날",
        category: "캠페인",
        desc: "마약류 예방 교육 및 홍보. 청소년 대상 약물 오남용 예방 캠페인.",
        printItems: ["예방 교육 포스터", "리플릿"],
      },
      {
        date: "6월 중",
        title: "여름 모기 방역 사업 시작",
        category: "방역",
        desc: "일본뇌염·말라리아 예방 방역 사업 시작. 방역 약품 살포 및 주민 홍보.",
        printItems: ["방역 안내 포스터", "방역 일정 안내문"],
      },
    ],
  },
  {
    month: "2026년 7월",
    key: "2026-07",
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    events: [
      {
        date: "7월 28일",
        title: "세계 간염의 날",
        category: "캠페인",
        desc: "B형·C형 간염 예방 및 검진 홍보. 간염 바이러스 무료 검사 행사.",
        printItems: ["간염 예방 포스터", "검진 안내 리플릿"],
      },
      {
        date: "7월 중",
        title: "여름철 식중독 예방 캠페인",
        category: "식품위생",
        desc: "식중독 예방 홍보. 올바른 손씻기, 식품 보관법 안내.",
        printItems: ["식중독 예방 포스터", "손씻기 안내 스티커", "현수막"],
      },
      {
        date: "7월 중",
        title: "폭염 대비 건강 관리 캠페인",
        category: "응급",
        desc: "온열질환 예방 홍보. 취약계층(노인·어린이) 건강 관리 안내.",
        printItems: ["폭염 대비 포스터", "온열질환 예방 리플릿"],
      },
    ],
  },
  {
    month: "2026년 8월",
    key: "2026-08",
    color: "bg-yellow-500",
    lightColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    events: [
      {
        date: "8월 중",
        title: "하반기 건강검진 집중 독려",
        category: "검진",
        desc: "국가건강검진 미수검자 대상 집중 안내. 검진 기관 안내 및 예약 독려.",
        printItems: ["검진 독려 안내문", "문자 발송용 안내 카드"],
      },
      {
        date: "8월 중",
        title: "학교 복귀 전 어린이 예방접종 확인",
        category: "예방접종",
        desc: "개학 전 어린이 예방접종 완료 여부 확인 및 미접종자 접종 독려.",
        printItems: ["예방접종 확인 안내문", "학부모 안내 리플릿"],
      },
      {
        date: "8월 중",
        title: "자살예방의 달 캠페인",
        category: "정신건강",
        desc: "자살예방 인식 제고 캠페인. 생명존중 문화 확산 행사.",
        printItems: ["생명존중 포스터", "상담 안내 리플릿", "배너"],
      },
    ],
  },
  {
    month: "2026년 9월",
    key: "2026-09",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    events: [
      {
        date: "9월 21일",
        title: "세계 치매의 날",
        category: "치매",
        desc: "치매 인식 개선 캠페인. 치매 조기 검진 독려, 치매 안심센터 홍보.",
        printItems: ["치매 예방 포스터", "치매 안심센터 안내 리플릿", "배너"],
      },
      {
        date: "9월 22일~",
        title: "독감 예방접종 시작 (고위험군)",
        category: "예방접종",
        desc: "2026-2027절기 인플루엔자 국가예방접종 시작. 75세 이상 어르신 우선 접종.",
        printItems: ["독감 접종 안내 포스터", "접종 일정 안내문", "현수막"],
      },
      {
        date: "9월 29일",
        title: "세계 심장의 날",
        category: "캠페인",
        desc: "심혈관 질환 예방 캠페인. 심폐소생술 교육, 금연·운동 홍보.",
        printItems: ["심장 건강 포스터", "CPR 안내 리플릿"],
      },
    ],
  },
  {
    month: "2026년 10월",
    key: "2026-10",
    color: "bg-red-500",
    lightColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    events: [
      {
        date: "10월 15일~",
        title: "독감 예방접종 확대 (65세 이상)",
        category: "예방접종",
        desc: "65세 이상 어르신 인플루엔자 무료 예방접종 확대 시행.",
        printItems: ["독감 접종 확대 안내 포스터", "현수막", "배너"],
      },
      {
        date: "10월 20일",
        title: "간의 날 / 골다공증의 날",
        category: "캠페인",
        desc: "간 건강 및 골다공증 예방 캠페인. 골밀도 검사 홍보.",
        printItems: ["간 건강 포스터", "골다공증 예방 리플릿"],
      },
      {
        date: "10월 29일",
        title: "세계 뇌졸중의 날",
        category: "캠페인",
        desc: "뇌졸중 예방 및 응급 대처 홍보. FAST 캠페인.",
        printItems: ["뇌졸중 예방 포스터", "응급 대처 안내 카드"],
      },
      {
        date: "10월 중",
        title: "연말 건강검진 마감 안내",
        category: "검진",
        desc: "국가건강검진 연말 마감 전 집중 독려. 미수검자 안내 발송.",
        printItems: ["검진 마감 안내 포스터", "독려 안내문"],
      },
    ],
  },
  {
    month: "2026년 11월",
    key: "2026-11",
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-700",
    events: [
      {
        date: "11월 14일",
        title: "세계 당뇨의 날",
        category: "캠페인",
        desc: "당뇨병 예방·관리 캠페인. 무료 혈당 검사, 당뇨 교육 프로그램.",
        printItems: ["당뇨 예방 포스터", "혈당 관리 안내서", "배너"],
      },
      {
        date: "11월 중",
        title: "독감 예방접종 집중 기간",
        category: "예방접종",
        desc: "어린이·임신부 인플루엔자 예방접종 집중 시행. 일반 성인 접종 독려.",
        printItems: ["접종 독려 포스터", "임신부 접종 안내 리플릿"],
      },
      {
        date: "11월 중",
        title: "연말 예산 집행 마감 준비",
        category: "행정",
        desc: "연말 보건 사업 예산 집행 마감. 내년도 사업 계획 수립 및 발주 준비.",
        printItems: ["내년도 홍보물 사전 발주"],
      },
    ],
  },
  {
    month: "2026년 12월",
    key: "2026-12",
    color: "bg-pink-500",
    lightColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
    events: [
      {
        date: "12월 1일",
        title: "세계 에이즈의 날",
        category: "캠페인",
        desc: "HIV/AIDS 예방 및 인식 개선 캠페인. 무료 HIV 검사 행사.",
        printItems: ["에이즈 예방 포스터", "리플릿", "배너"],
      },
      {
        date: "12월 중",
        title: "국가건강검진 연말 마감",
        category: "검진",
        desc: "국가건강검진 연말 마감(12월 31일). 미수검자 최종 독려 안내.",
        printItems: ["마감 안내 포스터", "최종 독려 안내문"],
      },
      {
        date: "12월 중",
        title: "내년도 사업 계획 수립",
        category: "행정",
        desc: "2027년도 보건 사업 계획 수립. 홍보물 사전 발주 및 예산 편성.",
        printItems: ["2027년 연간 홍보물 사전 발주"],
      },
    ],
  },
  {
    month: "2027년 1월",
    key: "2027-01",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-700",
    events: [
      {
        date: "1월 중",
        title: "새해 건강 목표 캠페인",
        category: "건강증진",
        desc: "금연·절주·운동·영양 등 건강 생활 실천 캠페인. 신년 건강 다짐 행사.",
        printItems: ["새해 건강 다짐 포스터", "건강 목표 수첩", "배너"],
      },
      {
        date: "1월 중",
        title: "독감 예방접종 지속 (4월까지)",
        category: "예방접종",
        desc: "2026-2027절기 인플루엔자 예방접종 지속 시행(~2027년 4월 30일).",
        printItems: ["접종 안내 포스터"],
      },
    ],
  },
  {
    month: "2027년 2월",
    key: "2027-02",
    color: "bg-violet-500",
    lightColor: "bg-violet-50",
    borderColor: "border-violet-200",
    textColor: "text-violet-700",
    events: [
      {
        date: "2월 4일",
        title: "세계 암의 날",
        category: "캠페인",
        desc: "암 예방 및 조기 검진 홍보. 5대 암 검진 독려 캠페인.",
        printItems: ["암 예방 포스터", "5대 암 검진 안내 리플릿", "배너"],
      },
      {
        date: "2월 중",
        title: "설 연휴 감염병 예방 안내",
        category: "방역",
        desc: "설 연휴 전후 노로바이러스·독감 등 감염병 예방 홍보.",
        printItems: ["감염병 예방 포스터", "손씻기 안내 스티커"],
      },
      {
        date: "2월 중",
        title: "상반기 건강검진 사전 안내",
        category: "검진",
        desc: "2027년 국가건강검진 대상자 사전 안내 발송.",
        printItems: ["검진 안내문", "대상자 통보서"],
      },
    ],
  },
  {
    month: "2027년 3월",
    key: "2027-03",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    events: [
      {
        date: "3월 3일",
        title: "세계 청각의 날",
        category: "캠페인",
        desc: "청각 건강 인식 제고 캠페인. 청력 검사 홍보.",
        printItems: ["청각 건강 포스터"],
      },
      {
        date: "3월 21일",
        title: "암 예방의 날",
        category: "캠페인",
        desc: "암 예방 수칙 홍보. 금연·절주·건강식·운동 캠페인.",
        printItems: ["암 예방 포스터", "암 예방 수칙 리플릿", "현수막"],
      },
      {
        date: "3월 24일",
        title: "세계 결핵의 날",
        category: "캠페인",
        desc: "결핵 예방 및 조기 발견 홍보. 결핵 검진 독려.",
        printItems: ["결핵 예방 포스터", "검진 안내 리플릿"],
      },
      {
        date: "3월 중",
        title: "봄철 황사·미세먼지 대비 캠페인",
        category: "환경보건",
        desc: "황사·미세먼지 건강 피해 예방 홍보. 마스크 착용 안내.",
        printItems: ["미세먼지 대비 포스터", "건강 수칙 리플릿"],
      },
    ],
  },
  {
    month: "2027년 4월",
    key: "2027-04",
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-300",
    textColor: "text-blue-800",
    events: [
      {
        date: "4월 7일",
        title: "보건의 날 (세계 보건의 날)",
        category: "기념일",
        desc: "2027년 보건의 날 기념 행사. 연간 보건 사업 성과 발표.",
        printItems: ["기념 현수막", "포스터", "홍보 책자"],
      },
      {
        date: "4월 30일",
        title: "독감 예방접종 종료",
        category: "예방접종",
        desc: "2026-2027절기 인플루엔자 국가예방접종 종료.",
        printItems: ["종료 안내 포스터"],
      },
      {
        date: "4월 중",
        title: "2027년 국가건강검진 시작",
        category: "검진",
        desc: "2027년 국가건강검진 본격 시행. 대상자 안내 및 검진 기관 홍보.",
        printItems: ["검진 안내 포스터", "대상자 통보서"],
      },
    ],
  },
];

const categoryColors: Record<string, string> = {
  캠페인: "bg-blue-100 text-blue-700",
  기념일: "bg-purple-100 text-purple-700",
  검진: "bg-green-100 text-green-700",
  예방접종: "bg-orange-100 text-orange-700",
  금연: "bg-red-100 text-red-700",
  구강보건: "bg-teal-100 text-teal-700",
  방역: "bg-yellow-100 text-yellow-700",
  정신건강: "bg-pink-100 text-pink-700",
  치매: "bg-indigo-100 text-indigo-700",
  행정: "bg-gray-100 text-gray-700",
  건강증진: "bg-emerald-100 text-emerald-700",
  환경보건: "bg-lime-100 text-lime-700",
  식품위생: "bg-amber-100 text-amber-700",
  응급: "bg-rose-100 text-rose-700",
};

const categories = ["전체", "캠페인", "기념일", "검진", "예방접종", "금연", "구강보건", "방역", "정신건강", "치매", "건강증진", "행정", "환경보건", "식품위생", "응급"];

// 월별 요약 표 데이터
const MONTHLY_SUMMARY = [
  { month: "4월", year: "2026", keyEvent: "보건의 날 / 국가건강검진 시작", category: "검진·기념일", printItems: "포스터, 현수막, 검진 안내문", orderTiming: "3월 중순", budget: 180000, urgency: "high" },
  { month: "5월", year: "2026", keyEvent: "세계 금연의 날 (5/31)", category: "금연·캠페인", printItems: "금연 포스터, 리플릿, 현수막, 배너", orderTiming: "5월 중순", budget: 220000, urgency: "high" },
  { month: "6월", year: "2026", keyEvent: "구강 보건의 날 (6/9)", category: "구강보건·방역", printItems: "구강 포스터, 리플릿, 방역 안내문", orderTiming: "5월 말", budget: 150000, urgency: "medium" },
  { month: "7월", year: "2026", keyEvent: "여름철 식중독 예방 캠페인", category: "식품위생·응급", printItems: "식중독 포스터, 스티커, 현수막", orderTiming: "6월 말", budget: 120000, urgency: "medium" },
  { month: "8월", year: "2026", keyEvent: "자살예방의 달 캠페인", category: "정신건강·검진", printItems: "생명존중 포스터, 안내 리플릿", orderTiming: "7월 말", budget: 130000, urgency: "medium" },
  { month: "9월", year: "2026", keyEvent: "독감 예방접종 시작 (9/22~)", category: "예방접종·치매", printItems: "독감 접종 포스터, 접종 일정표, 현수막", orderTiming: "9월 상순", budget: 280000, urgency: "urgent" },
  { month: "10월", year: "2026", keyEvent: "독감 접종 확대 (65세 이상)", category: "예방접종·검진", printItems: "접종 확대 포스터, 현수막, 검진 마감 안내문", orderTiming: "9월 말", budget: 250000, urgency: "urgent" },
  { month: "11월", year: "2026", keyEvent: "세계 당뇨의 날 (11/14)", category: "캠페인·행정", printItems: "당뇨 포스터, 혈당 관리 안내서", orderTiming: "10월 말", budget: 160000, urgency: "medium" },
  { month: "12월", year: "2026", keyEvent: "세계 에이즈의 날 (12/1)", category: "캠페인·검진 마감", printItems: "에이즈 포스터, 검진 마감 안내문", orderTiming: "11월 말", budget: 140000, urgency: "medium" },
  { month: "1월", year: "2027", keyEvent: "새해 건강 목표 캠페인", category: "건강증진·예방접종", printItems: "새해 건강 포스터, 건강 목표 수첩", orderTiming: "12월 말", budget: 100000, urgency: "low" },
  { month: "2월", year: "2027", keyEvent: "세계 암의 날 (2/4)", category: "캠페인·검진", printItems: "암 예방 포스터, 5대 암 검진 리플릿", orderTiming: "1월 말", budget: 170000, urgency: "medium" },
  { month: "3월", year: "2027", keyEvent: "암 예방의 날 (3/21)", category: "캠페인·방역", printItems: "암 예방 포스터, 현수막, 미세먼지 리플릿", orderTiming: "3월 상순", budget: 190000, urgency: "high" },
  { month: "4월", year: "2027", keyEvent: "보건의 날 / 국가건강검진 시작", category: "검진·기념일", printItems: "포스터, 현수막, 검진 안내문", orderTiming: "3월 말", budget: 180000, urgency: "high" },
];

// 예산 배분 현황 데이터
const BUDGET_ALLOCATION = [
  { category: "예방접종", amount: 530000, percent: 27, items: "독감 접종 안내문, 포스터, 현수막", color: "bg-orange-500", lightColor: "bg-orange-50", textColor: "text-orange-700" },
  { category: "캠페인 홍보물", amount: 390000, percent: 20, items: "금연·암·당뇨 포스터, 리플릿, 배너", color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-700" },
  { category: "검진 안내", amount: 310000, percent: 16, items: "검진 안내문, 대상자 통보서, 독려 안내문", color: "bg-green-500", lightColor: "bg-green-50", textColor: "text-green-700" },
  { category: "현수막·배너", amount: 270000, percent: 14, items: "실내외 현수막, 롤업 배너, X배너", color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-700" },
  { category: "리플릿·안내서", amount: 195000, percent: 10, items: "3단 리플릿, 안내서, 소재지", color: "bg-teal-500", lightColor: "bg-teal-50", textColor: "text-teal-700" },
  { category: "스티커·명함", amount: 155000, percent: 8, items: "예방 안내 스티커, 명함, 라벨", color: "bg-pink-500", lightColor: "bg-pink-50", textColor: "text-pink-700" },
  { category: "디지털 홍보", amount: 100000, percent: 5, items: "SNS 콘텐츠, 전자 현수막, 이메일 템플릿", color: "bg-indigo-500", lightColor: "bg-indigo-50", textColor: "text-indigo-700" },
];

export default function AnnualPlan() {
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set(["2026-04"]));
  const [filterCategory, setFilterCategory] = useState<string>("전체");
  const [mainTab, setMainTab] = useState<"table" | "budget" | "accordion">("table");

  const toggleMonth = (key: string) => {
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => setOpenMonths(new Set(months.map((m) => m.key)));
  const collapseAll = () => setOpenMonths(new Set());

  const totalBudget = BUDGET_ALLOCATION.reduce((acc, b) => acc + b.amount, 0);

  const filteredMonths = months
    .map((m) => ({
      ...m,
      events: filterCategory === "전체" ? m.events : m.events.filter((e) => e.category === filterCategory),
    }))
    .filter((m) => m.events.length > 0);

  const totalEvents = months.reduce((acc, m) => acc + m.events.length, 0);
  const totalPrintItems = months.reduce((acc, m) => acc + m.events.reduce((a, e) => a + e.printItems.length, 0), 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-3 flex-wrap">
              <Link href="/about" className="hover:text-white transition-colors">회사소개</Link>
              <span>›</span>
              <Link href="/dashboard" className="hover:text-white transition-colors">대시보드</Link>
              <span>›</span>
              <span className="text-white">연간 계획표</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">보건소 연간 사업 계획표</h1>
            <p className="text-blue-100 text-sm md:text-base max-w-2xl leading-relaxed">
              2026년 4월 ~ 2027년 4월 · 보건소 주요 캠페인·검진·예방접종 일정과 추천 홍보물을 확인하세요.
              예산 집행 시기에 맞춰 미리 발주 계획을 세울 수 있습니다.
            </p>
            <div className="flex gap-6 mt-5">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalEvents}</div>
                <div className="text-blue-200 text-xs">총 이벤트</div>
              </div>
              <div className="w-px bg-blue-400" />
              <div className="text-center">
                <div className="text-2xl font-bold">{totalPrintItems}</div>
                <div className="text-blue-200 text-xs">홍보물 품목</div>
              </div>
              <div className="w-px bg-blue-400" />
              <div className="text-center">
                <div className="text-2xl font-bold">13</div>
                <div className="text-blue-200 text-xs">개월</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* 메인 탭 전환 */}
          <div className="flex gap-1 bg-[#f5f5f7] p-1 rounded-2xl w-fit mb-6">
            {([
              { id: "table" as const, icon: Table2, label: "월별 일정 표" },
              { id: "budget" as const, icon: BarChart3, label: "예산 배분 현황" },
              { id: "accordion" as const, icon: LayoutList, label: "상세 보기" },
            ]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setMainTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  mainTab === id
                    ? "bg-white text-[#1d1d1f] shadow-sm"
                    : "text-[#86868b] hover:text-[#424245]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ① 월별 일정 표 */}
          {mainTab === "table" && (
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-black/5 bg-gradient-to-r from-[#EBF4FF] to-[#F0F7FF]">
                <h2 className="text-[15px] font-bold text-[#1d1d1f]">2026~2027 월별 케페인 일정 요약표</h2>
                <p className="text-[12px] text-[#86868b] mt-0.5">주요 이벤트 및 추천 홍보물 발주 시기를 한눈에 확인하세요</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-black/5">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase whitespace-nowrap">월</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">주요 이벤트</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase whitespace-nowrap">카테고리</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">추천 홍보물</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase whitespace-nowrap">발주 권장 시기</th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase whitespace-nowrap">예산(원)</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">시급도</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/4">
                    {MONTHLY_SUMMARY.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#fafafa] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-[#1d1d1f]">{row.month}</span>
                            <span className="text-[10px] text-[#86868b]">{row.year}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13px] font-medium text-[#1d1d1f]">{row.keyEvent}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[11px] text-[#424245] bg-[#f5f5f7] px-2 py-0.5 rounded-full">{row.category}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[12px] text-[#86868b]">{row.printItems}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[12px] font-medium text-[#424245]">{row.orderTiming}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">{row.budget.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.urgency === "urgent" ? "bg-red-100 text-red-700" :
                            row.urgency === "high" ? "bg-orange-100 text-orange-700" :
                            row.urgency === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {row.urgency === "urgent" ? "긴급" : row.urgency === "high" ? "높음" : row.urgency === "medium" ? "보통" : "낙음"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F0F7FF] border-t-2 border-[#00A39B]/20">
                      <td colSpan={5} className="px-4 py-3 text-[13px] font-bold text-[#1d1d1f]">합계</td>
                      <td className="px-4 py-3 text-right text-[14px] font-extrabold text-[#00A39B] whitespace-nowrap">
                        {MONTHLY_SUMMARY.reduce((acc, r) => acc + r.budget, 0).toLocaleString()}원
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="px-6 py-3 bg-[#fafafa] border-t border-black/5">
                <p className="text-[11px] text-[#86868b]">* 예산은 예시 기준이며 실제 집행 시 변동될 수 있습니다. 발주 권장 시기는 일반 홍보물 기준입니다.</p>
              </div>
            </div>
          )}

          {/* ② 예산 배분 현황 */}
          {mainTab === "budget" && (
            <div className="space-y-4 mb-6">
              {/* 요약 카드 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm text-center">
                  <p className="text-[12px] text-[#86868b] mb-1">연간 총 예산</p>
                  <p className="text-[28px] font-extrabold text-[#1d1d1f] tracking-tight">2,000,000</p>
                  <p className="text-[13px] text-[#424245] font-medium">원</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm text-center">
                  <p className="text-[12px] text-[#86868b] mb-1">집행 완료</p>
                  <p className="text-[28px] font-extrabold text-[#16a34a] tracking-tight">440,000</p>
                  <p className="text-[13px] text-[#424245] font-medium">원 (22%)</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm text-center">
                  <p className="text-[12px] text-[#86868b] mb-1">잔여 예산</p>
                  <p className="text-[28px] font-extrabold text-[#00A39B] tracking-tight">1,560,000</p>
                  <p className="text-[13px] text-[#424245] font-medium">원 (78%)</p>
                </div>
              </div>

              {/* 카테고리별 예산 배분 표 */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-black/5 bg-gradient-to-r from-[#EBF4FF] to-[#F0F7FF]">
                  <h2 className="text-[15px] font-bold text-[#1d1d1f]">카테고리별 예산 배분 현황</h2>
                  <p className="text-[12px] text-[#86868b] mt-0.5">2026년 연간 인쇄 예산 배분 계획 (2,000,000원 기준)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F5F5F7] border-b border-black/5">
                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">카테고리</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">주요 인쇄물</th>
                        <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">배정 예산</th>
                        <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">비율</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">비율 바</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/4">
                      {BUDGET_ALLOCATION.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#fafafa] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                              <span className="text-[13px] font-semibold text-[#1d1d1f]">{row.category}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[12px] text-[#86868b]">{row.items}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="text-[14px] font-bold text-[#1d1d1f]">{row.amount.toLocaleString()}원</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`text-[13px] font-semibold ${row.textColor}`}>{row.percent}%</span>
                          </td>
                          <td className="px-5 py-4" style={{ minWidth: 160 }}>
                            <div className="w-full bg-[#f5f5f7] rounded-full h-2">
                              <div
                                className={`${row.color} h-2 rounded-full transition-all`}
                                style={{ width: `${row.percent}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#F0F7FF] border-t-2 border-[#00A39B]/20">
                        <td colSpan={2} className="px-5 py-3 text-[13px] font-bold text-[#1d1d1f]">합계</td>
                        <td className="px-5 py-3 text-right text-[15px] font-extrabold text-[#00A39B]">{totalBudget.toLocaleString()}원</td>
                        <td className="px-5 py-3 text-right text-[13px] font-bold text-[#00A39B]">100%</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-black/5 bg-[#fafafa]">
                  <div className="flex flex-wrap gap-3">
                    {BUDGET_ALLOCATION.map((row) => (
                      <div key={row.category} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                        <span className="text-[11px] text-[#424245]">{row.category} {row.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ③ 상세 보기 (기존 아코디언) */}
          {mainTab === "accordion" && (
            <>
              {/* 발주 가이드 배너 */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">⏰</span>
                <div className="text-sm">
                  <span className="font-semibold text-amber-800">발주 추천 시기: </span>
                  <span className="text-amber-700">일반 홍보물 <strong>2주 전</strong> · 현수막·배너 <strong>3주 전</strong> · 대량 인쇄물(1,000부↑) <strong>4주 전</strong> 발주를 권장합니다.</span>
                </div>
              </div>

              {/* 카테고리 필터 + 전체 펼치기/접기 */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filterCategory === cat
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={expandAll} className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    전체 펼치기
                  </button>
                  <button onClick={collapseAll} className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition-colors">
                    전체 접기
                  </button>
                </div>
              </div>

              {/* 월별 아코디언 */}
              <div className="space-y-3">
                {filteredMonths.map((monthData) => {
                  const isOpen = openMonths.has(monthData.key);
                  return (
                    <div
                      key={monthData.key}
                      className={`bg-white rounded-2xl border overflow-hidden transition-shadow ${
                        isOpen ? "shadow-md" : "shadow-sm hover:shadow-md"
                      } ${monthData.borderColor}`}
                    >
                      <button onClick={() => toggleMonth(monthData.key)} className="w-full text-left">
                        <div className={`px-5 py-4 flex items-center justify-between ${monthData.lightColor}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${monthData.color}`} />
                            <h2 className={`text-base font-bold ${monthData.textColor} whitespace-nowrap`}>{monthData.month}</h2>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{monthData.events.length}개 이벤트</span>
                            <div className="hidden md:flex flex-wrap gap-1 min-w-0">
                              {Array.from(new Set(monthData.events.map((e) => e.category))).slice(0, 4).map((cat) => (
                                <span key={cat} className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${categoryColors[cat] || "bg-gray-100 text-gray-600"}`}>{cat}</span>
                              ))}
                            </div>
                          </div>
                          <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {!isOpen && (
                        <div className="px-5 py-2.5 flex flex-wrap gap-1.5">
                          {monthData.events.slice(0, 3).map((event, idx) => (
                            <span key={idx} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg whitespace-nowrap">{event.date} {event.title}</span>
                          ))}
                          {monthData.events.length > 3 && (
                            <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">+{monthData.events.length - 3}개 더보기</span>
                          )}
                        </div>
                      )}
                      {isOpen && (
                        <div className="divide-y divide-gray-100">
                          {monthData.events.map((event, idx) => (
                            <div key={idx} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                              <div className="flex flex-col md:flex-row md:items-start gap-3">
                                <div className="flex-shrink-0">
                                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${monthData.lightColor} ${monthData.textColor}`}>{event.date}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 text-sm">{event.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${categoryColors[event.category] || "bg-gray-100 text-gray-600"}`}>{event.category}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-2 leading-relaxed">{event.desc}</p>
                                  <div className="flex flex-wrap gap-1.5 items-center">
                                    <span className="text-xs text-gray-400">추천 홍보물:</span>
                                    {event.printItems.map((item, i) => (
                                      <span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{item}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <Link href="/dashboard">
                                    <button className={`text-xs px-3 py-1.5 rounded-lg font-medium text-white whitespace-nowrap ${monthData.color} hover:opacity-90 transition-opacity`}>발주하기 →</button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 출체 안내 */}
              <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  발주 가이드 요약
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="font-semibold text-green-700 text-xs mb-1">✅ 일반 홍보물</div>
                    <p className="text-green-600 text-xs">포스터, 리플릿, 스티커 등<br />행사 <strong>2주 전</strong> 발주 권장</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3">
                    <div className="font-semibold text-orange-700 text-xs mb-1">⚡ 대형 현수막·배너</div>
                    <p className="text-orange-600 text-xs">현수막, 배너, 롤업 등<br />행사 <strong>3주 전</strong> 발주 권장</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="font-semibold text-blue-700 text-xs mb-1">📦 대량 인쇄물</div>
                    <p className="text-blue-600 text-xs">1,000부 이상 대량 발주<br />행사 <strong>4주 전</strong> 발주 권장</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">출체: 보건복지부, 한국건강증진개발원, WHO 글로벌 헬스 데이 · 세부 일정은 매년 변동될 수 있으며, 추후 정확한 내용으로 업데이트 예정입니다.</p>
              </div>

              {/* 하단 CTA */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm mb-3">월별 세부 일정 및 발주 가이드가 필요하신가요?</p>
                <a href="tel:032-000-0000" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors text-sm">
                  📞 고객센터 문의 032-000-0000
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
