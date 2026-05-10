# 보건소플러스 리팩토링 TODO

## Phase 1: 관리자 파일 정리
- [ ] 관리자 페이지 파일 /admin 디렉토리로 이동
- [ ] AdminLayout.tsx 이동
- [ ] App.tsx에서 불필요한 import 정리
- [ ] NotificationContext, TemplateContext 정리 (관리자 전용)

## Phase 2-1: CenterContext 분리
- [ ] CenterContext.tsx → 기관 관리만 담당 (600줄 이하)
- [ ] DepartmentContext.tsx 생성 (부서 관리)
- [ ] CodeManagementContext.tsx 생성 (코드 관리)
- [ ] App.tsx Provider 업데이트
- [ ] 기존 import 경로 업데이트

## Phase 2-2: Intro.tsx 분리
- [ ] CodeInputStep.tsx 생성
- [ ] DepartmentSelectStep.tsx 생성
- [ ] Intro.tsx 메인 로직 간소화

## Phase 2-3: 타입 안정성 강화
- [ ] types/index.ts 공유 타입 정의
- [ ] 각 Context에 타입 적용

## Phase 3: 성능 최적화
- [ ] React.lazy 동적 import 적용
- [ ] useMemo/useCallback 최적화

## Phase 4: 최종 테스트
- [ ] 전체 페이지 동작 확인
- [ ] 체크포인트 저장

## Admin.tsx tRPC/DB 마이그레이션 (2026-04-24 완료)
- [x] DB 스키마 확인 (registeredCenters, signupRequests, adminSettings)
- [x] server/db.ts에 deleteAllRegisteredCenters, deleteAllSignupRequests 추가
- [x] server/routers.ts에 centers.delete/requests.delete deleteAll 옵션 추가
- [x] Admin.tsx - DBCenter, DBRequest 타입 정의 추가
- [x] Admin.tsx - dbCenterToUI, dbRequestToUI 변환 함수 추가
- [x] Admin.tsx - centers, requests 상태를 tRPC query 기반으로 교체
- [x] Admin.tsx - localStorage 기반 centers/requests useEffect 제거
- [x] Admin.tsx - handleLogin → verifyPasswordMutation
- [x] Admin.tsx - handleChangePw → changePasswordMutation
- [x] Admin.tsx - handleAddCenter → createCenterMutation
- [x] Admin.tsx - handleDeleteCenter → deleteCenterMutation
- [x] Admin.tsx - handleStartApprove/handleConfirmApprove/handleReject → updateRequestMutation
- [x] Admin.tsx - 데이터 초기화 → deleteAll mutation
- [x] Admin.tsx - 마스터 탭 저장 시 centers 동기화 → DB mutation
- [x] vitest 테스트 작성 (15개 테스트 통과)

## 로그인 검증 강화 (2026-04-24)
- [x] 미등록 보건소 사용자가 임의 코드로 로그인 가능한 버그 수정
- [x] 등록된 보건소+코드(issuedCode) 기반 검증 로직 구현
- [x] 미등록 보건소 접근 시 명확한 오류 메시지 표시

## DB 등록 보건소 정보 우선 표시 (2026-04-24)
- [x] 관리자 DB에 등록된 보건소의 주소/전화번호를 정적 데이터보다 우선 표시
- [x] Intro.tsx 코드 입력(handleCodeEnter) 및 드릴다운(handleEnter) 모두 DB 데이터 우선 반영 완료
- [x] SignupTab.tsx handleCenterSelect에서 DB 데이터 우선 반영 완료 (trpc.useUtils() + async 변환)

## SignupTab.tsx 근본 재작성 (2026-04-24)
- [x] centers.verify API 반환 구조 수정: dbCenter?.address → dbCenter?.center?.address
- [x] STATIC_BIZ_MAP 하드코딩 제거 (ICN003 등 정적 맵 삭제)
- [x] getExistingBizNumber localStorage 기반 함수 제거 → handleCenterSelect에서 DB 직접 조회
- [x] handleSubmit localStorage 저장 → tRPC requests.create mutation으로 전환
- [x] generateIssuedCode localStorage 기반 → DB allRequests 기반으로 전환
- [x] routers.ts requests.create에 issuedCode, status 파라미터 추가
- [x] 보건소 선택 중 로딩 스피너(isCenterLoading) 추가
- [x] 가입신청 제출 중 로딩 상태(isSubmitting) 추가

