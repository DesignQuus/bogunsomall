/**
 * EGDesk User Data Configuration
 * Generated at: 2026-05-13T11:20:40.367Z
 *
 * This file contains type-safe definitions for your EGDesk tables.
 */

export const EGDESK_CONFIG = {
  apiUrl: 'http://localhost:8080',
  apiKey: '48632c34-0fd1-4b53-b448-b8162e19b925',
} as const;

export interface TableDefinition {
  name: string;
  displayName: string;
  description?: string;
  /** Omitted or unknown until synced / counted */
  rowCount?: number;
  columnCount: number;
  columns: string[];
}

export const TABLES = {
  table1: {
    name: 'bogensolist',
    displayName: '전국 보건소 마스터 리스트',
    rowCount: 262,
    columnCount: 12,
    columns: ['id', 'code', 'status', 'name', 'sido', 'sigungu', 'address', 'phone', 'biz_number', 'apply_count', 'approve_count', 'wait_count']
  } as TableDefinition,
  table2: {
    name: 'business_info',
    displayName: '사업자 정보',
    rowCount: 0,
    columnCount: 4,
    columns: ['id', 'centerCode', 'bizNo', 'representative']
  } as TableDefinition,
  table3: {
    name: 'saved_design_combos',
    displayName: '저장된 디자인 조합',
    rowCount: 0,
    columnCount: 5,
    columns: ['id', 'centerCode', 'deptCode', 'label', 'isShared']
  } as TableDefinition,
  table4: {
    name: 'namecard_designs',
    displayName: '명함 디자인',
    rowCount: 0,
    columnCount: 7,
    columns: ['id', 'centerCode', 'deptCode', 'deptName', 'frontImageUrl', 'backImageUrl', 'status']
  } as TableDefinition,
  table5: {
    name: 'signup_requests',
    displayName: '가입 신청 목록',
    rowCount: 0,
    columnCount: 9,
    columns: ['id', 'centerCode', 'centerName', 'deptName', 'managerName', 'deptCode', 'status', 'issuedCode', 'createdAt']
  } as TableDefinition,
  table6: {
    name: 'admin_settings',
    displayName: '관리자 설정',
    rowCount: 0,
    columnCount: 3,
    columns: ['id', 'settingKey', 'settingValue']
  } as TableDefinition,
  table7: {
    name: 'users',
    displayName: '사용자 정보',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'openId', 'name', 'email', 'role', 'lastSignedIn']
  } as TableDefinition,
  table8: {
    name: 'form_submissions',
    displayName: 'Form Submissions',
    rowCount: 0,
    columnCount: 11,
    columns: ['id', 'templateId', 'userId', 'customerData', 'manualInputs', '__created_at', '__updated_at', '__creator_id', '__modifier_id', '__is_deleted', '__deleted_at']
  } as TableDefinition,
  table9: {
    name: 'form_studio_templates',
    displayName: 'Form Studio Templates',
    rowCount: 0,
    columnCount: 14,
    columns: ['id', 'name', 'formType', 'backgroundImageData', 'mappingConfig', 'webLayoutConfig', 'sourceTable', 'status', '__created_at', '__updated_at', '__creator_id', '__modifier_id', '__is_deleted', '__deleted_at']
  } as TableDefinition,
  table10: {
    name: 'micro_app_projects',
    displayName: 'Micro App Project',
    rowCount: 0,
    columnCount: 14,
    columns: ['id', 'projectId', 'name', 'description', 'templateId', 'status', 'widgets', 'sources', 'mappingConfig', 'uiSettings', 'tags', 'themeColor', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table11: {
    name: 'table_master',
    displayName: 'Physical Table Registry',
    rowCount: 0,
    columnCount: 9,
    columns: ['id', 'tableName', 'displayName', 'category', 'schema', 'rowCount', 'isDeleted', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table12: {
    name: 'source_view_settings',
    displayName: 'Centralized Source View Settings',
    rowCount: 0,
    columnCount: 4,
    columns: ['id', 'sourceId', 'view_config', 'updatedAt']
  } as TableDefinition,
  table13: {
    name: 'table_knowledge',
    displayName: 'Table Intelligence Knowledge',
    rowCount: 0,
    columnCount: 14,
    columns: ['id', 'target_id', 'target_type', 'description', 'category', 'insight', 'schema_info', 'ai_rules', 'sample_rows', 'sample_analysis', 'version_number', 'is_current', 'status', 'updated_at']
  } as TableDefinition,
  table14: {
    name: 'micro_app_config',
    displayName: 'Micro App Configurations',
    rowCount: 0,
    columnCount: 10,
    columns: ['id', 'projectId', 'templateId', 'sourceTableId', 'mappingConfig', 'uiSettings', 'rbacRoles', 'createdBy', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table15: {
    name: 'dashboard_chart',
    displayName: 'Dashboard Chart Widgets',
    rowCount: 0,
    columnCount: 7,
    columns: ['id', 'userId', 'config', 'layout', 'isSample', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table16: {
    name: 'input_guardrail',
    displayName: 'Input Data Guardrails',
    rowCount: 0,
    columnCount: 8,
    columns: ['id', 'reportId', 'columnName', 'ruleType', 'ruleValue', 'errorMessage', 'isActive', 'createdAt']
  } as TableDefinition,
  table17: {
    name: 'department',
    displayName: 'Organization Departments',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'name', 'description', 'icon', 'metadata', 'createdAt']
  } as TableDefinition,
  table18: {
    name: 'action_task_history',
    displayName: 'Action Task History',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'taskId', 'oldStatus', 'newStatus', 'changedById', 'changedAt']
  } as TableDefinition,
  table19: {
    name: 'action_task',
    displayName: 'Action Tasks',
    rowCount: 0,
    columnCount: 13,
    columns: ['id', 'instanceId', 'reportId', 'title', 'description', 'type', 'status', 'assigneeId', 'assigneeRole', 'dueAt', 'metadata', 'completedAt', 'createdAt']
  } as TableDefinition,
  table20: {
    name: 'workflow_instance',
    displayName: 'Workflow Instances',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'templateId', 'triggerRowId', 'status', 'startedAt', 'completedAt']
  } as TableDefinition,
  table21: {
    name: 'workflow_template',
    displayName: 'Workflow Templates',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'name', 'triggerReportId', 'triggerCondition', 'tasks', 'createdAt']
  } as TableDefinition,
  table22: {
    name: 'notification',
    displayName: 'User Notifications',
    rowCount: 0,
    columnCount: 9,
    columns: ['id', 'userId', 'title', 'message', 'link', 'type', 'isRead', 'metadata', 'createdAt']
  } as TableDefinition,
  table23: {
    name: 'workspace_item',
    displayName: 'Workspace Image Items',
    rowCount: 0,
    columnCount: 16,
    columns: ['id', 'creatorId', 'imageUrl', 'originalText', 'suggestedTitle', 'suggestedSummary', 'aiData', 'status', 'reportId', 'rowId', 'metadata', 'createdAt', 'updatedAt', 'location_lat', 'location_lng', 'location_name']
  } as TableDefinition,
  table24: {
    name: 'dashboard_data_history',
    displayName: 'Dashboard Row History',
    rowCount: 0,
    columnCount: 7,
    columns: ['id', 'rowId', 'oldData', 'newData', 'changeType', 'changedById', 'changedAt']
  } as TableDefinition,
  table25: {
    name: 'dashboard_access',
    displayName: 'Dashboard Access Controls',
    rowCount: 0,
    columnCount: 8,
    columns: ['id', 'reportId', 'userId', 'departmentId', 'role', 'isBlocked', 'grantedAt', 'grantedBy']
  } as TableDefinition,
  table26: {
    name: 'dashboard_data',
    displayName: 'Dashboard Virtual Rows',
    rowCount: 0,
    columnCount: 10,
    columns: ['id', 'reportId', 'data', 'contentHash', '__is_deleted', '__deleted_at', 'creatorId', 'updaterId', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table27: {
    name: 'workflow_steering',
    displayName: 'AI Workflow Steering',
    rowCount: 0,
    columnCount: 10,
    columns: ['id', 'reportId', 'rowId', 'eventType', 'recommendation', 'reasoning', 'status', 'decidedById', 'decidedAt', 'createdAt']
  } as TableDefinition,
  table28: {
    name: 'dashboard_master',
    displayName: 'Dashboard Master Metadata',
    rowCount: 0,
    columnCount: 15,
    columns: ['id', 'reportId', 'name', 'sheetName', 'description', 'tableName', 'columns', 'uiConfig', 'aiConfig', 'isDeleted', 'deletedAt', 'ownerId', 'lastSerial', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table29: {
    name: 'user',
    displayName: 'System Users',
    rowCount: 1,
    columnCount: 12,
    columns: ['id', 'username', 'email', 'password', 'role', 'fullName', 'employeeId', 'departmentId', 'position', 'isActive', 'metadata', 'createdAt']
  } as TableDefinition,
  table30: {
    name: 'system_settings',
    displayName: 'System Settings',
    rowCount: 1,
    columnCount: 12,
    columns: ['id', 'legacyId', 'companyName', 'logoUrl', 'themeColor', 'businessContext', 'isInitialized', 'backupScheduleEnabled', 'backupScheduleDays', 'backupScheduleTime', 'backupRetentionCount', 'updatedAt']
  } as TableDefinition
} as const;


// Main table (first table by default)
export const MAIN_TABLE = TABLES.table1;


// Helper to get table by name
export function getTableByName(tableName: string): TableDefinition | undefined {
  return Object.values(TABLES).find(t => t.name === tableName);
}

// Export table names for easy access
export const TABLE_NAMES = {
  table1: 'bogensolist',
  table2: 'business_info',
  table3: 'saved_design_combos',
  table4: 'namecard_designs',
  table5: 'signup_requests',
  table6: 'admin_settings',
  table7: 'users',
  table8: 'form_submissions',
  table9: 'form_studio_templates',
  table10: 'micro_app_projects',
  table11: 'table_master',
  table12: 'source_view_settings',
  table13: 'table_knowledge',
  table14: 'micro_app_config',
  table15: 'dashboard_chart',
  table16: 'input_guardrail',
  table17: 'department',
  table18: 'action_task_history',
  table19: 'action_task',
  table20: 'workflow_instance',
  table21: 'workflow_template',
  table22: 'notification',
  table23: 'workspace_item',
  table24: 'dashboard_data_history',
  table25: 'dashboard_access',
  table26: 'dashboard_data',
  table27: 'workflow_steering',
  table28: 'dashboard_master',
  table29: 'user',
  table30: 'system_settings'
} as const;
