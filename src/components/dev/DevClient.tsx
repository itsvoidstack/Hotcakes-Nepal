'use client';

import { useState, useEffect } from 'react';

interface DevClientProps {
  token: string;
  onLogout: () => void;
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

export default function DevClient({ token, onLogout }: DevClientProps) {
  const [activeTab, setActiveTab] = useState<'health' | 'database' | 'csv' | 'maintenance' | 'auditor'>('health');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', isError: false });

  // Data states
  const [healthData, setHealthData] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>('streak_records');
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);

  const showFeedback = (msg: string, isError = false) => {
    setFeedback({ message: msg, isError });
    setTimeout(() => setFeedback({ message: '', isError: false }), 5000);
  };

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dev?action=health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch health data');

      setHealthData(data);
      setMaintenanceEnabled(data.maintenance_mode);
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (table: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dev?action=table&table=${table}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch table rows');

      setTableRows(data.rows || []);
    } catch (err: any) {
      showFeedback(err.message, true);
      setTableRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'health' || activeTab === 'maintenance') {
      fetchHealthData();
    } else if (activeTab === 'database') {
      fetchTableData(selectedTable);
    } else if (activeTab === 'auditor') {
      fetchTableData('audit_logs');
    }
  }, [activeTab, selectedTable]);

  const getPrimaryKey = (table: string, row: any) => {
    if ('id' in row) return { key: 'id', value: row.id };
    if ('key' in row) return { key: 'key', value: row.key };
    if ('platform' in row) return { key: 'platform', value: row.platform };
    if ('ip_address' in row) return { key: 'ip_address', value: row.ip_address };
    const firstKey = Object.keys(row)[0];
    return { key: firstKey, value: row[firstKey] };
  };

  const handleDeleteRow = async (row: any) => {
    if (!confirm('Are you sure you want to delete this row?')) return;
    const { key, value } = getPrimaryKey(selectedTable, row);
    setLoading(true);
    try {
      const res = await fetch(`/api/dev?action=delete_row`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ table: selectedTable, primaryKey: key, primaryKeyValue: value })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete row');
      showFeedback('Row deleted successfully!');
      fetchTableData(selectedTable);
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceToggle = async (enable: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/dev?action=maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: enable })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle maintenance mode');

      setMaintenanceEnabled(data.enabled);
      showFeedback(`Maintenance mode ${data.enabled ? 'activated' : 'deactivated'} successfully!`);
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvExport = (table: string) => {
    // Triggers direct browser download using iframe or simple window navigate
    window.open(`/api/dev?action=export&table=${table}&token=${encodeURIComponent(token)}`);
    // Note: The GET endpoint checks bearer token, but for standard exports we can pass headers.
    // However, to make it work directly, we can download it via a helper function:
    downloadCSVFile(table);
  };

  const downloadCSVFile = async (table: string) => {
    try {
      const res = await fetch(`/api/dev?action=export&table=${table}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export CSV');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}_export.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFeedback(`Successfully exported ${table} to CSV!`);
    } catch (err: any) {
      showFeedback(err.message, true);
    }
  };

  return (
    <div className="max-w-[1280px] w-full px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-latte pb-6 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="font-heading font-bold text-3xl text-espresso flex items-center gap-2 justify-center sm:justify-start">
            <span>🛠️</span> Dev Command Center
          </h1>
          <p className="font-body text-xs text-mocha mt-1 font-semibold uppercase tracking-wider">
            developer session active
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-5 py-2 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-full text-xs font-semibold transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <div className={`p-4 font-body text-sm rounded-xl mb-6 text-center animate-fade-up ${
          feedback.isError ? 'bg-muted-red/15 text-muted-red' : 'bg-olive/15 text-olive'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-latte pb-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'health', label: 'Health Status' },
          { id: 'database', label: 'Database Viewer' },
          { id: 'csv', label: 'CSV Exporters' },
          { id: 'maintenance', label: 'Maintenance Mode' },
          { id: 'auditor', label: 'Audit Log Auditor' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-roasted text-white shadow-sm'
                : 'text-mocha hover:bg-latte/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-mocha font-body animate-pulse">Running system diagnostics...</div>}

      {/* 1. HEALTH TAB */}
      {activeTab === 'health' && !loading && healthData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-latte text-center">
              <span className="text-xs font-bold text-mocha uppercase tracking-wider block mb-2">Supabase Connectivity</span>
              <span className={`text-lg font-bold ${healthData.db_connection === 'healthy' ? 'text-olive' : 'text-muted-red'}`}>
                {healthData.db_connection === 'healthy' ? '● Connected (Healthy)' : '○ Degraded'}
              </span>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-latte text-center">
              <span className="text-xs font-bold text-mocha uppercase tracking-wider block mb-2">Emergency Lock</span>
              <span className={`text-lg font-bold ${healthData.maintenance_mode ? 'text-muted-red animate-pulse' : 'text-olive'}`}>
                {healthData.maintenance_mode ? '🚨 Active (Block Mode)' : '🟢 Inactive (Normal)'}
              </span>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-latte text-center">
              <span className="text-xs font-bold text-mocha uppercase tracking-wider block mb-2">Active Data Tables</span>
              <span className="text-lg font-bold text-espresso">
                {Object.keys(healthData.tables || {}).length} Tables Verified
              </span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[24px] border border-latte">
            <h3 className="font-heading font-bold text-lg text-espresso mb-4">Table Diagnostics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(healthData.tables || {}).map(([tableName, data]: [string, any]) => (
                <div key={tableName} className="p-4 bg-warm-white border border-latte/60 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-espresso block">{tableName}</span>
                    <span className="text-xs text-mocha">{data.count} rows</span>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${data.status === 'healthy' ? 'bg-olive' : 'bg-muted-red'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. DATABASE VIEWER */}
      {activeTab === 'database' && !loading && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-espresso">Select Database Table</h3>
              <p className="font-body text-xs text-mocha">Displaying up to 100 most recent records</p>
            </div>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="h-11 px-4 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
            >
              {TABLES_LIST.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto border border-latte rounded-[24px] bg-warm-white">
            {tableRows.length > 0 ? (
              <table className="w-full border-collapse text-left text-xs font-body">
                <thead>
                  <tr className="bg-latte/20 font-bold uppercase tracking-wider text-mocha border-b border-latte">
                    {Object.keys(tableRows[0]).map((key) => (
                      <th key={key} className="p-4 whitespace-nowrap">{key}</th>
                    ))}
                    <th className="p-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-latte/60 text-espresso">
                  {tableRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-latte/5 transition-colors">
                      {Object.entries(row).map(([key, val]: [string, any], cellIdx) => {
                        let displayVal = val;
                        if (val === null || val === undefined) {
                          displayVal = <span className="text-mocha/30 italic">null</span>;
                        } else if (typeof val === 'object') {
                          displayVal = <code className="bg-cream p-1 rounded font-mono text-[10px] break-all">{JSON.stringify(val)}</code>;
                        } else if (typeof val === 'boolean') {
                          displayVal = val ? 'true' : 'false';
                        }
                        return (
                          <td key={cellIdx} className="p-4 max-w-xs truncate" title={String(val)}>
                            {displayVal}
                          </td>
                        );
                      })}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteRow(row)}
                          className="px-2.5 py-1 bg-[#A85A52] hover:bg-[#8e4841] text-white rounded font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-mocha">No records found inside {selectedTable}.</div>
            )}
          </div>
        </div>
      )}

      {/* 3. CSV EXPORTS */}
      {activeTab === 'csv' && !loading && (
        <div className="max-w-xl mx-auto glass-card p-6 md:p-8 rounded-[24px] border border-latte space-y-6">
          <div>
            <h3 className="font-heading font-bold text-xl text-espresso text-center">CSV Export Station</h3>
            <p className="font-body text-xs text-mocha text-center mt-1">Export full database tables to standard spreadsheet files</p>
          </div>
          <div className="divide-y divide-latte/60">
            {TABLES_LIST.map((table) => (
              <div key={table} className="py-4 flex justify-between items-center">
                <span className="font-body text-sm font-semibold text-espresso">{table}</span>
                <button
                  onClick={() => handleCsvExport(table)}
                  className="px-4 py-2 bg-roasted hover:bg-dark-roast text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Download CSV
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MAINTENANCE TAB */}
      {activeTab === 'maintenance' && !loading && (
        <div className="max-w-xl mx-auto glass-card p-6 md:p-8 rounded-[24px] border border-latte text-center space-y-6">
          <span className="text-5xl block animate-pulse">🛑</span>
          <div>
            <h3 className="font-heading font-bold text-2xl text-espresso">Emergency Maintenance Override</h3>
            <p className="font-body text-xs text-mocha mt-1.5 leading-relaxed max-w-sm mx-auto">
              Activating maintenance override blocks all public marketing and loyalty routes with a friendly update screen. Dev/Admin controls remain open.
            </p>
          </div>

          <div className={`p-4 rounded-xl font-body text-sm font-semibold ${
            maintenanceEnabled ? 'bg-muted-red/15 text-muted-red' : 'bg-olive/15 text-olive'
          }`}>
            Status: {maintenanceEnabled ? 'Active (Site Blocked)' : 'Inactive (Public Access Open)'}
          </div>

          <div className="flex gap-4 justify-center pt-2">
            {maintenanceEnabled ? (
              <button
                onClick={() => handleMaintenanceToggle(false)}
                className="px-8 py-3 bg-olive hover:bg-olive/90 text-white font-semibold rounded-full text-xs shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Deactivate & Restore Public Access
              </button>
            ) : (
              <button
                onClick={() => handleMaintenanceToggle(true)}
                className="px-8 py-3 bg-muted-red hover:bg-muted-red/90 text-white font-semibold rounded-full text-xs shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Activate Maintenance Shutdown
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. AUDITOR TAB */}
      {activeTab === 'auditor' && !loading && (
        <div className="space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg text-espresso">System Audit Log Auditor</h3>
            <p className="font-body text-xs text-mocha">Audit trail logs tracking login activities and administrative actions</p>
          </div>

          <div className="space-y-3">
            {tableRows.map((log) => (
              <div key={log.id} className="p-4 bg-warm-white border border-latte rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <span className="text-xs font-bold text-mocha uppercase block">{new Date(log.created_at).toLocaleString()}</span>
                  <span className="font-heading font-semibold text-espresso text-sm mt-0.5 block">{log.action}</span>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-xs text-mocha block">Operator: {log.performed_by || 'system'}</span>
                  <code className="text-[10px] text-roasted font-mono bg-cream px-1.5 py-0.5 rounded inline-block mt-1">
                    {JSON.stringify(log.details)}
                  </code>
                </div>
              </div>
            ))}
            {tableRows.length === 0 && (
              <div className="text-center py-12 text-mocha font-body">No audit logs logged in database.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
