import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createTable, listTables } from './egdesk-helpers';
async function init() {
  console.log('Starting EGDesk table initialization...');

  const tablesToCreate = [
    {
      name: 'users',
      displayName: '사용자 정보',
      schema: [
        { name: 'openId', type: 'TEXT' as const, notNull: true },
        { name: 'name', type: 'TEXT' as const },
        { name: 'email', type: 'TEXT' as const },
        { name: 'role', type: 'TEXT' as const },
        { name: 'lastSignedIn', type: 'TEXT' as const },
      ]
    },
    {
      name: 'admin_settings',
      displayName: '관리자 설정',
      schema: [
        { name: 'settingKey', type: 'TEXT' as const, notNull: true },
        { name: 'settingValue', type: 'TEXT' as const, notNull: true },
      ]
    },
    {
      name: 'signup_requests',
      displayName: '가입 신청 목록',
      schema: [
        { name: 'centerCode', type: 'TEXT' as const, notNull: true },
        { name: 'centerName', type: 'TEXT' as const, notNull: true },
        { name: 'deptName', type: 'TEXT' as const, notNull: true },
        { name: 'managerName', type: 'TEXT' as const, notNull: true },
        { name: 'deptCode', type: 'TEXT' as const },
        { name: 'status', type: 'TEXT' as const },
        { name: 'issuedCode', type: 'TEXT' as const },
        { name: 'createdAt', type: 'TEXT' as const },
      ]
    },
    {
      name: 'namecard_designs',
      displayName: '명함 디자인',
      schema: [
        { name: 'centerCode', type: 'TEXT' as const, notNull: true },
        { name: 'deptCode', type: 'TEXT' as const, notNull: true },
        { name: 'deptName', type: 'TEXT' as const },
        { name: 'frontImageUrl', type: 'TEXT' as const },
        { name: 'backImageUrl', type: 'TEXT' as const },
        { name: 'status', type: 'TEXT' as const },
      ]
    },
    {
      name: 'saved_design_combos',
      displayName: '저장된 디자인 조합',
      schema: [
        { name: 'centerCode', type: 'TEXT' as const, notNull: true },
        { name: 'deptCode', type: 'TEXT' as const, notNull: true },
        { name: 'label', type: 'TEXT' as const },
        { name: 'isShared', type: 'INTEGER' as const },
      ]
    },
    {
      name: 'business_info',
      displayName: '사업자 정보',
      schema: [
        { name: 'centerCode', type: 'TEXT' as const, notNull: true },
        { name: 'bizNo', type: 'TEXT' as const },
        { name: 'representative', type: 'TEXT' as const },
      ]
    }
  ];

  try {
    const result = await listTables();
    const existingTables = Array.isArray(result) ? result : (result?.tables || []);
    const existingNames = existingTables.map((t: any) => t.tableName || t.name);

    for (const table of tablesToCreate) {
      if (existingNames.includes(table.name)) {
        console.log(`Table ${table.name} already exists. Skipping...`);
        continue;
      }
      console.log(`Creating table: ${table.name} (${table.displayName})...`);
      await createTable(table.displayName, table.schema, { tableName: table.name });
    }

    console.log('Initialization completed successfully!');
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

init();
