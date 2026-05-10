import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 관리자 설정 테이블 (비밀번호 등 전역 설정)
 */
export const adminSettings = mysqlTable("admin_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 64 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminSetting = typeof adminSettings.$inferSelect;

/**
 * 등록 보건소 테이블
 */
export const registeredCenters = mysqlTable("registered_centers", {
  id: int("id").autoincrement().primaryKey(),
  centerCode: varchar("centerCode", { length: 32 }).notNull(),
  centerName: varchar("centerName", { length: 128 }).notNull(),
  bizNo: varchar("bizNo", { length: 32 }),
  address: text("address"),
  phone: varchar("phone", { length: 32 }),
  region: varchar("region", { length: 64 }),
  representative: varchar("representative", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RegisteredCenter = typeof registeredCenters.$inferSelect;
export type InsertRegisteredCenter = typeof registeredCenters.$inferInsert;

/**
 * 가입신청 테이블
 */
export const signupRequests = mysqlTable("signup_requests", {
  id: int("id").autoincrement().primaryKey(),
  centerCode: varchar("centerCode", { length: 32 }).notNull(),
  centerName: varchar("centerName", { length: 128 }).notNull(),
  deptName: varchar("deptName", { length: 64 }).notNull(),
  managerName: varchar("managerName", { length: 64 }).notNull(),
  deptCode: varchar("deptCode", { length: 32 }),
  phone: varchar("phone", { length: 32 }),
  mobilePhone: varchar("mobilePhone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  bizNo: varchar("bizNo", { length: 32 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  issuedCode: varchar("issuedCode", { length: 64 }),
  rejectReason: text("rejectReason"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SignupRequest = typeof signupRequests.$inferSelect;
export type InsertSignupRequest = typeof signupRequests.$inferInsert;

/**
 * 기존 명함 디자인 테이블 (간편 로그인 번호 기반)
 */
export const namecardDesigns = mysqlTable("namecard_designs", {
  id: int("id").autoincrement().primaryKey(),
  centerCode: varchar("centerCode", { length: 32 }).notNull(),
  centerName: varchar("centerName", { length: 128 }).notNull(),
  deptCode: varchar("deptCode", { length: 32 }).notNull(),
  deptName: varchar("deptName", { length: 64 }).notNull(),
  frontImageUrl: text("frontImageUrl"),
  backImageUrl: text("backImageUrl"),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  uploadedBy: varchar("uploadedBy", { length: 64 }),
  rejectReason: text("rejectReason"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NamecardDesign = typeof namecardDesigns.$inferSelect;
export type InsertNamecardDesign = typeof namecardDesigns.$inferInsert;

/**
 * 디자인 조합 저장 테이블 (앞면+뒷면 조합 저장)
 */
export const savedDesignCombos = mysqlTable("saved_design_combos", {
  id: int("id").autoincrement().primaryKey(),
  deptCode: varchar("deptCode", { length: 32 }).notNull(),
  centerCode: varchar("centerCode", { length: 32 }).notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  frontType: varchar("frontType", { length: 16 }).notNull(),
  backType: varchar("backType", { length: 16 }),
  doubleSided: int("doubleSided").default(0).notNull(),
  isShared: int("isShared").default(0).notNull(), // 1 = 같은 보건소 전체 공유
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedDesignCombo = typeof savedDesignCombos.$inferSelect;
export type InsertSavedDesignCombo = typeof savedDesignCombos.$inferInsert;

/**
 * 사업자 정보 테이블 (보건소별 사업자등록증 정보)
 * - 관리자가 사전 등록하거나, 최초 주문 시 직원이 입력
 */
export const businessInfo = mysqlTable("business_info", {
  id: int("id").autoincrement().primaryKey(),
  centerCode: varchar("centerCode", { length: 32 }).notNull(),
  centerName: varchar("centerName", { length: 128 }).notNull(),
  bizNo: varchar("bizNo", { length: 32 }).notNull(),           // 사업자등록번호
  representative: varchar("representative", { length: 64 }),   // 대표자명
  bizAddress: text("bizAddress"),                              // 사업장 주소
  bizType: varchar("bizType", { length: 64 }),                 // 업태
  bizItem: varchar("bizItem", { length: 64 }),                 // 종목
  taxEmail: varchar("taxEmail", { length: 320 }),              // 세금계산서 수신 이메일
  registeredBy: varchar("registeredBy", { length: 64 }),       // 등록자 (admin or userOpenId)
  isDefault: int("isDefault").default(1).notNull(),            // 기본 사업자 정보 여부
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessInfo = typeof businessInfo.$inferSelect;
export type InsertBusinessInfo = typeof businessInfo.$inferInsert;
