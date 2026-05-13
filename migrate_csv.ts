import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { createTable, insertRows, listTables, deleteTable } from './egdesk-helpers';

async function migrate() {
  const csvPath = path.join(__dirname, '보건소_마스터_2026-05-10.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  // Use a more robust CSV splitting that handles newlines within quotes if any, 
  // but for this simple CSV, split by line is okay.
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  
  console.log(`Total lines found in CSV: ${lines.length}`);
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  console.log('Headers:', headers);

  // Define schema
  const schema = [
    { name: 'code', type: 'TEXT' as const },
    { name: 'status', type: 'TEXT' as const },
    { name: 'name', type: 'TEXT' as const },
    { name: 'sido', type: 'TEXT' as const },
    { name: 'sigungu', type: 'TEXT' as const },
    { name: 'address', type: 'TEXT' as const },
    { name: 'phone', type: 'TEXT' as const },
    { name: 'biz_number', type: 'TEXT' as const },
    { name: 'apply_count', type: 'INTEGER' as const },
    { name: 'approve_count', type: 'INTEGER' as const },
    { name: 'wait_count', type: 'INTEGER' as const },
  ];

  // We will use 'bogensolist' as the target table name
  const targetTable = 'bogensolist';
  const oldTable = 'bogensolist_master';

  try {
    const result = await listTables();
    const tables = Array.isArray(result) ? result : (result?.tables || []);
    
    // Delete existing health center tables
    for (const tableName of [targetTable, oldTable]) {
      if (tables.some((t: any) => t.tableName === tableName || t.name === tableName)) {
        console.log(`Deleting existing table: ${tableName}...`);
        await deleteTable(tableName);
      }
    }

    console.log(`Creating fresh table: ${targetTable}...`);
    await createTable('전국 보건소 마스터 리스트', schema, { tableName: targetTable });

    const rows = lines.slice(1).map((line, idx) => {
      // Split by comma but handle cases where values might contain commas (not expected here but good practice)
      // For this specific CSV, simple split is likely fine.
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      
      if (values.length < 11) {
        console.warn(`Line ${idx + 2} has missing columns: ${line}`);
      }

      return {
        code: values[0] || '',
        status: values[1] || '',
        name: values[2] || '',
        sido: values[3] || '',
        sigungu: values[4] || '',
        address: values[5] || '',
        phone: values[6] || '',
        biz_number: values[7] || '',
        apply_count: parseInt(values[8] || '0', 10),
        approve_count: parseInt(values[9] || '0', 10),
        wait_count: parseInt(values[10] || '0', 10),
      };
    });

    console.log(`Inserting ${rows.length} rows into ${targetTable}...`);
    
    // Insert in chunks of 50 to be safe
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      await insertRows(targetTable, chunk);
      console.log(`Inserted chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(rows.length / chunkSize)}`);
    }

    console.log('Database replacement completed successfully!');
  } catch (error) {
    console.error('Replacement failed:', error);
  }
}

migrate();
