import { eq, desc, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, adminSettings, registeredCenters, signupRequests, InsertRegisteredCenter, InsertSignupRequest, namecardDesigns, InsertNamecardDesign, savedDesignCombos, InsertSavedDesignCombo, businessInfo, InsertBusinessInfo } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Mock Data ──────────────────────────────────────────
const MOCK_SIGNUP_REQUESTS: any[] = [
  {
    id: 1,
    centerCode: "TEST-001",
    centerName: "테스트보건소",
    deptName: "건강증진과",
    managerName: "홍길동",
    status: "approved",
    issuedCode: "1234",
    createdAt: new Date(),
    updatedAt: new Date(),
    requestedAt: new Date(),
  }
];

const MOCK_REGISTERED_CENTERS: any[] = [
  {
    id: 1,
    centerCode: "TEST-001",
    centerName: "테스트보건소",
    region: "서울특별시",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// ── Helper ───────────────────────────────────────────
function isMockMode() {
  return !process.env.DATABASE_URL;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { 
    console.warn("[Database] Mock: upsert user", user.openId);
    return; 
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    if (openId === "admin") return { openId: "admin", role: "admin", name: "관리자" };
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── 관리자 설정 ──────────────────────────────────────────
export async function getAdminSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(adminSettings).where(eq(adminSettings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0].settingValue : null;
}

export async function setAdminSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return; // Mock
  await db.insert(adminSettings).values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

// ── 등록 보건소 ──────────────────────────────────────────
export async function getAllRegisteredCenters() {
  const db = await getDb();
  if (!db) return MOCK_REGISTERED_CENTERS;
  return db.select().from(registeredCenters).orderBy(desc(registeredCenters.createdAt));
}

export async function createRegisteredCenter(data: InsertRegisteredCenter) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.insert(registeredCenters).values(data);
}

export async function updateRegisteredCenter(id: number, data: Partial<InsertRegisteredCenter>) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.update(registeredCenters).set(data).where(eq(registeredCenters.id, id));
}

export async function deleteRegisteredCenter(id: number) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.delete(registeredCenters).where(eq(registeredCenters.id, id));
}

// ── 가입신청 ──────────────────────────────────────────────
export async function getAllSignupRequests() {
  const db = await getDb();
  if (!db) return MOCK_SIGNUP_REQUESTS;
  return db.select().from(signupRequests).orderBy(desc(signupRequests.requestedAt));
}

export async function createSignupRequest(data: InsertSignupRequest) {
  const db = await getDb();
  if (!db) return; // Mock
  const result = await db.insert(signupRequests).values(data);
  return result;
}

export async function updateSignupRequest(id: number, data: Partial<InsertSignupRequest>) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.update(signupRequests).set(data).where(eq(signupRequests.id, id));
}

export async function deleteSignupRequest(id: number) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.delete(signupRequests).where(eq(signupRequests.id, id));
}

/**
 * 특정 보건소에 등록된 부서 목록 조회 (승인된 가입신청 기준)
 */
export async function getDeptsByCenterCode(centerCode: string) {
  const db = await getDb();
  if (!db) {
    return MOCK_SIGNUP_REQUESTS.filter(r => r.centerCode === centerCode).map(r => ({
      deptName: r.deptName,
      deptCode: r.deptCode,
      issuedCode: r.issuedCode,
    }));
  }
  const rows = await db
    .select({
      deptName: signupRequests.deptName,
      deptCode: signupRequests.deptCode,
      issuedCode: signupRequests.issuedCode,
    })
    .from(signupRequests)
    .where(eq(signupRequests.centerCode, centerCode))
    .orderBy(desc(signupRequests.requestedAt));
  
  const seen = new Set<string>();
  return rows.filter(r => {
    if (seen.has(r.deptName)) return false;
    seen.add(r.deptName);
    return true;
  });
}

export async function deleteAllRegisteredCenters() {
  const db = await getDb();
  if (!db) return; // Mock
  await db.delete(registeredCenters);
}

