import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAdminSetting,
  setAdminSetting,
  getAllRegisteredCenters,
  createRegisteredCenter,
  updateRegisteredCenter,
  deleteRegisteredCenter,
  deleteAllRegisteredCenters,
  getAllSignupRequests,
  createSignupRequest,
  updateSignupRequest,
  deleteSignupRequest,
  deleteAllSignupRequests,
  getDeptsByCenterCode,
  getNamecardDesignByDeptCode,
  getAllNamecardDesigns,
  searchNamecardDesignsByName,
  createNamecardDesign,
  updateNamecardDesign,
  deleteNamecardDesign,
  getSavedDesignCombos,
  createSavedDesignCombo,
  deleteSavedDesignCombo,
  getSharedDesignCombos,
  updateSavedDesignComboShared,
  verifyIssuedCode,
  getBusinessInfoByCenterCode,
  getAllBusinessInfo,
  createBusinessInfo,
  updateBusinessInfo,
  deleteBusinessInfo,
} from "./db";
import { notifyOwner } from "./_core/notification";

const DEFAULT_ADMIN_PASSWORD = "admin1234";
const ADMIN_PW_KEY = "admin_password";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Next.js fetch adapter: Set-Cookie 헤더로 쿠키 만료 처리
      ctx.resHeaders.append(
        "Set-Cookie",
        `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=None`
      );
      return { success: true } as const;
    }),
  }),

  // ── 관리자 인증 ──────────────────────────────────────────
  admin: router({
    // 비밀번호 확인 (로그인)
    verifyPassword: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const stored = await getAdminSetting(ADMIN_PW_KEY);
        const current = stored ?? DEFAULT_ADMIN_PASSWORD;
        if (input.password !== current) {
          throw new Error("비밀번호가 올바르지 않습니다.");
        }
        return { success: true };
      }),

    // 비밀번호 변경
    changePassword: publicProcedure
      .input(z.object({ currentPassword: z.string(), newPassword: z.string().min(4) }))
      .mutation(async ({ input }) => {
        const stored = await getAdminSetting(ADMIN_PW_KEY);
        const current = stored ?? DEFAULT_ADMIN_PASSWORD;
        if (input.currentPassword !== current) {
          throw new Error("현재 비밀번호가 올바르지 않습니다.");
        }
        await setAdminSetting(ADMIN_PW_KEY, input.newPassword);
        return { success: true };
      }),
  }),

  // ── 등록 보건소 ──────────────────────────────────────────
  centers: router({
    list: publicProcedure.query(async () => {
      return getAllRegisteredCenters();
    }),

    create: publicProcedure
      .input(z.object({
        centerCode: z.string(),
        centerName: z.string(),
        bizNo: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        region: z.string().optional(),
        representative: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createRegisteredCenter(input);
        return { success: true };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        centerCode: z.string().optional(),
        centerName: z.string().optional(),
        bizNo: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        region: z.string().optional(),
        representative: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateRegisteredCenter(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number().optional(), deleteAll: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        if (input.deleteAll) {
          await deleteAllRegisteredCenters();
        } else if (input.id != null) {
          await deleteRegisteredCenter(input.id);
        }
        return { success: true };
      }),

    // 보건소 등록 여부 확인 (로그인 시 사용)
    // registered_centers 테이블 OR signup_requests에서 approved 상태인 항목이 있으면 등록된 보건소로 간주
    verify: publicProcedure
      .input(z.object({ centerCode: z.string() }))
      .query(async ({ input }) => {
        // 1차: registered_centers 테이블에서 확인
        const registeredList = await getAllRegisteredCenters();
        const foundInRegistered = registeredList.find(c => c.centerCode === input.centerCode);
        if (foundInRegistered) {
          return { registered: true, center: foundInRegistered };
        }
        // 2차: signup_requests에서 approved 상태인 항목 확인
        const allRequests = await getAllSignupRequests();
        const approvedRequest = allRequests.find(
          r => r.centerCode === input.centerCode && r.status === "approved"
        );
        if (approvedRequest) {
          return {
            registered: true,
            center: {
              id: approvedRequest.id,
              centerCode: approvedRequest.centerCode,
              centerName: approvedRequest.centerName,
              address: null,
              phone: null, // signup_requests.phone은 담당자 전화번호이므로 보건소 대표번호로 사용하지 않음
              region: null,
              bizNo: approvedRequest.bizNo ?? null,
              representative: null,
              createdAt: approvedRequest.createdAt,
              updatedAt: approvedRequest.updatedAt,
            },
          };
        }
        return { registered: false, center: null };
      }),
  }),

  // ── 기존 명함 디자인 ──────────────────────────────────────────
  namecardDesigns: router({
    // 간편 로그인 번호로 기존 디자인 조회
    getByDeptCode: publicProcedure
      .input(z.object({ centerCode: z.string(), deptCode: z.string() }))
      .query(async ({ input }) => {
        return getNamecardDesignByDeptCode(input.centerCode, input.deptCode);
      }),

    // 이름(담당자명/부서명/보건소명) 기반 검색
    searchByName: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        if (!input.query.trim()) return [];
        return searchNamecardDesignsByName(input.query.trim());
      }),

    // 전체 목록 (관리자용)
    list: publicProcedure.query(async () => {
      return getAllNamecardDesigns();
    }),

    // 이미지 업로드 후 신규 등록
    create: publicProcedure
      .input(z.object({
        centerCode: z.string(),
        centerName: z.string(),
        deptCode: z.string(),
        deptName: z.string(),
        frontImageUrl: z.string().optional(),
        backImageUrl: z.string().optional(),
        description: z.string().optional(),
        uploadedBy: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createNamecardDesign({ ...input, status: "pending" });
        // 관리자에게 알림
        await notifyOwner({
          title: "[명함 디자인] 새 업로드 검토 요청",
          content: `${input.centerName} - ${input.deptName}(${input.deptCode}) 담당자가 기존 명함 디자인을 업로드했습니다. 관리자 페이지에서 검토 후 승인해 주세요.`,
        });
        return { success: true };
      }),

    // 관리자: 승인
    approve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateNamecardDesign(input.id, {
          status: "approved",
          approvedAt: new Date(),
        });
        return { success: true };
      }),

    // 관리자: 거절
    reject: publicProcedure
      .input(z.object({ id: z.number(), rejectReason: z.string().optional() }))
      .mutation(async ({ input }) => {
        await updateNamecardDesign(input.id, {
          status: "rejected",
          rejectReason: input.rejectReason ?? "",
        });
        return { success: true };
      }),

    // 관리자: 이미지/정보 수정
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        frontImageUrl: z.string().optional(),
        backImageUrl: z.string().optional(),
        description: z.string().optional(),
        deptName: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        rejectReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateNamecardDesign(id, data);
        return { success: true };
      }),

    // 삭제
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteNamecardDesign(input.id);
        return { success: true };
      }),
  }),

  // ── 가입신청 ──────────────────────────────────────────────
  requests: router({
    list: publicProcedure.query(async () => {
      return getAllSignupRequests();
    }),

    create: publicProcedure
      .input(z.object({
        centerCode: z.string(),
        centerName: z.string(),
        deptName: z.string(),
        managerName: z.string(),
        deptCode: z.string().optional(),
        issuedCode: z.string().optional(),
        phone: z.string().optional(),
        mobilePhone: z.string().optional(),
        email: z.string().optional(),
        bizNo: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await createSignupRequest(input);
        return { success: true };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        issuedCode: z.string().optional(),
        rejectReason: z.string().optional(),
        deptCode: z.string().optional(),
        managerName: z.string().optional(),
        deptName: z.string().optional(),
        centerName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        bizNo: z.string().optional(),
        processedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // 발급코드 변경 시 동일 보건소 내 중복 여부 검증
        if (data.issuedCode) {
          const allRequests = await getAllSignupRequests();
          const currentRequest = allRequests.find(r => r.id === id);
          if (currentRequest) {
            const duplicate = allRequests.find(
              r => r.id !== id &&
                   r.centerCode === currentRequest.centerCode &&
                   r.issuedCode === data.issuedCode
            );
            if (duplicate) {
              throw new TRPCError({
                code: "CONFLICT",
                message: `이미 등록된 코드입니다. '${duplicate.deptName}' 부서에서 사용 중인 코드입니다.`,
              });
            }
          }
        }
        await updateSignupRequest(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number().optional(), deleteAll: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        if (input.deleteAll) {
          await deleteAllSignupRequests();
        } else if (input.id != null) {
          await deleteSignupRequest(input.id);
        }
        return { success: true };
      }),

    // 특정 보건소에 등록된 부서 목록 조회 (드롭다운용)
    deptsByCenter: publicProcedure
      .input(z.object({ centerCode: z.string() }))
      .query(async ({ input }) => {
        if (!input.centerCode) return [];
        return getDeptsByCenterCode(input.centerCode);
      }),

    // 발급코드 검증 (로그인 시 실제 DB 검증)
    verifyIssuedCode: publicProcedure
      .input(z.object({
        centerCode: z.string(),
        issuedCode: z.string().length(4),
      }))
      .query(async ({ input }) => {
        const dept = await verifyIssuedCode(input.centerCode, input.issuedCode);
        if (!dept) {
          return { valid: false, dept: null };
        }
        return {
          valid: true,
          dept: {
            id: dept.id,
            deptName: dept.deptName,
            managerName: dept.managerName,
            issuedCode: dept.issuedCode,
          },
        };
      }),

    // 담당자 이름 중복 검증 (같은 보건소 내)
    checkManagerName: publicProcedure
      .input(z.object({
        centerCode: z.string(),
        managerName: z.string(),
        excludeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const all = await getAllSignupRequests();
        const duplicate = all.find(r =>
          r.centerCode === input.centerCode &&
          r.managerName === input.managerName &&
          (input.excludeId == null || r.id !== input.excludeId)
        );
        return { isDuplicate: !!duplicate };
      }),

    // 간편 로그인 번호 중복 검증 (전체 보건소 데이터 기준)
    checkCode: publicProcedure
      .input(z.object({
        code: z.string().length(4),
        excludeId: z.number().optional(), // 수정 시 자신 제외
      }))
      .query(async ({ input }) => {
        const all = await getAllSignupRequests();
        const duplicate = all.find(r =>
          r.issuedCode === input.code &&
          (input.excludeId == null || r.id !== input.excludeId)
        );
        return { isDuplicate: !!duplicate };
      }),
  }),

  // ── 디자인 조합 저장 ──────────────────────────────────────────
  designCombos: router({
    // 디자인 조합 목록 조회
    list: publicProcedure
      .input(z.object({ centerCode: z.string(), deptCode: z.string() }))
      .query(async ({ input }) => {
        return getSavedDesignCombos(input.centerCode, input.deptCode);
      }),

    // 디자인 조합 저장
    save: publicProcedure
      .input(z.object({
        centerCode: z.string(),
        deptCode: z.string(),
        label: z.string().min(1).max(128),
        frontType: z.string(),
        backType: z.string().optional(),
        doubleSided: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await createSavedDesignCombo({
          centerCode: input.centerCode,
          deptCode: input.deptCode,
          label: input.label,
          frontType: input.frontType,
          backType: input.backType ?? null,
          doubleSided: input.doubleSided ? 1 : 0,
        });
        return { success: true };
      }),

    // 디자인 조합 삭제
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSavedDesignCombo(input.id);
        return { success: true };
      }),

    // 공유 상태 토글 (같은 보건소 전체 공유/비공개)
    toggleShare: publicProcedure
      .input(z.object({ id: z.number(), isShared: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateSavedDesignComboShared(input.id, input.isShared ? 1 : 0);
        return { success: true };
      }),

    // 같은 보건소에서 공유된 디자인 조합 목록 조회
    sharedList: publicProcedure
      .input(z.object({ centerCode: z.string() }))
      .query(async ({ input }) => {
        if (!input.centerCode) return [];
        const all = await getSharedDesignCombos(input.centerCode);
        return all.filter(c => c.isShared === 1);
      }),
  }),

  // ── 사업자 정보 ──────────────────────────────────────────
  businessInfo: router({
    /** 특정 보건소의 사업자 정보 목록 조회 (공개 - 주문 시 사용) */
    listByCenterCode: publicProcedure
      .input(z.object({ centerCode: z.string() }))
      .query(async ({ input }) => {
        if (!input.centerCode) return [];
        return getBusinessInfoByCenterCode(input.centerCode);
      }),

    /** 전체 사업자 정보 목록 (관리자 전용) */
    listAll: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        return getAllBusinessInfo();
      }),

    /** 사업자 정보 등록 (관리자 또는 일반 사용자 - 최초 주문 시) */
    create: publicProcedure
      .input(z.object({
        centerCode: z.string(),
        centerName: z.string(),
        bizNo: z.string(),
        representative: z.string().optional(),
        bizAddress: z.string().optional(),
        bizType: z.string().optional(),
        bizItem: z.string().optional(),
        taxEmail: z.string().optional(),
        isDefault: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        await createBusinessInfo({
          ...input,
          registeredBy: ctx.user.openId,
          isDefault: input.isDefault ?? 1,
        });
        return { success: true };
      }),

    /** 사업자 정보 수정 (관리자 전용) */
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        bizNo: z.string().optional(),
        representative: z.string().optional(),
        bizAddress: z.string().optional(),
        bizType: z.string().optional(),
        bizItem: z.string().optional(),
        taxEmail: z.string().optional(),
        isDefault: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        const { id, ...data } = input;
        await updateBusinessInfo(id, data);
        return { success: true };
      }),

    /** 사업자 정보 삭제 (관리자 전용) */
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        await deleteBusinessInfo(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
