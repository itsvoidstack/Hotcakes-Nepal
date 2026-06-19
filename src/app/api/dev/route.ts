import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer authenticated-dev-session-token-hc';
}

const TABLES_LIST = [
  'admin_users',
  'menu_items',
  'campaigns',
  'streak_records',
  'vacancies',
  'site_settings',
  'order_links',
  'contact_info',
  'audit_logs',
  'rate_limits'
] as const;

type TableName = keyof Database['public']['Tables'];

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const adminSupabase = getSupabaseAdmin();

    // ACTION 1: HEALTH CHECKS
    if (action === 'health') {
      const statusList: Record<
        string,
        { status: 'healthy'; count: number } | { status: 'error'; message: string }
      > = {};
      let dbConnected = true;

      for (const table of TABLES_LIST) {
        const { count, error } = await adminSupabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          statusList[table] = { status: 'error', message: error.message };
          dbConnected = false;
        } else {
          statusList[table] = { status: 'healthy', count: count || 0 };
        }
      }

      // Check current maintenance mode status
      const { data: maintenanceSetting } = await adminSupabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();

      const maintenanceSettingValue = maintenanceSetting?.value as { enabled?: boolean } | null;

      return NextResponse.json({
        db_connection: dbConnected ? 'healthy' : 'degraded',
        tables: statusList,
        maintenance_mode: maintenanceSettingValue?.enabled ?? false
      });
    }

    // ACTION 2: TABLE DATA VIEWER
    if (action === 'table') {
      const tableNameRaw = searchParams.get('table');
      if (!tableNameRaw || !TABLES_LIST.includes(tableNameRaw as typeof TABLES_LIST[number])) {
        return NextResponse.json({ error: 'Invalid or missing table name' }, { status: 400 });
      }
      const tableName = tableNameRaw as TableName;

      const { data: rows, error } = await adminSupabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false, nullsFirst: true })
        .limit(100);

      if (error) {
        // Fallback if sorting on created_at fails (some tables like order_links do not have it)
        const { data: fallbackRows, error: fallbackError } = await adminSupabase
          .from(tableName)
          .select('*')
          .limit(100);
        
        if (fallbackError) {
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, table: tableName, rows: fallbackRows });
      }

      return NextResponse.json({ success: true, table: tableName, rows });
    }

    // ACTION 3: CSV EXPORT
    if (action === 'export') {
      const tableNameRaw = searchParams.get('table');
      if (!tableNameRaw || !TABLES_LIST.includes(tableNameRaw as typeof TABLES_LIST[number])) {
        return NextResponse.json({ error: 'Invalid or missing table name' }, { status: 400 });
      }
      const tableName = tableNameRaw as TableName;

      const { data: rows, error } = await adminSupabase
        .from(tableName)
        .select('*');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!rows || rows.length === 0) {
        return new NextResponse('', {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename=${tableName}.csv`
          }
        });
      }

      // Format CSV
      const headers = Object.keys(rows[0]);
      const csvRows = [
        headers.join(','),
        ...rows.map(row => 
          headers.map(fieldName => {
            const key = fieldName as keyof typeof row;
            const val = row[key];
            if (val === null || val === undefined) return '';
            const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
            // Escape double quotes
            const escaped = valStr.replace(/"/g, '""');
            return `"${escaped}"`;
          }).join(',')
        )
      ];

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${tableName}.csv`
        }
      });
    }

    return NextResponse.json({ error: 'Invalid dev action' }, { status: 400 });
  } catch (err: unknown) {
    const message = (err instanceof Error ? err.message : null) || 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const adminSupabase = getSupabaseAdmin();

    // ACTION 4: MAINTENANCE MODE TOGGLE
    if (action === 'maintenance') {
      const body = await request.json();
      const { enabled } = body;

      const { error } = await adminSupabase
        .from('site_settings')
        .upsert({
          key: 'maintenance_mode',
          value: { enabled: !!enabled },
          updated_at: new Date().toISOString()
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log action in audit logs
      await adminSupabase.from('audit_logs').insert({
        action: enabled ? 'Enable Maintenance Mode' : 'Disable Maintenance Mode',
        performed_by: 'Developer Panel',
        details: { timestamp: new Date().toISOString() }
      });

      return NextResponse.json({ success: true, enabled: !!enabled });
    }

    if (action === 'delete_row') {
      const body = await request.json();
      const { table, primaryKey, primaryKeyValue } = body;
      
      if (!table || !primaryKey || !primaryKeyValue) {
        return NextResponse.json({ error: 'Missing table, primaryKey or value' }, { status: 400 });
      }

      const tableName = table as TableName;

      const { error } = await adminSupabase
        .from(tableName)
        .delete()
        .eq(primaryKey, primaryKeyValue);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log action in audit logs
      await adminSupabase.from('audit_logs').insert({
        action: `Delete Row inside ${tableName}`,
        performed_by: 'Developer Panel',
        details: { table: tableName, primaryKey, primaryKeyValue }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid dev action' }, { status: 400 });
  } catch (err: unknown) {
    const message = (err instanceof Error ? err.message : null) || 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
