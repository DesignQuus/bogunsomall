/**
 * Admin API 테스트 - centers, requests, admin auth
 * DB 없이 mock 기반으로 테스트
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// DB 모킹
vi.mock("./db", () => ({
  getAdminSetting: vi.fn().mockResolvedValue(null),
  setAdminSetting: vi.fn().mockResolvedValue(undefined),
  getAllRegisteredCenters: vi.fn().mockResolvedValue([]),
  createRegisteredCenter: vi.fn().mockResolvedValue(undefined),
  updateRegisteredCenter: vi.fn().mockResolvedValue(undefined),
  deleteRegisteredCenter: vi.fn().mockResolvedValue(undefined),
  deleteAllRegisteredCenters: vi.fn().mockResolvedValue(undefined),
  getAllSignupRequests: vi.fn().mockResolvedValue([]),
  createSignupRequest: vi.fn().mockResolvedValue(undefined),
  updateSignupRequest: vi.fn().mockResolvedValue(undefined),
  deleteSignupRequest: vi.fn().mockResolvedValue(undefined),
  deleteAllSignupRequests: vi.fn().mockResolvedValue(undefined),
}));

import {
  getAdminSetting,
  setAdminSetting,
  getAllRegisteredCenters,
  createRegisteredCenter,
  deleteRegisteredCenter,
  deleteAllRegisteredCenters,
  getAllSignupRequests,
  createSignupRequest,
  updateSignupRequest,
  deleteSignupRequest,
  deleteAllSignupRequests,
} from "./db";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("admin.verifyPassword", () => {
  beforeEach(() => {
    vi.mocked(getAdminSetting).mockResolvedValue(null);
  });

  it("기본 비밀번호(admin1234)로 로그인 성공", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.admin.verifyPassword({ password: "admin1234" });
    expect(result).toEqual({ success: true });
  });

  it("잘못된 비밀번호로 로그인 실패", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.admin.verifyPassword({ password: "wrongpassword" })
    ).rejects.toThrow("비밀번호가 올바르지 않습니다.");
  });

  it("DB에 저장된 비밀번호로 로그인 성공", async () => {
    vi.mocked(getAdminSetting).mockResolvedValue("newpassword123");
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.admin.verifyPassword({ password: "newpassword123" });
    expect(result).toEqual({ success: true });
  });
});

describe("admin.changePassword", () => {
  beforeEach(() => {
    vi.mocked(getAdminSetting).mockResolvedValue(null);
    vi.mocked(setAdminSetting).mockResolvedValue(undefined);
  });

  it("현재 비밀번호가 맞으면 변경 성공", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.admin.changePassword({
      currentPassword: "admin1234",
      newPassword: "newpass456",
    });
    expect(result).toEqual({ success: true });
    expect(setAdminSetting).toHaveBeenCalledWith("admin_password", "newpass456");
  });

  it("현재 비밀번호가 틀리면 변경 실패", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.admin.changePassword({
        currentPassword: "wrongpassword",
        newPassword: "newpass456",
      })
    ).rejects.toThrow("현재 비밀번호가 올바르지 않습니다.");
  });
});

describe("centers API", () => {
  beforeEach(() => {
    vi.mocked(getAllRegisteredCenters).mockResolvedValue([]);
    vi.mocked(createRegisteredCenter).mockResolvedValue(undefined);
    vi.mocked(deleteRegisteredCenter).mockResolvedValue(undefined);
    vi.mocked(deleteAllRegisteredCenters).mockResolvedValue(undefined);
  });

  it("centers.list - 빈 배열 반환", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.centers.list();
    expect(result).toEqual([]);
  });

  it("centers.create - 보건소 등록", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.centers.create({
      centerCode: "SEO001",
      centerName: "서울특별시 종로구보건소",
      bizNo: "123-45-67890",
      region: "서울",
    });
    expect(result).toEqual({ success: true });
    expect(createRegisteredCenter).toHaveBeenCalledWith({
      centerCode: "SEO001",
      centerName: "서울특별시 종로구보건소",
      bizNo: "123-45-67890",
      region: "서울",
    });
  });

  it("centers.delete - 개별 삭제", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.centers.delete({ id: 1 });
    expect(result).toEqual({ success: true });
    expect(deleteRegisteredCenter).toHaveBeenCalledWith(1);
  });

  it("centers.delete - 전체 삭제", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.centers.delete({ deleteAll: true });
    expect(result).toEqual({ success: true });
    expect(deleteAllRegisteredCenters).toHaveBeenCalled();
  });
});

describe("requests API", () => {
  beforeEach(() => {
    vi.mocked(getAllSignupRequests).mockResolvedValue([]);
    vi.mocked(createSignupRequest).mockResolvedValue(undefined as any);
    vi.mocked(updateSignupRequest).mockResolvedValue(undefined);
    vi.mocked(deleteSignupRequest).mockResolvedValue(undefined);
    vi.mocked(deleteAllSignupRequests).mockResolvedValue(undefined);
  });

  it("requests.list - 빈 배열 반환", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.requests.list();
    expect(result).toEqual([]);
  });

  it("requests.create - 가입신청 등록", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.requests.create({
      centerCode: "SEO001",
      centerName: "서울특별시 종로구보건소",
      deptName: "건강증진과",
      managerName: "홍길동",
      phone: "02-1234-5678",
      email: "test@example.com",
    });
    expect(result).toEqual({ success: true });
  });

  it("requests.update - 승인 처리", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.requests.update({
      id: 1,
      status: "approved",
      issuedCode: "SEO001HJ01",
    });
    expect(result).toEqual({ success: true });
    expect(updateSignupRequest).toHaveBeenCalledWith(1, {
      status: "approved",
      issuedCode: "SEO001HJ01",
    });
  });

  it("requests.delete - 개별 삭제", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.requests.delete({ id: 1 });
    expect(result).toEqual({ success: true });
    expect(deleteSignupRequest).toHaveBeenCalledWith(1);
  });

  it("requests.delete - 전체 삭제", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.requests.delete({ deleteAll: true });
    expect(result).toEqual({ success: true });
    expect(deleteAllSignupRequests).toHaveBeenCalled();
  });
});
