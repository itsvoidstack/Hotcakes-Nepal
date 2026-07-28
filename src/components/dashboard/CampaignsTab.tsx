'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type CampaignType = 'promotion' | 'offer' | 'announcement' | 'seasonal' | 'event' | 'limited_deal';
export type CampaignPlacement = 'current_offers' | 'home_banner' | 'hero_section' | 'all_pages';

export interface HowItWorksMeta {
  steps?: string[];
  footnote?: string;
}

export interface CampaignMetadata {
  description?: string;
  tags?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  badge_text?: string; // Editable display text e.g. "20% CLAIMED"
  promo_code?: string;
  visibility?: 'public' | 'logged_in' | 'homepage_only';
  how_it_works?: HowItWorksMeta;
}

export interface GeneralCampaign {
  id?: string;
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
  created_at?: string;
}

const BLANK_HOW_IT_WORKS: HowItWorksMeta = {
  steps: ['Add eligible item to cart', 'Apply promotion at checkout', 'Enjoy your reward!'],
  footnote: '* Valid during campaign period only',
};

const BLANK_METADATA: CampaignMetadata = {
  description: '',
  tags: '',
  cta_text: '',
  cta_link: '',
  image_url: '',
  badge_text: '20% CLAIMED',
  promo_code: '',
  visibility: 'public',
  how_it_works: { ...BLANK_HOW_IT_WORKS },
};

const BLANK: GeneralCampaign = {
  name: '',
  tagline: '',
  is_active: false,
  status: 'draft',
  type: 'promotion',
  priority: 0,
  placement: 'current_offers',
  start_date: null,
  end_date: null,
  metadata: { ...BLANK_METADATA },
};

function getErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : 'Something went wrong.';
}

