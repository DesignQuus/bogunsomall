/**
 * EGDesk User Data Configuration
 * Generated at: 2026-05-03T03:57:13.231Z
 *
 * This file contains type-safe definitions for your EGDesk tables.
 */

export const EGDESK_CONFIG = {
  apiUrl: 'http://localhost:8080',
  apiKey: '164093ee-cb15-47b2-b70c-65265785669d',
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
    displayName: 'bogensolist',
    rowCount: 250,
    columnCount: 8,
    columns: ['id', '순번', '보건소_코드', '보건소명', '시도', '시군구', '주소', '전화번호']
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
  table1: 'bogensolist'
} as const;
