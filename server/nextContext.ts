/**
 * Next.js App Router 전용 tRPC Context
 * 기존 server/_core/context.ts (Express 기반)를 fetch adapter로 대체
 */
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "../../drizzle/schema";
import { sdk } from "./_core/sdk";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user: User | null;
};

export async function createNextContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // sdk.authenticateRequest는 Express Request를 받으므로
    // Next.js fetch Request에서 쿠키를 직접 파싱하여 검증
    const cookieHeader = opts.req.headers.get("cookie") ?? "";
    const sessionCookie = parseCookieValue(cookieHeader, "app_session_id");
    const session = await sdk.verifySession(sessionCookie);

    if (session) {
      const { getUserByOpenId, upsertUser } = await import("./db");
      user = (await getUserByOpenId(session.openId)) ?? null;

      if (user) {
        // 마지막 로그인 시각 업데이트 (비동기, 결과 무시)
        upsertUser({ openId: user.openId, lastSignedIn: new Date() }).catch(
          () => {}
        );
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    user,
  };
}

/** 쿠키 헤더 문자열에서 특정 키의 값을 파싱 */
function parseCookieValue(cookieHeader: string, key: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k?.trim() === key) return v?.trim();
  }
  return undefined;
}