## 부서 코드 직접 입력 방식 전환 (2026-04-24)
- [x] 자동 생성 로직(DEPT_INITIALS, getDeptInitial, getNextSeq, generateIssuedCode) 제거
- [x] 사용자가 4자리 숫자+영문 자유조합으로 직접 입력하는 UI 추가
- [x] 실시간 중복 검증 (500ms 디바운스, requests.checkCode API)
- [x] 제출 직전 최종 중복 검증 (handleSubmit 내)
- [x] 서버 requests.checkCode API 추가
- [x] 빌드 성공 확인

## 헤더 서브 메뉴 → 카테고리 페이지 이동 (2026-04-26)
- [x] Layout.tsx: 헤더 Desktop Navigation (카테고리 드롭다운 메뉴) 제거
- [x] CategoryPage.tsx: 브레드크럼 아래, 상품 목록 위에 카테고리 서브 메뉴 탭 바 추가 (일반 카테고리)
- [x] CategoryPage.tsx: 사업별(biz) 카테고리는 기존 BizTabBar 유지 (이미 브레드크럼 아래 위치)
- [x] 빌드 테스트 성공 (TypeScript 오류 0개)

## Dashboard 카테고리 이미지 동기화 (2026-04-30)
- [x] CategoryPage.tsx productImages에 7개 카테고리 추가 (sticker, form, promo, calendar, signage, largeformat, digital)
- [x] Dashboard 대표 이미지를 CategoryPage 상품 그리드 첫 번째 이미지로 동기화
- [x] getProductImage 함수로 카테고리별 이미지 조회 로직 확인

## 명함 섹션 UI 개선 (2026-04-30)
- [x] 앞면/뒷면 버튼을 제목 왼쪽으로 이동
- [x] flex items-center gap-3 레이아웃으로 버튼과 제목 정렬
- [x] justify-between 제거하여 버튼이 제목 옆에 위치하도록 변경

## 명함 서브 탭 개선 (2026-04-30)
- [x] 명함 카테고리 서브 탭을 "표준명함 (90×50mm)"\uacfc "우리 보건소 명함" 2개만 표시
- [x] "전체보기" 및 다른 탭 제거
- [x] "표준명함 (90×50mm)"\uc744 기본 선택 상태로 설정
- [x] 각 탭 클릭 시 해당 상품들이 같은 페이지에서 표시되도록 변경 (페이지 이동 없음)

