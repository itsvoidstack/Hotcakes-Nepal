'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type CampaignType =
  | 'promotion' | 'offer' | 'announcement' | 'seasonal'
  | 'event' | 'banner' | 'limited_deal';
export type CampaignPlacement =
  | 'home_banner' | 'hero_section' | 'dashboard_card' | 'all_pages';

export interface GeneralCampaign {
  id: string;
  name: string;
  tagline: string | null;
  is_active: boolean;
  status: CampaignStatus;
  type: CampaignType;
  priority: number;
  placement: CampaignPlacement;
  start_date: string | null;
  end_date: string | null;
  metadata: CampaignMetadata;
  created_at: string;
}

export interface CampaignMetadata {
  description?: string;
  full_description?: string;
  tags?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  promo_code?: string;
  visibility?: 'public' | 'logged_in' | 'homepage_only' | 'dashboard_only';
}

const BLANK_METADATA: CampaignMetadata = {
  description: '', full_description: '', tags: '',
  cta_text: '', cta_link: '', image_url: '',
  promo_code: '', visibility: 'public',
};

const BLANK: Partial<GeneralCampaign> = {
  name: '', tagline: '', status: 'draft', type: 'promotion',
  priority: 0, placement: 'home_banner',
  start_date: null, end_date: null, metadata: { ...BLANK_METADATA },
};

function getErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : 'Something went wrong.';
}