// Helper badges
const STATUS_STYLES: Record<CampaignStatus, string> = {
  active: 'bg-olive/15 text-olive',
  draft: 'bg-latte/30 text-mocha',
  paused: 'bg-amber-100 text-amber-700',
  ended: 'bg-muted-red/15 text-muted-red',
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status] || 'bg-latte/20 text-mocha'}`}>
      {status}
    </span>
  );
}

interface Props { token: string; }

export default function CampaignsTab({ token }: Props) {
  const [campaigns, setCampaigns] = useState<GeneralCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<GeneralCampaign | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<GeneralCampaign | null>(null);

  const inputCls = 'w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted';
  const Spinner = () => <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />;

  const showFeedback = (msg: string, isErr = false) => {
    if (isErr) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); }
    else { setMessage(msg); setTimeout(() => setMessage(''), 5000); }
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

  // Handle image upload via existing /api/admin/upload endpoint
  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'campaigns');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Image upload failed');

      setMeta('image_url', d.url);
      showFeedback('Banner image uploaded successfully!');
    } catch (e) {
      showFeedback(getErrorMessage(e), true);
    } finally {
      setUploadingImage(false);
    }
  };

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
      showFeedback(next === 'active' ? 'Campaign activated.' : 'Campaign paused.');
      await loadCampaigns();
    } catch (e) { showFeedback(getErrorMessage(e), true); }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/campaigns?id=${id}`, { method: 'DELETE', headers: authHeaders });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      showFeedback('Campaign deleted.');
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) { showFeedback(getErrorMessage(e), true); }
  };

  const setMeta = (key: keyof CampaignMetadata, val: unknown) =>
    setEditing(prev => prev ? { ...prev, metadata: { ...(prev.metadata || {}), [key]: val } } : prev);

  // Dynamic How it Works Steps editing
  const handleStepChange = (index: number, val: string) => {
    if (!editing) return;
    const currentSteps = editing.metadata?.how_it_works?.steps || [];
    const newSteps = [...currentSteps];
    newSteps[index] = val;
    setMeta('how_it_works', {
      ...(editing.metadata?.how_it_works || {}),
      steps: newSteps,
    });
  };

  const handleAddStep = () => {
    if (!editing) return;
    const currentSteps = editing.metadata?.how_it_works?.steps || [];
    setMeta('how_it_works', {
      ...(editing.metadata?.how_it_works || {}),
      steps: [...currentSteps, ''],
    });
  };

  const handleRemoveStep = (index: number) => {
    if (!editing) return;
    const currentSteps = editing.metadata?.how_it_works?.steps || [];
    setMeta('how_it_works', {
      ...(editing.metadata?.how_it_works || {}),
      steps: currentSteps.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {message && <div className="p-4 bg-olive/15 text-olive font-body text-sm rounded-xl text-center animate-fade-up">{message}</div>}
      {errorMsg && <div className="p-4 bg-muted-red/15 text-muted-red font-body text-sm rounded-xl text-center animate-fade-up">{errorMsg}</div>}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading font-bold text-xl text-espresso">Promotional Campaigns</h2>
          <p className="text-xs text-mocha mt-0.5">Manage offers, discounts, BOGO events, and banners. Streak rewards are managed separately under Streak tab.</p>
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

      {/* ── FORM EDIT / CREATE ── */}
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
                <input required type="text" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Buy 1 Get 1 Free" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Type</label>
                <select value={editing.type || 'promotion'} onChange={e => setEditing({ ...editing, type: e.target.value as CampaignType })} className={inputCls}>
                  <option value="promotion">Promotion</option>
                  <option value="offer">Offer</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="event">Event</option>
                  <option value="limited_deal">Limited Deal</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Short Tagline / Hook</label>
              <input type="text" value={editing.tagline || ''} onChange={e => setEditing({ ...editing, tagline: e.target.value })} placeholder="e.g. Buy any coffee and get another one absolutely free!" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Full Description</label>
              <textarea value={editing.metadata?.description || ''} onChange={e => setMeta('description', e.target.value)} placeholder="Detailed campaign terms or overview" rows={2} className="w-full px-3 py-2 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted resize-none" />
            </div>
          </fieldset>

          {/* Timing & Status */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-bold text-mocha uppercase tracking-widest mb-3">Timing & Priority</legend>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Status</label>
                <select value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value as CampaignStatus, is_active: e.target.value === 'active' })} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Priority (Higher wins)</label>
                <input type="number" min={0} max={100} value={editing.priority ?? 0} onChange={e => setEditing({ ...editing, priority: parseInt(e.target.value) || 0 })} className={inputCls} />
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

          {/* Display Badges & Promotion Details */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-bold text-mocha uppercase tracking-widest mb-3">Display Badge & Actions</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Claimed Badge Text (Editable)</label>
                <input type="text" value={editing.metadata?.badge_text || ''} onChange={e => setMeta('badge_text', e.target.value)} placeholder="e.g. 20% CLAIMED, BOGO, 50% OFF" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Promo Code (Optional)</label>
                <input type="text" value={editing.metadata?.promo_code || ''} onChange={e => setMeta('promo_code', e.target.value)} placeholder="e.g. WEEKEND15" className={`${inputCls} uppercase`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Tags</label>
                <input type="text" value={editing.metadata?.tags || ''} onChange={e => setMeta('tags', e.target.value)} placeholder="e.g. Cold Brew, Coffee" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">CTA Button Text</label>
                <input type="text" value={editing.metadata?.cta_text || ''} onChange={e => setMeta('cta_text', e.target.value)} placeholder="e.g. Order Now" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">CTA Button Link</label>
                <input type="text" value={editing.metadata?.cta_link || ''} onChange={e => setMeta('cta_link', e.target.value)} placeholder="e.g. /menu or /order" className={inputCls} />
              </div>
            </div>
          </fieldset>

          {/* Dynamic "How it Works" Editor */}
          <fieldset className="space-y-4 bg-warm-white p-4 rounded-2xl border border-latte">
            <legend className="text-[10px] font-bold text-roasted uppercase tracking-widest mb-1">
              Structured &quot;How it Works&quot; Editor
            </legend>
            <p className="text-xs text-mocha mb-3">
              Define the step-by-step instructions displayed inside this campaign card on desktop and mobile.
            </p>

            <div className="space-y-2">
              {(editing.metadata?.how_it_works?.steps || []).map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-roasted text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={e => handleStepChange(idx, e.target.value)}
                    placeholder={`Step ${idx + 1} instruction...`}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-2 text-muted-red hover:bg-muted-red/10 rounded-lg text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddStep}
                className="px-4 py-2 border border-dashed border-roasted text-roasted hover:bg-roasted/5 rounded-xl text-xs font-semibold mt-2"
              >
                + Add Step
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Footnote / Terms Note</label>
              <input
                type="text"
                value={editing.metadata?.how_it_works?.footnote || ''}
                onChange={e => setMeta('how_it_works', { ...(editing.metadata?.how_it_works || {}), footnote: e.target.value })}
                placeholder="e.g. * Valid on all coffee drinks"
                className={inputCls}
              />
            </div>
          </fieldset>

          {/* Media / Image Upload with Fallback */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-bold text-mocha uppercase tracking-widest mb-3">Media / Banner Upload</legend>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-mocha uppercase">Banner Image</label>
              {editing.metadata?.image_url && (
                <img src={editing.metadata.image_url} alt="Preview" className="w-full max-h-36 object-cover rounded-xl border border-latte" />
              )}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editing.metadata?.image_url || ''}
                  onChange={e => setMeta('image_url', e.target.value)}
                  placeholder="https://... or upload below"
                  className={inputCls}
                />
                <label className="px-4 py-2.5 bg-latte/30 hover:bg-latte/50 text-espresso rounded-xl text-xs font-semibold cursor-pointer shrink-0 border border-latte">
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleUploadBanner} disabled={uploadingImage} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] text-mocha">If no image is uploaded, a styled gradient theme will be rendered automatically.</p>
            </div>
          </fieldset>

          {/* Form Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setEditing(null)} disabled={saving} className="px-6 py-2.5 border border-latte text-mocha hover:bg-latte/15 rounded-full text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={saving || uploadingImage} className="px-6 py-2.5 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white rounded-full text-xs font-semibold flex items-center gap-2">
              {saving ? <><Spinner /> Saving&hellip;</> : editing.id ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      )}

      {/* ── CAMPAIGN LIST ── */}
      {!editing && (
        <>
          {loading && <div className="text-center py-10 text-mocha font-body text-sm">Loading promotional campaigns&hellip;</div>}

          {!loading && campaigns.length === 0 && (
            <div className="text-center py-14 bg-warm-white rounded-2xl border border-latte">
              <p className="font-heading font-bold text-espresso mb-1">No promotional campaigns yet</p>
              <p className="text-xs text-mocha">Create your first offer, BOGO deal, or announcement above.</p>
            </div>
          )}

          {!loading && campaigns.length > 0 && (
            <div className="space-y-3">
              {campaigns.map(c => {
                const meta = c.metadata || {};
                const now = new Date();
                const expired = c.end_date ? new Date(c.end_date) < now : false;
                return (
                  <div key={c.id} className={`bg-warm-white rounded-2xl border p-5 space-y-3 transition-all ${expired ? 'border-latte/40 opacity-60' : 'border-latte'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <StatusBadge status={c.status as CampaignStatus} />
                          {meta.badge_text && <span className="px-2 py-0.5 bg-roasted/10 text-roasted rounded-full text-[10px] font-bold">{meta.badge_text}</span>}
                          {c.priority > 0 && <span className="px-2 py-0.5 bg-latte/30 text-mocha rounded-full text-[10px] font-semibold">Priority P{c.priority}</span>}
                          {expired && <span className="px-2 py-0.5 bg-muted-red/10 text-muted-red rounded-full text-[10px] font-semibold">Expired</span>}
                        </div>
                        <h3 className="font-heading font-bold text-base text-espresso truncate">{c.name}</h3>
                        {c.tagline && <p className="text-xs text-mocha mt-0.5 line-clamp-1">{c.tagline}</p>}
                        <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-mocha/70 font-body">
                          {c.start_date && <span>Start: {new Date(c.start_date).toLocaleDateString()}</span>}
                          {c.end_date && <span>End: {new Date(c.end_date).toLocaleDateString()}</span>}
                          {meta.promo_code && <span className="font-mono font-bold text-roasted">Code: {meta.promo_code}</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button onClick={() => setPreview(c)} className="px-3 py-1.5 border border-latte text-mocha hover:bg-latte/10 rounded-lg text-xs font-medium">Preview</button>
                        <button onClick={() => setEditing(c)} className="px-3 py-1.5 bg-roasted hover:bg-dark-roast text-white rounded-lg text-xs font-medium">Edit</button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${c.status === 'active' ? 'border-amber-400 text-amber-700 hover:bg-amber-50' : 'border-olive text-olive hover:bg-olive/5'}`}
                        >
                          {c.status === 'active' ? 'Pause' : 'Activate'}
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

      {/* ── LIVE PREVIEW MODAL ── */}
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
            {preview.metadata?.badge_text && (
              <span className="inline-block px-3 py-1 bg-roasted text-white text-xs font-bold rounded-full">{preview.metadata.badge_text}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