## 표준명함 8종 데이터 수정 (2026-04-30)
- [x] namecard-standard 데이터를 1종에서 A~H 타입 8종으로 수정
- [x] 데이터 동기화 대략 완료
## 탐남 버튼 컨라 토단매너 통일 (2026-04-30)
- [x] 명함 앞면/뒷면 탭 버튼 활성 상태 배경색을 검정색(#1d1d1f)에서 청록색(#00A39B)으로 변경
- [x] 포스터 필터 버튼 활성 상태 배경색을 검정색(#1d1d1f)에서 청록색(#00A39B)으로 변경
- [x] 호버 상태 컨라도 청록색으로 통일
- [x] 명함 배너 그래디언트 색상을 검정색(#00A39B)으로 변경
- [x] namecard-standard, namecard-regional 배너 추가 및 그래디언트 색상 설정
- [x] 명함 서브 탭 버튼 활성 상태 배경색을 검정색(#1d1d1f)에서 청록색(#00A39B)으로 변경

## 스티커 상품 순서 변경 (2026-04-30)
- [x] 일반지 스티커 순서를 (원형) → (사각)에서 (사각) → (원형)으로 변경

## 상품 이미지 패딩 스타일 조정 (2026-04-30)
- [x] 상품 카드 이미지에 패딩 추가 (paddingTop: 18px, paddingRight: 20px, paddingLeft: 20px)
- [x] 이미지 레이아웃 미세 조정으로 시각적 개선

## 일반지 스티커 사각 이미지 추가 (2026-04-30)
- [x] 금연 스티커 이미지를 S3에 업로드
- [x] productImages의 sticker 배열에 금연 스티커 이미지 추가
- [x] 일반지 스티커 (사각) 상품이 금연 스티커 이미지로 표시되도록 설정

## Masonry 레이아웃 및 호버 효과 개선 (2026-04-30)
- [x] 스티커 카테고리(1020) Masonry 레이아웃 이미지 로드 감지 로직 수정
- [x] 이미지 로드 후 비율 감지하여 동적 크기 조정 (가로형 2칸, 세로형 2칸)
- [x] 스티커 카테고리 호버 효과 분리 (scale 1.05, 명함은 scale 1.44 유지)
- [x] 명함 뒷면 카드에 호버 오버레이 효과 추가 (검은색 그래디언트 + 텍스트)
- [x] 모든 테스트 통과 (15/15)

## Responsive Masonry 레이아웃 구현 (2026-04-30)
- [x] 스티커 카테고리(1020) 전용 그리드 설정 (gridAutoFlow: dense)
- [x] 이미지 비율 감지 로직 (onLoad 이벤트)
- [x] 동적 크기 조정 (가로형 2칸, 세로형 2칸)
- [x] 이미지 컨테이너 최소 높이 설정 (minHeight: 200px)
- [x] 모든 테스트 통과 (15/15)


## Masonry 레이아웃 최종 구현 (2026-04-30)
- [x] 스티커 Masonry 예시 이미지 30개 생성 (정사각형 12개, 가로형 9개, 세로형 9개)
- [x] StickerMasonryGrid 컴포넌트 작성 (CSS Grid + gridAutoFlow: dense)
- [x] 스티커 일반지(sticker-general) 카테고리에 Masonry 레이아웃 적용
- [x] 다른 카테고리(명함, 일반서식, 홍보물 등) 기존 방식 유지
- [x] 이미지 비율 감지 로직 구현 (가로형 2칸, 세로형 2칸)
- [x] 호버 효과 적용 (scale 1.05)
- [x] 모든 테스트 통과 (15/15)
- [x] 브라우저 직접 테스트 완료 (스티커 Masonry 정상 작동, 명함 기존 방식 유지)


## StickerMasonryGrid 컴포넌트 개선 (2026-04-30)
- [x] ref 콜백 방식 → useEffect 기반으로 변경
- [x] 이미지 로드 감지 로직 안정화 (img.complete 체크 + load 이벤트)
- [x] gridColumn/gridRow span 스타일 정상 적용 확인
- [x] 가로형 이미지 (ratio > 1.4) → gridColumn: span 2
- [x] 세로형 이미지 (ratio < 0.7) → gridRow: span 2
- [x] 정사각형 이미지 (0.7 ≤ ratio ≤ 1.4) → span 1
- [x] gridAutoFlow: dense로 공백 최소화
- [x] 브라우저 콘솔 검사로 span 스타일 적용 확인
- [x] 모든 테스트 통과 (15/15)

## Masonry 레이아웃 제거 및 스티커 카드 독립 구성 (2026-04-30)
- [x] StickerMasonryGrid 컴포넌트 삭제
- [x] CategoryPage.tsx에서 StickerMasonryGrid import 제거
- [x] Masonry 렌더링 조건 제거 (categoryKey !== "sticker-general")
- [x] 1020 관련 조건 제거
- [x] 스티커 카드 구성 새로 작성 (명함 카드 기반)
- [x] 스티커 카드 그리드: 4열 고정 레이아웃
- [x] 스티커 카드 호버: scale 1.05 (명함은 1.44 유지)
- [x] 스티커 카드 오버레이: 호버 시 상품명과 설명 표시
- [x] 명함과 스티커 완전 독립 작동 확인
- [x] 브라우저 테스트: 스티커 4열 정렬, 명함 4열 정렬 모두 정상
- [x] 모든 테스트 통과 (15/15)