// ── Helper badges ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<CampaignStatus, string> = {
  active:  'bg-olive/15 text-olive',
  draft:   'bg-latte/30 text-mocha',
  paused:  'bg-amber-100 text-amber-700',
  ended:   'bg-muted-red/15 text-muted-red',
};
const TYPE_LABELS: Record<CampaignType, string> = {
  promotion: 'Promotion', offer: 'Offer', announcement: 'Announcement',
  seasonal: 'Seasonal', event: 'Event', banner: 'Banner', limited_deal: 'Limited Deal',
};
const PLACEMENT_LABELS: Record<CampaignPlacement, string> = {
  home_banner: 'Home Banner', hero_section: 'Hero Section',
  dashboard_card: 'Dashboard Card', all_pages: 'All Pages',
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status] ?? 'bg-latte/20 text-mocha'}`}>
      {status}
    </span>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props { token: string; }

// ── Main component ───────────────────────────────────────────────────────────
export default function CampaignsTab({ token }: Props) {
  const [campaigns, setCampaigns] = useState<GeneralCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<GeneralCampaign> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<GeneralCampaign | null>(null);

  const inputCls = 'w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted';
  const Spinner = () => <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />;

  const showFeedback = (msg: string, isErr = false) => {
    if (isErr) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); }
    else       { setMessage(msg);  setTimeout(() => setMessage(''),  5000); }
  };

  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns', { headers: authHeaders });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCampaigns(d.campaigns || []);
    } catch (e) { showFeedback(getErrorMessage(e), true); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch('/api/admin/campaigns', {
        method: isNew ? 'POST' : 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(editing),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      showFeedback(isNew ? 'Campaign created!' : 'Campaign updated!');
      setEditing(null);
      await loadCampaigns();
    } catch (e) { showFeedback(getErrorMessage(e), true); }
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (c: GeneralCampaign) => {
    const next: CampaignStatus = c.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ id: c.id, status: next }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      showFeedback(next === 'active' ? 'Campaign resumed.' : 'Campaign paused.');
      await loadCampaigns();
    } catch (e) { showFeedback(getErrorMessage(e), true); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/campaigns?id=${id}`, { method: 'DELETE', headers: authHeaders });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      showFeedback('Campaign deleted.');
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) { showFeedback(getErrorMessage(e), true); }
  };

  const setMeta = (key: keyof CampaignMetadata, val: string) =>
    setEditing(prev => prev ? { ...prev, metadata: { ...(prev.metadata ?? {}), [key]: val } } : prev);

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Feedback */}
      {message  && <div className="p-4 bg-olive/15 text-olive font-body text-sm rounded-xl text-center animate-fade-up">{message}</div>}
      {errorMsg && <div className="p-4 bg-muted-red/15 text-muted-red font-body text-sm rounded-xl text-center animate-fade-up">{errorMsg}</div>}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading font-bold text-xl text-espresso">Campaigns</h2>
          <p className="text-xs text-mocha mt-0.5">Promotions, offers, announcements, and banners. Streak rewards are managed separately.</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing({ ...BLANK, metadata: { ...BLANK_METADATA } })}
            className="px-5 py-2.5 bg-roasted hover:bg-dark-roast text-white rounded-full text-xs font-semibold shadow-sm"
          >
            + New Campaign
          </button>
        )}
      </div>

      {/* ── FORM ── */}
      {editing && (
        <form onSubmit={handleSave} className="glass-card p-6 md:p-8 rounded-[24px] space-y-6 animate-fade-up">
          <h3 className="font-heading font-bold text-lg text-espresso">
            {editing.id ? 'Edit Campaign' : 'New Campaign'}
          </h3>

          {/* Basic Info */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-bold text-mocha uppercase tracking-widest mb-3">Basic Info</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Campaign Name *</label>
                <input required type="text" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Summer Offer 2025" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Type</label>
                <select value={editing.type || 'promotion'} onChange={e => setEditing({ ...editing, type: e.target.value as CampaignType })} className={inputCls}>
                  {(Object.entries(TYPE_LABELS) as [CampaignType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Tagline / Short Description</label>
              <input type="text" value={editing.tagline || ''} onChange={e => setEditing({ ...editing, tagline: e.target.value })} placeholder="One-line hook shown in the banner" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Full Description</label>
              <textarea value={editing.metadata?.full_description || ''} onChange={e => setMeta('full_description', e.target.value)} placeholder="Detailed campaign description (internal or public)" rows={3} className="w-full px-3 py-2.5 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Tags / Labels</label>
              <input type="text" value={editing.metadata?.tags || ''} onChange={e => setMeta('tags', e.target.value)} placeholder="e.g. coffee, seasonal, 20% off" className={inputCls} />
            </div>
          </fieldset>

          {/* Timing */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-bold text-mocha uppercase tracking-widest mb-3">Timing</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Status</label>
                <select value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value as CampaignStatus })} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Start Date</label>
                <input type="date" value={editing.start_date ? editing.start_date.slice(0, 10) : ''} onChange={e => setEditing({ ...editing, start_date: e.target.value || null })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">End Date</label>
                <input type="date" value={editing.end_date ? editing.end_date.slice(0, 10) : ''} onChange={e => setEditing({ ...editing, end_date: e.target.value || null })} className={inputCls} />
              </div>
            </div>
          </fieldset>

          {/* Display Rules */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-bold text-mocha uppercase tracking-widest mb-3">Display Rules</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Placement</label>
                <select value={editing.placement || 'home_banner'} onChange={e => setEditing({ ...editing, placement: e.target.value as CampaignPlacement })} className={inputCls}>
                  {(Object.entries(PLACEMENT_LABELS) as [CampaignPlacement, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Priority (higher = wins)</label>
                <input type="number" min={0} max={100} value={editing.priority ?? 0} onChange={e => setEditing({ ...editing, priority: parseInt(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Visibility</label>
                <select value={editing.metadata?.visibility || 'public'} onChange={e => setMeta('visibility', e.target.value)} className={inputCls}>
                  <option value="public">Public (everyone)</option>
                  <option value="homepage_only">Homepage only</option>
                  <option value="dashboard_only">Dashboard only</option>
                  <option value="logged_in">Logged-in users only</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Actions (CTA) */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-bold text-mocha uppercase tracking-widest mb-3">Actions</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">CTA Button Text</label>
                <input type="text" value={editing.metadata?.cta_text || ''} onChange={e => setMeta('cta_text', e.target.value)} placeholder="e.g. Order Now, Learn More" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">CTA Link</label>
                <input type="text" value={editing.metadata?.cta_link || ''} onChange={e => setMeta('cta_link', e.target.value)} placeholder="/order or https://…" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Optional Promo Code</label>
              <input type="text" value={editing.metadata?.promo_code || ''} onChange={e => setMeta('promo_code', e.target.value)} placeholder="e.g. SUMMER20" className={`${inputCls} uppercase`} />
            </div>
          </fieldset>

          {/* Media */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-bold text-mocha uppercase tracking-widest mb-3">Media</legend>
            <div>
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Banner Image URL</label>
              {editing.metadata?.image_url && (
                <img src={editing.metadata.image_url} alt="Preview" className="w-full max-h-32 object-cover rounded-xl border border-latte mb-2" />
              )}
              <input type="text" value={editing.metadata?.image_url || ''} onChange={e => setMeta('image_url', e.target.value)} placeholder="https://… or /images/…" className={inputCls} />
            </div>
          </fieldset>

          {/* Form buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setEditing(null)} disabled={saving} className="px-6 py-2.5 border border-latte text-mocha hover:bg-latte/15 rounded-full text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white rounded-full text-xs font-semibold flex items-center gap-2">
              {saving ? <><Spinner /> Saving&hellip;</> : editing.id ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      )}

      {/* ── CAMPAIGN LIST ── */}
      {!editing && (
        <>
          {loading && <div className="text-center py-10 text-mocha font-body text-sm">Loading campaigns&hellip;</div>}

          {!loading && campaigns.length === 0 && (
            <div className="text-center py-14 bg-warm-white rounded-2xl border border-latte">
              <p className="font-heading font-bold text-espresso mb-1">No campaigns yet</p>
              <p className="text-xs text-mocha">Create your first promotion, offer, or announcement above.</p>
            </div>
          )}

          {!loading && campaigns.length > 0 && (
            <div className="space-y-3">
              {campaigns.map(c => {
                const now = new Date();
                const expired = c.end_date ? new Date(c.end_date) < now : false;
                const meta = c.metadata ?? {};
                return (
                  <div key={c.id} className={`bg-warm-white rounded-2xl border p-5 space-y-3 transition-all ${expired ? 'border-latte/40 opacity-60' : 'border-latte'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <StatusBadge status={c.status as CampaignStatus} />
                          <span className="px-2 py-0.5 bg-latte/20 text-mocha rounded-full text-[10px] font-medium">{TYPE_LABELS[c.type as CampaignType] ?? c.type}</span>
                          <span className="px-2 py-0.5 bg-latte/20 text-mocha rounded-full text-[10px] font-medium">{PLACEMENT_LABELS[c.placement as CampaignPlacement] ?? c.placement}</span>
                          {c.priority > 0 && <span className="px-2 py-0.5 bg-roasted/10 text-roasted rounded-full text-[10px] font-semibold">P{c.priority}</span>}
                          {expired && <span className="px-2 py-0.5 bg-muted-red/10 text-muted-red rounded-full text-[10px] font-semibold">Expired</span>}
                        </div>
                        <h3 className="font-heading font-bold text-base text-espresso truncate">{c.name}</h3>
                        {c.tagline && <p className="text-xs text-mocha mt-0.5 line-clamp-1">{c.tagline}</p>}
                        <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-mocha/70 font-body">
                          {c.start_date && <span>From: {new Date(c.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          {c.end_date   && <span>Until: {new Date(c.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          {meta.cta_text && <span>CTA: {meta.cta_text}</span>}
                          {meta.promo_code && <span className="font-mono font-semibold text-roasted">{meta.promo_code}</span>}
                        </div>
                      </div>
                      {/* Right: actions */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button onClick={() => setPreview(c)} className="px-3 py-1.5 border border-latte text-mocha hover:bg-latte/10 rounded-lg text-xs font-medium">Preview</button>
                        <button onClick={() => setEditing({ ...c, metadata: { ...BLANK_METADATA, ...(c.metadata ?? {}) } })} className="px-3 py-1.5 bg-roasted hover:bg-dark-roast text-white rounded-lg text-xs font-medium">Edit</button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${c.status === 'active' ? 'border-amber-400 text-amber-700 hover:bg-amber-50' : 'border-olive text-olive hover:bg-olive/5'}`}
                        >
                          {c.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-lg text-xs font-medium">Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── PREVIEW MODAL ── */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-cream rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div><StatusBadge status={preview.status as CampaignStatus} /><h3 className="font-heading font-bold text-xl text-espresso mt-2">{preview.name}</h3></div>
              <button onClick={() => setPreview(null)} className="text-mocha hover:text-espresso text-lg leading-none">&times;</button>
            </div>
            {preview.metadata?.image_url && (
              <img src={preview.metadata.image_url} alt={preview.name} className="w-full rounded-xl object-cover max-h-40 border border-latte" />
            )}
            {preview.tagline && <p className="font-body text-mocha text-sm">{preview.tagline}</p>}
            {preview.metadata?.full_description && <p className="font-body text-mocha/80 text-xs leading-relaxed">{preview.metadata.full_description}</p>}
            <div className="grid grid-cols-2 gap-2 text-xs font-body">
              <div><span className="font-semibold text-mocha uppercase text-[10px]">Type</span><p className="text-espresso">{TYPE_LABELS[preview.type as CampaignType] ?? preview.type}</p></div>
              <div><span className="font-semibold text-mocha uppercase text-[10px]">Placement</span><p className="text-espresso">{PLACEMENT_LABELS[preview.placement as CampaignPlacement] ?? preview.placement}</p></div>
              <div><span className="font-semibold text-mocha uppercase text-[10px]">Priority</span><p className="text-espresso">{preview.priority}</p></div>
              <div><span className="font-semibold text-mocha uppercase text-[10px]">Visibility</span><p className="text-espresso capitalize">{(preview.metadata?.visibility ?? 'public').replace('_', ' ')}</p></div>
            </div>
            {(preview.metadata?.cta_text || preview.metadata?.promo_code) && (
              <div className="flex gap-3 flex-wrap pt-1">
                {preview.metadata?.cta_text && preview.metadata?.cta_link && (
                  <a href={preview.metadata.cta_link} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-roasted text-white rounded-full text-xs font-semibold hover:bg-dark-roast transition-colors">
                    {preview.metadata.cta_text}
                  </a>
                )}
                {preview.metadata?.promo_code && (
                  <span className="px-4 py-2 border border-roasted text-roasted rounded-full text-xs font-mono font-bold">{preview.metadata.promo_code}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