export async function deleteAllSignupRequests() {
  const db = await getDb();
  if (!db) return; // Mock
  await db.delete(signupRequests);
}

// ── 기존 명함 디자인 ──────────────────────────────────────────
export async function getNamecardDesignByDeptCode(centerCode: string, deptCode: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(namecardDesigns)
    .where(eq(namecardDesigns.deptCode, deptCode))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllNamecardDesigns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(namecardDesigns).orderBy(desc(namecardDesigns.createdAt));
}

export async function createNamecardDesign(data: InsertNamecardDesign) {
  const db = await getDb();
  if (!db) return; // Mock
  const result = await db.insert(namecardDesigns).values(data);
  return result;
}

export async function updateNamecardDesign(id: number, data: Partial<InsertNamecardDesign>) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.update(namecardDesigns).set(data).where(eq(namecardDesigns.id, id));
}

export async function deleteNamecardDesign(id: number) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.delete(namecardDesigns).where(eq(namecardDesigns.id, id));
}

export async function searchNamecardDesignsByName(query: string) {
  const db = await getDb();
  if (!db) return [];
  const q = `%${query}%`;
  return db.select().from(namecardDesigns)
    .where(or(
      like(namecardDesigns.uploadedBy, q),
      like(namecardDesigns.deptName, q),
      like(namecardDesigns.centerName, q),
    ))
    .orderBy(desc(namecardDesigns.createdAt));
}

// ── 디자인 조합 저장 ──────────────────────────────────────────
export async function getSavedDesignCombos(centerCode: string, deptCode: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedDesignCombos)
    .where(eq(savedDesignCombos.deptCode, deptCode))
    .orderBy(desc(savedDesignCombos.createdAt));
}

export async function createSavedDesignCombo(data: InsertSavedDesignCombo) {
  const db = await getDb();
  if (!db) return; // Mock
  const result = await db.insert(savedDesignCombos).values(data);
  return result;
}

export async function deleteSavedDesignCombo(id: number) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.delete(savedDesignCombos).where(eq(savedDesignCombos.id, id));
}

export async function getSharedDesignCombos(centerCode: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedDesignCombos)
    .where(eq(savedDesignCombos.centerCode, centerCode))
    .orderBy(desc(savedDesignCombos.createdAt));
}

// ── 발급코드 검증 ──────────────────────────────────────────
export async function verifyIssuedCode(centerCode: string, issuedCode: string) {
  const db = await getDb();
  if (!db) {
    const found = MOCK_SIGNUP_REQUESTS.find(
      r => r.centerCode === centerCode && r.issuedCode === issuedCode && r.status === "approved"
    );
    return found ?? null;
  }
  const rows = await db
    .select()
    .from(signupRequests)
    .where(eq(signupRequests.centerCode, centerCode))
    .orderBy(desc(signupRequests.requestedAt));
  const found = rows.find(
    r => r.issuedCode === issuedCode && r.status === "approved"
  );
  return found ?? null;
}

export async function updateSavedDesignComboShared(id: number, isShared: number) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.update(savedDesignCombos).set({ isShared }).where(eq(savedDesignCombos.id, id));
}

// ── 사업자 정보 ──────────────────────────────────────────
export async function getBusinessInfoByCenterCode(centerCode: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businessInfo)
    .where(eq(businessInfo.centerCode, centerCode))
    .orderBy(desc(businessInfo.createdAt));
}

export async function getAllBusinessInfo() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businessInfo).orderBy(desc(businessInfo.createdAt));
}

export async function createBusinessInfo(data: InsertBusinessInfo) {
  const db = await getDb();
  if (!db) return; // Mock
  const result = await db.insert(businessInfo).values(data);
  return result;
}

export async function updateBusinessInfo(id: number, data: Partial<InsertBusinessInfo>) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.update(businessInfo).set(data).where(eq(businessInfo.id, id));
}

export async function deleteBusinessInfo(id: number) {
  const db = await getDb();
  if (!db) return; // Mock
  await db.delete(businessInfo).where(eq(businessInfo.id, id));
}
