'use client';

import { useState, useEffect, useMemo } from 'react';
import { Database } from '@/lib/supabase/database.types';
import { OpeningHours, DEFAULT_OPENING_HOURS, DAY_NAMES } from '@/lib/openingHours';

type StreakRecord = Database['public']['Tables']['streak_records']['Row'] & {
  rewards_redeemed?: number;
};

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : '';
}

// ── Collapsible section component ──────────────────────────────────────────
function Section({
  title, defaultOpen = false, children
}: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-2xl border border-latte overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-latte/10 transition-colors"
      >
        <span className="font-heading font-bold text-base text-espresso">{title}</span>
        <svg
          className={`w-4 h-4 text-mocha transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6 pt-1 space-y-4">{children}</div>}
    </div>
  );
}

interface MenuItem {
  id: string; category: string; name: string; slug: string;
  description: string | null; price: number; image_url: string | null;
  is_featured: boolean; is_available: boolean; display_order: number;
  dietary_tags?: string;
}
interface OrderLink { platform: string; url: string | null; is_active: boolean; }
interface ContactInfo { key: string; value: string; }
interface Campaign {
  name: string; tagline: string | null; is_active: boolean;
  start_date: string | null; end_date: string | null;
}
interface Vacancy {
  id?: string; title: string; description: string | null;
  google_form_link: string; image_url: string | null; is_active: boolean;
}
interface SiteSetting { key: string; value: unknown; }
interface DashboardClientProps { token: string; onLogout: () => void; }

export default function DashboardClient({ token, onLogout }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'streak' | 'order' | 'vacancies' | 'settings'>('menu');

  // Global loading / feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Menu
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [menuFeaturedFilter, setMenuFeaturedFilter] = useState('all');
  const [menuAvailableFilter, setMenuAvailableFilter] = useState('all');
  const [menuImageFilter, setMenuImageFilter] = useState('all');
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const uniqueCategories = useMemo(() => {
    const s = new Set<string>(); menuItems.forEach(i => s.add(i.category)); return Array.from(s);
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => menuItems.filter(item => {
    const q = menuSearchQuery.toLowerCase();
    const matchesSearch = !q || item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false);
    const matchesCategory = menuCategoryFilter === 'all' || item.category === menuCategoryFilter;
    const matchesFeatured = menuFeaturedFilter === 'all' ||
      (menuFeaturedFilter === 'featured' && item.is_featured) ||
      (menuFeaturedFilter === 'not-featured' && !item.is_featured);
    const matchesAvailable = menuAvailableFilter === 'all' ||
      (menuAvailableFilter === 'available' && item.is_available) ||
      (menuAvailableFilter === 'hidden' && !item.is_available);
    const hasImage = !!item.image_url;
    const matchesImage = menuImageFilter === 'all' ||
      (menuImageFilter === 'has-image' && hasImage) ||
      (menuImageFilter === 'missing-image' && !hasImage);
    return matchesSearch && matchesCategory && matchesFeatured && matchesAvailable && matchesImage;
  }), [menuItems, menuSearchQuery, menuCategoryFilter, menuFeaturedFilter, menuAvailableFilter, menuImageFilter]);

  // 2. Streak
  const [streakQuery, setStreakQuery] = useState('');
  const [streakResult, setStreakResult] = useState<StreakRecord | null>(null);
  const [streakStampPhone, setStreakStampPhone] = useState('');
  const [streakRecords, setStreakRecords] = useState<StreakRecord[]>([]);
  const [streakMetrics, setStreakMetrics] = useState<{
    total_customers: number; total_stamps: number;
    total_active_rewards: number; total_rewards_redeemed?: number;
  } | null>(null);
  const [streakLoading, setStreakLoading] = useState(false);

  // 3. Order links
  const [orderLinks, setOrderLinks] = useState<OrderLink[]>([]);

  // 4. Vacancies
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [editingVacancy, setEditingVacancy] = useState<Partial<Vacancy> | null>(null);

  // 5. Settings
  const [isOpen, setIsOpen] = useState(true);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_OPENING_HOURS);
  const [applyAllTemplate, setApplyAllTemplate] = useState({ openTime: '08:00', closeTime: '20:00' });

  // 6. Media
  const [locationPhotos, setLocationPhotos] = useState<string[]>([]);
  const [contactShowcaseImages, setContactShowcaseImages] = useState<string[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [uploadingVacancy, setUploadingVacancy] = useState(false);
  const [uploadingLocation, setUploadingLocation] = useState(false);
  const [uploadingContactShowcase, setUploadingContactShowcase] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingOrderLinks, setSavingOrderLinks] = useState(false);
  const [savingVacancy, setSavingVacancy] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  // ── Data loaders ────────────────────────────────────────────────────────
  const loadStreakData = async () => {
    setStreakLoading(true);
    try {
      const res = await fetch('/api/admin/streak', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setStreakRecords(d.records || []); setStreakMetrics(d.metrics || null); }
    } catch (err) { console.error(err); } finally { setStreakLoading(false); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [menuRes, settingsRes] = await Promise.all([
        fetch('/api/admin/menu', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const menuData = await menuRes.json();
      setMenuItems(menuData.items || []);
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setOrderLinks(s.orderLinks || []);
        setVacancies(s.vacancies || []);
        setContacts(s.contactInfo || []);
        setCampaign(s.campaigns?.[0] || null);
        const ss: SiteSetting[] = s.siteSettings || [];
        const get = (k: string) => ss.find(x => x.key === k)?.value;
        setIsOpen((get('open_status') as { is_open?: boolean } | null)?.is_open ?? true);
        setGoogleMapsUrl((get('google_maps') as { url?: string } | null)?.url ?? 'https://maps.app.goo.gl/y2qh1TqYovxSpzDL9');
        setLocationPhotos((get('location_photos') as string[]) || []);
        setHeroImageUrl((get('hero_image') as { url?: string } | null)?.url || '');
        setLogoImageUrl((get('logo_image') as { url?: string } | null)?.url || '');
        setContactShowcaseImages((get('contact_showcase_images') as string[]) || []);
        const hrs = get('opening_hours');
        setOpeningHours(hrs ? (hrs as OpeningHours) : DEFAULT_OPENING_HOURS);
      }
      await loadStreakData();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); }
    else { setMessage(msg); setTimeout(() => setMessage(''), 5000); }
  };

  // helper for contact field updates
  const setContact = (key: string, val: string) =>
    setContacts(prev => {
      const idx = prev.findIndex(c => c.key === key);
      if (idx > -1) { const u = [...prev]; u[idx] = { ...u[idx], value: val }; return u; }
      return [...prev, { key, value: val }];
    });

  // ── Menu handlers ────────────────────────────────────────────────────────
  const handleStartEdit = (item: MenuItem) => {
    let desc = item.description || '', tags = '';
    if (desc.includes(' | Tags: ')) { const p = desc.split(' | Tags: '); desc = p[0]; tags = p[1]; }
    setEditingItem({ ...item, description: desc, dietary_tags: tags });
  };

  const handleUploadMenuItemImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || uploadingMenu) return;
    setUploadingMenu(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'menu-images');
      if (editingItem?.slug) fd.append('filename', `menu-${editingItem.slug}`);
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Upload failed');
      setEditingItem(prev => prev ? { ...prev, image_url: d.url } : null);
      showFeedback('Image uploaded!');
    } catch (err: unknown) { showFeedback(getErrorMessage(err) || 'Upload failed', true); }
    finally { setUploadingMenu(false); }
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingItem) return;
    setSavingMenu(true);
    try {
      const isNew = !editingItem.id;
      const finalDesc = (editingItem.description || '') + (editingItem.dietary_tags ? ` | Tags: ${editingItem.dietary_tags}` : '');
      const res = await fetch('/api/admin/menu', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editingItem, description: finalDesc }),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Save failed');
      const saved: MenuItem = d.item || { ...editingItem, id: d.id || editingItem.id, description: finalDesc } as MenuItem;
      setMenuItems(prev => isNew ? [...prev, saved] : prev.map(i => i.id === saved.id ? saved : i));
      showFeedback('Saved successfully'); setEditingItem(null);
    } catch { showFeedback('Something went wrong. Try again.', true); loadData(); }
    finally { setSavingMenu(false); }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    setMenuItems(prev => prev.filter(i => i.id !== id));
    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Delete failed');
      showFeedback('Item deleted!');
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); loadData(); }
  };

  const handleBulkDelete = async () => {
    setShowBulkDeleteConfirm(false);
    try {
      const res = await fetch(`/api/admin/menu?ids=${selectedMenuItems.join(',')}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Bulk delete failed'); }
      const d = await res.json();
      showFeedback(`${d.deletedCount} items deleted!`);
      setMenuItems(prev => prev.filter(i => !selectedMenuItems.includes(i.id)));
      setSelectedMenuItems([]);
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); }
  };

  // ── Streak handlers ──────────────────────────────────────────────────────
  const handleStreakSearch = async (e: React.FormEvent) => {
    e.preventDefault(); if (!streakQuery.trim()) return;
    try {
      const res = await fetch('/api/admin/streak', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'search', phone_number: streakQuery.trim(), customer_code: streakQuery.trim() }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Search failed');
      setStreakResult(d.record); if (!d.record) showFeedback('No profile found.', true);
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); }
  };

  const handleAddStamp = async (phone: string) => {
    if (!phone.trim()) return;
    try {
      const res = await fetch('/api/admin/streak', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'stamp', phone_number: phone.trim() }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Stamp failed');
      showFeedback('Stamp added (+1)!'); setStreakResult(d.record); setStreakStampPhone(''); await loadStreakData();
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); }
  };

  const handleResetStreak = async (code: string) => {
    if (!confirm("Reset this customer's streak to 0?")) return;
    try {
      const res = await fetch('/api/admin/streak', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'reset', customer_code: code }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Reset failed');
      showFeedback('Streak reset to 0!'); setStreakResult(d.record); await loadStreakData();
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); }
  };

  const handleDeleteStreak = async (code: string) => {
    if (!confirm("Permanently delete this customer's profile?")) return;
    try {
      const res = await fetch('/api/admin/streak', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'delete', customer_code: code }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Delete failed');
      showFeedback('Profile deleted!'); setStreakResult(null); await loadStreakData();
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); }
  };

  // ── Order links handler ──────────────────────────────────────────────────
  const handleSaveOrderLinks = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingOrderLinks(true);
    try {
      const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'order_links', data: orderLinks }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Save failed');
      showFeedback('Delivery links saved!');
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); }
    finally { setSavingOrderLinks(false); }
  };

  // ── Vacancy handlers ─────────────────────────────────────────────────────
  const handleUploadVacancyImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || uploadingVacancy) return;
    setUploadingVacancy(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'vacancy-images');
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Upload failed');
      setEditingVacancy(prev => prev ? { ...prev, image_url: d.url } : null);
      showFeedback('Image uploaded!');
    } catch (err: unknown) { showFeedback(getErrorMessage(err) || 'Upload failed', true); }
    finally { setUploadingVacancy(false); }
  };

  const handleSaveVacancy = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingVacancy) return;
    setSavingVacancy(true);
    try {
      const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'vacancy', data: editingVacancy }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Save failed');
      const saved: Vacancy = d.vacancy || { ...editingVacancy } as Vacancy;
      if (editingVacancy.id) {
        setVacancies(prev => prev.map(v => v.id === saved.id ? saved : v));
      } else {
        const r2 = await fetch('/api/admin/settings?type=vacancies', { headers: { Authorization: `Bearer ${token}` } });
        if (r2.ok) { const d2 = await r2.json(); setVacancies(d2.data || []); }
      }
      showFeedback('Vacancy saved!'); setEditingVacancy(null);
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); }
    finally { setSavingVacancy(false); }
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('Delete this vacancy?')) return;
    setVacancies(prev => prev.filter(v => v.id !== id));
    try {
      const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'vacancy_delete', data: { id } }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Delete failed');
      showFeedback('Vacancy deleted!');
    } catch (err: unknown) { showFeedback(getErrorMessage(err), true); loadData(); }
  };

  // ── Media / settings handlers ────────────────────────────────────────────
  const handleUploadLocationPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || uploadingLocation) return;
    setUploadingLocation(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'location-images');
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Upload failed');
      const updated = [...locationPhotos, d.url].slice(-4); setLocationPhotos(updated);
      const s = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'location_photos', data: { photos: updated } }) });
      if (!s.ok) throw new Error('Settings save failed');
      showFeedback('Photo uploaded!');
    } catch { showFeedback('Something went wrong.', true); loadData(); }
    finally { setUploadingLocation(false); }
  };

  const handleDeleteLocationPhoto = async (url: string) => {
    if (!confirm('Delete this photo?')) return;
    const updated = locationPhotos.filter(p => p !== url); setLocationPhotos(updated);
    try {
      const s = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'location_photos', data: { photos: updated } }) });
      if (!s.ok) throw new Error('Save failed');
      showFeedback('Photo removed!');
    } catch { showFeedback('Something went wrong.', true); loadData(); }
  };

  const handleUploadContactShowcaseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || uploadingContactShowcase || contactShowcaseImages.length >= 8) return;
    setUploadingContactShowcase(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'contact-showcase-images');
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Upload failed');
      const updated = [...contactShowcaseImages, d.url].slice(-8); setContactShowcaseImages(updated);
      const s = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'contact_showcase_images', data: { images: updated } }) });
      if (!s.ok) throw new Error('Settings save failed');
      showFeedback('Showcase image uploaded!');
    } catch { showFeedback('Something went wrong.', true); loadData(); }
    finally { setUploadingContactShowcase(false); }
  };

  const handleDeleteContactShowcaseImage = async (url: string) => {
    if (!confirm('Delete this image?')) return;
    const updated = contactShowcaseImages.filter(p => p !== url); setContactShowcaseImages(updated);
    try {
      const s = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'contact_showcase_images', data: { images: updated } }) });
      if (!s.ok) throw new Error('Save failed');
      showFeedback('Image removed!');
    } catch { showFeedback('Something went wrong.', true); loadData(); }
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || uploadingHero) return;
    setUploadingHero(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'hero-images');
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Upload failed');
      setHeroImageUrl(d.url);
      const s = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'hero_image', data: { url: d.url } }) });
      if (!s.ok) throw new Error('Settings save failed');
      showFeedback('Hero image updated!');
    } catch { showFeedback('Something went wrong.', true); }
    finally { setUploadingHero(false); }
  };

  const handleUploadLogoImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || uploadingLogo) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'logo-images');
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Upload failed');
      setLogoImageUrl(d.url);
      const s = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'logo_image', data: { url: d.url } }) });
      if (!s.ok) throw new Error('Settings save failed');
      showFeedback('Logo updated!');
    } catch { showFeedback('Something went wrong.', true); }
    finally { setUploadingLogo(false); }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Remove the logo?')) return;
    const prev = logoImageUrl; setLogoImageUrl('');
    try {
      const s = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'logo_image', data: { url: '' } }) });
      if (!s.ok) throw new Error('Save failed');
      showFeedback('Logo removed!');
    } catch { showFeedback('Something went wrong.', true); setLogoImageUrl(prev); }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingSettings(true);
    try {
      const results = await Promise.allSettled([
        fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'open_status', data: { is_open: isOpen } }) }),
        fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'google_maps', data: { url: googleMapsUrl } }) }),
        fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'contact_info', data: contacts }) }),
        fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'opening_hours', data: openingHours }) }),
        ...(campaign ? [fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'campaign', data: campaign }) })] : []),
      ]);
      if (results.some(r => r.status === 'rejected')) throw new Error('One or more saves failed');
      showFeedback('Settings saved!');
    } catch { showFeedback('Something went wrong. Try again.', true); }
    finally { setSavingSettings(false); }
  };

  // ── Shared spinner helper ────────────────────────────────────────────────
  const Spinner = () => <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />;
  const inputCls = "w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted";

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">

      {/* Header */}
      <div className="flex justify-between items-start gap-3 border-b border-latte pb-5 mb-6">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-espresso">Owner Dashboard</h1>
          <p className="font-body text-xs text-mocha mt-0.5">Logged in as Administrator</p>
        </div>
        <button onClick={onLogout} className="shrink-0 px-4 py-2 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-full text-xs font-semibold transition-colors">
          Sign Out
        </button>
      </div>

      {/* Feedback */}
      {message && <div className="p-4 bg-olive/15 text-olive font-body text-sm rounded-xl mb-6 text-center animate-fade-up">{message}</div>}
      {errorMsg && <div className="p-4 bg-muted-red/15 text-muted-red font-body text-sm rounded-xl mb-6 text-center animate-fade-up">{errorMsg}</div>}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1.5 border-b border-latte pb-2 mb-6 -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {(['menu', 'streak', 'order', 'vacancies', 'settings'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setEditingItem(null); setEditingVacancy(null); }}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-roasted text-white shadow-sm' : 'text-mocha hover:bg-latte/10'}`}
            style={{ minHeight: 40 }}>
            {tab === 'order' ? 'Delivery' : tab === 'settings' ? 'Settings' : tab}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-mocha font-body">Loading dashboard…</div>}

      {/* Health cards — always visible */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Menu Items', value: menuItems.length, color: 'text-espresso' },
            { label: 'Featured', value: menuItems.filter(i => i.is_featured && i.is_available).length, color: 'text-roasted' },
            { label: 'Vacancies', value: vacancies.filter(v => v.is_active).length, color: 'text-espresso' },
            { label: 'Loyalty', value: streakMetrics?.total_customers || 0, color: 'text-espresso' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-3 sm:p-4 rounded-xl border border-latte text-center">
              <p className="text-[10px] sm:text-xs font-semibold text-mocha uppercase leading-tight">{label}</p>
              <p className={`font-heading font-bold text-xl sm:text-2xl mt-1 ${color}`}>{value}</p>
            </div>
          ))}
          <div className="glass-card p-3 sm:p-4 rounded-xl border border-latte text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] sm:text-xs font-semibold text-mocha uppercase leading-tight">Campaign</p>
            <p className={`font-heading font-bold text-base sm:text-lg mt-1 ${campaign ? 'text-olive' : 'text-mocha'}`}>{campaign ? 'Active' : 'None'}</p>
          </div>
        </div>
      )}

      {/* ── MENU TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'menu' && !loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-xl text-espresso">Manage Menu Items</h2>
            {!editingItem && (
              <button onClick={() => setEditingItem({ category: 'Hotcakes', name: '', slug: '', description: '', price: 200, image_url: '', is_featured: false, is_available: true, display_order: 0 })}
                className="px-5 py-2.5 bg-roasted hover:bg-dark-roast text-white rounded-full text-xs font-semibold shadow-sm">
                Add Menu Item
              </button>
            )}
          </div>

          {editingItem ? (
            <form onSubmit={handleSaveMenu} className="glass-card p-6 md:p-8 rounded-[24px] max-w-xl mx-auto space-y-4 animate-fade-up">
              <h3 className="font-heading font-bold text-lg text-espresso">{editingItem.id ? 'Edit Item' : 'New Menu Item'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Category</label>
                  <select value={editingItem.category || 'Hotcakes'} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className={inputCls}>
                    {['Hotcakes','Hot Coffee','Cold Coffee','Tea & Hot Beverages','Beverages & Shakes','Sandwiches & Savories','Desserts & Bakery'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Item Name</label>
                  <input type="text" required value={editingItem.name || ''} onChange={e => { const name = e.target.value; setEditingItem({ ...editingItem, name, slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') }); }} placeholder="e.g. Classic Cappuccino" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Slug</label>
                <input type="text" required value={editingItem.slug || ''} onChange={e => setEditingItem({ ...editingItem, slug: e.target.value })} placeholder="classic-cappuccino" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Price (Rs.)</label>
                  <input type="number" required value={editingItem.price || ''} onChange={e => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })} placeholder="180" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Display Order</label>
                  <input type="number" value={editingItem.display_order ?? 0} onChange={e => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Description</label>
                  <textarea value={editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} placeholder="Optional details…" className="w-full h-24 p-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Dietary Tags</label>
                  <input type="text" value={editingItem.dietary_tags || ''} onChange={e => setEditingItem({ ...editingItem, dietary_tags: e.target.value })} placeholder="Veg, Gluten-Free…" className={`${inputCls} mb-1`} />
                  <span className="text-[10px] text-mocha">Separate with commas</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Item Image</label>
                <div className="flex gap-3 items-start">
                  {editingItem.image_url && <img src={editingItem.image_url} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-latte flex-shrink-0" />}
                  <div className="flex-grow space-y-1.5">
                    <input type="text" value={editingItem.image_url || ''} onChange={e => setEditingItem({ ...editingItem, image_url: e.target.value })} placeholder="/images/menu/…" className={inputCls} />
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={handleUploadMenuItemImage} disabled={uploadingMenu} className="text-xs text-mocha font-body" />
                      {uploadingMenu && <span className="text-xs text-mocha animate-pulse">Uploading…</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 py-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-espresso cursor-pointer">
                  <input type="checkbox" checked={!!editingItem.is_featured} onChange={e => setEditingItem({ ...editingItem, is_featured: e.target.checked })} className="w-4 h-4 rounded text-roasted focus:ring-roasted" />
                  Featured (Bestseller Carousel)
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-espresso cursor-pointer">
                  <input type="checkbox" checked={editingItem.is_available !== false} onChange={e => setEditingItem({ ...editingItem, is_available: e.target.checked })} className="w-4 h-4 rounded text-roasted focus:ring-roasted" />
                  Available (In Stock)
                </label>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setEditingItem(null)} disabled={savingMenu || uploadingMenu} className="px-6 py-2.5 border border-latte text-mocha hover:bg-latte/15 rounded-full text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={savingMenu || uploadingMenu} className="px-6 py-2.5 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white rounded-full text-xs font-semibold flex items-center gap-2">
                  {uploadingMenu ? <><Spinner /> Uploading…</> : savingMenu ? <><Spinner /> Saving…</> : 'Save Item'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input type="text" value={menuSearchQuery} onChange={e => setMenuSearchQuery(e.target.value)} placeholder="Search items…" className={inputCls} />
                <select value={menuCategoryFilter} onChange={e => setMenuCategoryFilter(e.target.value)} className={inputCls}>
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={menuFeaturedFilter} onChange={e => setMenuFeaturedFilter(e.target.value)} className={inputCls}>
                  <option value="all">All (Featured)</option><option value="featured">Featured</option><option value="not-featured">Not Featured</option>
                </select>
                <select value={menuAvailableFilter} onChange={e => setMenuAvailableFilter(e.target.value)} className={inputCls}>
                  <option value="all">All (Availability)</option><option value="available">Available</option><option value="hidden">Hidden</option>
                </select>
                <select value={menuImageFilter} onChange={e => setMenuImageFilter(e.target.value)} className={inputCls}>
                  <option value="all">All (Images)</option><option value="has-image">Has Image</option><option value="missing-image">Missing Image</option>
                </select>
              </div>
              {selectedMenuItems.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-latte/20 rounded-xl border border-latte">
                  <div className="flex items-center gap-4">
                    <span className="font-heading font-semibold text-espresso">{selectedMenuItems.length} selected</span>
                    <button onClick={() => setSelectedMenuItems([])} className="text-xs text-mocha hover:text-espresso">Clear</button>
                  </div>
                  <button onClick={() => setShowBulkDeleteConfirm(true)} className="px-4 py-2 bg-muted-red hover:bg-red-700 text-white rounded-full text-xs font-semibold">Delete Selected</button>
                </div>
              )}
              <div className="overflow-x-auto border border-latte rounded-2xl bg-warm-white -mx-4 md:mx-0 md:rounded-2xl">
                <div className="min-w-[640px]">
                  <table className="w-full border-collapse text-left">
                    <thead><tr className="bg-latte/20 font-body text-xs font-bold uppercase tracking-wider text-mocha border-b border-latte">
                      <th className="p-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={selectedMenuItems.length === filteredMenuItems.length && filteredMenuItems.length > 0} onChange={e => setSelectedMenuItems(e.target.checked ? filteredMenuItems.map(i => i.id) : [])} className="w-4 h-4 rounded text-roasted focus:ring-roasted" />All</label></th>
                      <th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Price</th>
                      <th className="p-4">Featured</th><th className="p-4">Image</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-latte/60 font-body text-sm text-espresso">
                      {filteredMenuItems.length === 0 ? (
                        <tr><td colSpan={8} className="p-8 text-center text-mocha">No items found.</td></tr>
                      ) : filteredMenuItems.map(item => (
                        <tr key={item.id} className={`hover:bg-latte/5 transition-colors ${selectedMenuItems.includes(item.id) ? 'bg-roasted/5' : ''}`}>
                          <td className="p-4"><input type="checkbox" checked={selectedMenuItems.includes(item.id)} onChange={e => setSelectedMenuItems(e.target.checked ? [...selectedMenuItems, item.id] : selectedMenuItems.filter(id => id !== item.id))} className="w-4 h-4 rounded text-roasted focus:ring-roasted" /></td>
                          <td className="p-4 font-heading font-semibold">{item.name}</td>
                          <td className="p-4">{item.category}</td>
                          <td className="p-4">Rs. {item.price}</td>
                          <td className="p-4">{item.is_featured ? '⭐ Yes' : 'No'}</td>
                          <td className="p-4">{item.image_url ? <span className="px-2 py-0.5 bg-olive/15 text-olive rounded-full text-xs">✓ Set</span> : <span className="px-2 py-0.5 bg-muted-red/15 text-muted-red rounded-full text-xs">Missing</span>}</td>
                          <td className="p-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_available ? 'bg-olive/15 text-olive' : 'bg-muted-red/15 text-muted-red'}`}>{item.is_available ? 'In Stock' : 'Out of Stock'}</span></td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => handleStartEdit(item)} className="px-3 py-1 bg-roasted hover:bg-dark-roast text-white rounded-md text-xs font-medium">Edit</button>
                            <button onClick={() => handleDeleteMenu(item.id)} className="px-3 py-1 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-md text-xs font-medium">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {showBulkDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-cream rounded-2xl p-6 max-w-sm w-full shadow-xl">
                    <h3 className="font-heading font-bold text-xl text-espresso mb-2">Delete {selectedMenuItems.length} items?</h3>
                    <p className="font-body text-mocha text-sm mb-6">This cannot be undone.</p>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setShowBulkDeleteConfirm(false)} className="px-4 py-2 border border-latte text-mocha hover:bg-latte/10 rounded-full text-xs font-semibold">Cancel</button>
                      <button onClick={handleBulkDelete} className="px-4 py-2 bg-muted-red hover:bg-red-700 text-white rounded-full text-xs font-semibold">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STREAK TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'streak' && !loading && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {streakMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Customers', value: streakMetrics.total_customers, color: 'text-espresso' },
                { label: 'Stamps', value: streakMetrics.total_stamps, color: 'text-espresso' },
                { label: 'Active Rewards', value: `${streakMetrics.total_active_rewards} 🎁`, color: 'text-olive' },
                { label: 'Redeemed', value: streakMetrics.total_rewards_redeemed || 0, color: 'text-roasted' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card p-4 rounded-xl border border-latte text-center">
                  <span className="block text-xs font-semibold text-mocha uppercase">{label}</span>
                  <span className={`block font-heading font-bold text-2xl mt-1 ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="glass-card p-6 rounded-2xl border border-latte">
            <h2 className="font-heading font-bold text-lg text-espresso mb-4">Barista Stamp Station</h2>
            <form onSubmit={e => { e.preventDefault(); handleAddStamp(streakStampPhone); }} className="flex flex-col sm:flex-row gap-3">
              <input type="text" required value={streakStampPhone} onChange={e => setStreakStampPhone(e.target.value)} placeholder="Customer phone number…" className="flex-grow h-11 px-4 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted" />
              <button type="submit" className="px-6 h-11 bg-roasted hover:bg-dark-roast text-white font-semibold rounded-xl text-xs shrink-0">+1 Stamp</button>
            </form>
            <p className="text-[10px] text-mocha font-body mt-2">Adds a stamp (+1). Creates a new profile if not registered. Locked to 1 stamp per 24 hours.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-latte">
            <h2 className="font-heading font-bold text-lg text-espresso mb-4">Lookup Customer Profile</h2>
            <form onSubmit={handleStreakSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
              <input type="text" required value={streakQuery} onChange={e => setStreakQuery(e.target.value)} placeholder="Customer Code or Phone Number…" className="flex-grow h-11 px-4 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted" />
              <button type="submit" className="px-6 h-11 bg-roasted hover:bg-dark-roast text-white font-semibold rounded-xl text-xs shrink-0">Search</button>
            </form>
            {streakResult && (
              <div className="p-5 bg-warm-white rounded-xl border border-latte space-y-4 animate-fade-up">
                <div className="flex justify-between items-start pb-3 border-b border-latte/60">
                  <div>
                    <h3 className="font-heading font-bold text-espresso text-lg">{streakResult.customer_code}</h3>
                    <p className="font-body text-xs text-mocha">Phone: {streakResult.phone_number}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-heading font-bold text-2xl block ${streakResult.streak_count === 10 ? 'text-olive animate-pulse' : 'text-roasted'}`}>{streakResult.streak_count} / 10</span>
                    <span className="text-xs text-mocha">Redeemed: {(streakResult as StreakRecord).rewards_redeemed || 0}</span>
                  </div>
                </div>
                <p className="text-xs text-mocha">Last stamp: {streakResult.last_stamp_at ? new Date(streakResult.last_stamp_at).toLocaleString() : 'Never'}</p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {streakResult.streak_count < 10 && <button onClick={() => handleAddStamp(streakResult.phone_number)} className="px-4 py-2 bg-roasted hover:bg-dark-roast text-white rounded-lg text-xs font-semibold">+1 Stamp</button>}
                  <button onClick={() => handleResetStreak(streakResult.customer_code)} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${streakResult.streak_count === 10 ? 'bg-olive border-olive text-white hover:bg-olive/90 animate-pulse' : 'border-roasted text-roasted hover:bg-roasted/5'}`}>
                    {streakResult.streak_count === 10 ? '🎁 Claim & Reset' : 'Reset Stamps'}
                  </button>
                  <button onClick={() => handleDeleteStreak(streakResult.customer_code)} className="px-4 py-2 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-lg text-xs font-semibold">Delete Profile</button>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl border border-latte">
            <h2 className="font-heading font-bold text-lg text-espresso mb-4">Customer Registry</h2>
            {streakLoading ? <div className="text-center py-6 text-mocha text-sm">Loading…</div> :
              streakRecords.length === 0 ? <div className="text-center py-6 text-mocha text-sm">No customers yet.</div> : (
              <div className="overflow-x-auto border border-latte rounded-xl bg-warm-white -mx-2 md:mx-0">
                <div className="min-w-[500px]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead><tr className="bg-latte/20 font-body text-xs font-bold uppercase tracking-wider text-mocha border-b border-latte">
                      <th className="p-3">Code</th><th className="p-3">Phone</th><th className="p-3">Stamps</th><th className="p-3">Redeemed</th><th className="p-3">Last Visit</th><th className="p-3 text-right">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-latte/60 font-body text-espresso">
                      {streakRecords.map(record => {
                        const ph = record.phone_number || '';
                        const masked = ph.length > 5 ? ph.slice(0,3)+'*'.repeat(ph.length-5)+ph.slice(-2) : ph;
                        return (
                          <tr key={record.id} className="hover:bg-latte/5">
                            <td className="p-3 font-semibold">{record.customer_code}</td>
                            <td className="p-3">{masked}</td>
                            <td className="p-3"><span className={`font-semibold ${record.streak_count >= 10 ? 'text-olive' : 'text-roasted'}`}>{record.streak_count}/10</span></td>
                            <td className="p-3"><span className="font-semibold text-mocha">{(record as StreakRecord).rewards_redeemed || 0}</span></td>
                            <td className="p-3 text-xs text-mocha">{record.last_stamp_at ? new Date(record.last_stamp_at).toLocaleDateString() : 'Never'}</td>
                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                              {record.streak_count < 10 && <button onClick={() => handleAddStamp(record.phone_number)} className="px-2.5 py-1 bg-roasted hover:bg-dark-roast text-white rounded text-xs font-medium">+1</button>}
                              <button onClick={() => handleResetStreak(record.customer_code)} className={`px-2.5 py-1 rounded text-xs font-medium border ${record.streak_count === 10 ? 'bg-olive border-olive text-white' : 'border-roasted text-roasted hover:bg-roasted/5'}`}>
                                {record.streak_count === 10 ? '🎁 Claim' : 'Reset'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DELIVERY TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'order' && !loading && (
        <form onSubmit={handleSaveOrderLinks} className="max-w-xl mx-auto glass-card p-6 md:p-8 rounded-[24px] border border-latte space-y-6">
          <h2 className="font-heading font-bold text-xl text-espresso">Delivery Platform Links</h2>
          {orderLinks.map((link, idx) => (
            <div key={link.platform} className="p-4 bg-warm-white rounded-xl border border-latte space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-heading font-bold capitalize text-espresso">{link.platform}</span>
                <label className="flex items-center gap-1.5 text-xs text-mocha font-semibold cursor-pointer">
                  <input type="checkbox" checked={link.is_active}
                    onChange={e => { const u = [...orderLinks]; u[idx].is_active = e.target.checked; setOrderLinks(u); }}
                    className="w-4 h-4 text-roasted focus:ring-roasted rounded" />
                  Active
                </label>
              </div>
              <input type="text" value={link.url || ''}
                onChange={e => { const u = [...orderLinks]; u[idx].url = e.target.value; setOrderLinks(u); }}
                placeholder={`Paste ${link.platform} store URL here…`}
                className="w-full h-11 px-3 bg-white border border-latte rounded-lg font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted" />
            </div>
          ))}
          <button type="submit" disabled={savingOrderLinks}
            className="w-full py-3 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white font-semibold rounded-full shadow-sm text-sm flex items-center justify-center gap-2">
            {savingOrderLinks ? <><Spinner /> Saving…</> : 'Save Delivery Links'}
          </button>
        </form>
      )}

      {/* ── VACANCIES TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'vacancies' && !loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-xl text-espresso">Vacancy Campaigns</h2>
            {!editingVacancy && (
              <button onClick={() => setEditingVacancy({ title: '', description: '', google_form_link: '', image_url: '/images/vacancies/vacancy-default.jpg', is_active: true })}
                className="px-5 py-2.5 bg-roasted hover:bg-dark-roast text-white rounded-full text-xs font-semibold shadow-sm">
                Create Job Campaign
              </button>
            )}
          </div>
          {editingVacancy ? (
            <form onSubmit={handleSaveVacancy} className="glass-card p-6 md:p-8 rounded-[24px] max-w-xl mx-auto space-y-4 animate-fade-up">
              <h3 className="font-heading font-bold text-lg text-espresso">{editingVacancy.id ? 'Edit Vacancy' : 'New Vacancy'}</h3>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Job Title</label>
                <input type="text" required value={editingVacancy.title || ''} onChange={e => setEditingVacancy({ ...editingVacancy, title: e.target.value })} placeholder="e.g. Senior Barista" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Google Form Link</label>
                <input type="text" required value={editingVacancy.google_form_link || ''} onChange={e => setEditingVacancy({ ...editingVacancy, google_form_link: e.target.value })} placeholder="https://forms.gle/…" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Job Description</label>
                <textarea required value={editingVacancy.description || ''} onChange={e => setEditingVacancy({ ...editingVacancy, description: e.target.value })} placeholder="Responsibilities, requirements…" className="w-full h-28 p-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Banner Image</label>
                <div className="flex gap-3 items-start">
                  {editingVacancy.image_url && <img src={editingVacancy.image_url} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-latte flex-shrink-0" />}
                  <div className="flex-grow space-y-1.5">
                    <input type="text" value={editingVacancy.image_url || ''} onChange={e => setEditingVacancy({ ...editingVacancy, image_url: e.target.value })} placeholder="/images/vacancies/…" className={inputCls} />
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={handleUploadVacancyImage} disabled={uploadingVacancy} className="text-xs text-mocha font-body" />
                      {uploadingVacancy && <span className="text-xs text-mocha animate-pulse">Uploading…</span>}
                    </div>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-espresso cursor-pointer py-1">
                <input type="checkbox" checked={!!editingVacancy.is_active} onChange={e => setEditingVacancy({ ...editingVacancy, is_active: e.target.checked })} className="w-4 h-4 rounded text-roasted focus:ring-roasted" />
                Active Campaign (visible on site)
              </label>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setEditingVacancy(null)} disabled={savingVacancy || uploadingVacancy} className="px-6 py-2.5 border border-latte text-mocha hover:bg-latte/15 rounded-full text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={savingVacancy || uploadingVacancy} className="px-6 py-2.5 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white rounded-full text-xs font-semibold flex items-center gap-2">
                  {uploadingVacancy ? <><Spinner /> Uploading…</> : savingVacancy ? <><Spinner /> Saving…</> : 'Save Campaign'}
                </button>
              </div>
            </form>
          ) : vacancies.length === 0 ? (
            <div className="text-center py-12 text-mocha">No vacancies yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vacancies.map(vac => (
                <div key={vac.id} className="p-5 bg-warm-white rounded-2xl border border-latte space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-heading font-bold text-base text-espresso">{vac.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${vac.is_active ? 'bg-olive/15 text-olive' : 'bg-mocha/15 text-mocha'}`}>{vac.is_active ? 'Active' : 'Closed'}</span>
                  </div>
                  <p className="font-body text-mocha text-xs line-clamp-2 leading-relaxed">{vac.description}</p>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingVacancy(vac)} className="px-3 py-1.5 bg-roasted hover:bg-dark-roast text-white rounded-md text-xs font-medium">Edit</button>
                    <button onClick={() => vac.id && handleDeleteVacancy(vac.id)} className="px-3 py-1.5 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-md text-xs font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'settings' && !loading && (
        <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-xl text-espresso">Site Settings</h2>

          {/* ── Open / Closed Status ── */}
          <Section title="Cafe Open/Closed Status" defaultOpen>
            <div className="flex items-center justify-between p-4 bg-warm-white rounded-xl border border-latte">
              <div>
                <p className="font-heading font-semibold text-espresso text-sm">Cafe Status</p>
                <p className="text-xs text-mocha mt-0.5">Toggle the cafe open or closed. When closed, the site shows a &quot;Closed&quot; banner regardless of opening hours.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={e => setIsOpen(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-latte rounded-full peer peer-checked:bg-olive transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                <span className={`ml-3 text-sm font-semibold ${isOpen ? 'text-olive' : 'text-muted-red'}`}>
                  {isOpen ? 'Open' : 'Closed'}
                </span>
              </label>
            </div>
          </Section>

          {/* ── Opening Hours ── */}
          <Section title="Opening Hours">
            <div className="space-y-2">
              <div className="flex gap-3 p-3 bg-latte/10 rounded-xl border border-latte mb-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-mocha uppercase mb-1">Apply to All — Open</label>
                  <input
                    type="time"
                    value={applyAllTemplate.openTime}
                    onChange={e => setApplyAllTemplate(p => ({ ...p, openTime: e.target.value }))}
                    className="w-full h-9 px-3 bg-warm-white border border-latte rounded-lg font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-mocha uppercase mb-1">Apply to All — Close</label>
                  <input
                    type="time"
                    value={applyAllTemplate.closeTime}
                    onChange={e => setApplyAllTemplate(p => ({ ...p, closeTime: e.target.value }))}
                    className="w-full h-9 px-3 bg-warm-white border border-latte rounded-lg font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...openingHours };
                      (Object.keys(updated) as (keyof typeof updated)[]).forEach(day => {
                        if (!updated[day].isClosed) {
                          updated[day] = { ...updated[day], openTime: applyAllTemplate.openTime, closeTime: applyAllTemplate.closeTime };
                        }
                      });
                      setOpeningHours(updated);
                    }}
                    className="h-9 px-4 bg-roasted hover:bg-dark-roast text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                  >
                    Apply All
                  </button>
                </div>
              </div>
              {DAY_NAMES.map(day => {
                const d = openingHours[day];
                const label = day.charAt(0).toUpperCase() + day.slice(1);
                return (
                  <div key={day} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-warm-white rounded-xl border border-latte">
                    <span className="w-24 shrink-0 text-sm font-semibold text-espresso">{label}</span>
                    <label className="flex items-center gap-1.5 text-xs text-mocha font-semibold cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={d.isClosed}
                        onChange={e => setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], isClosed: e.target.checked } }))}
                        className="w-4 h-4 rounded text-muted-red focus:ring-muted-red"
                      />
                      Closed
                    </label>
                    {!d.isClosed && (
                      <>
                        <input
                          type="time"
                          value={d.openTime}
                          onChange={e => setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], openTime: e.target.value } }))}
                          className="flex-1 h-9 px-3 bg-warm-white border border-latte rounded-lg font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted min-w-[100px]"
                        />
                        <span className="text-mocha text-xs shrink-0">to</span>
                        <input
                          type="time"
                          value={d.closeTime}
                          onChange={e => setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], closeTime: e.target.value } }))}
                          className="flex-1 h-9 px-3 bg-warm-white border border-latte rounded-lg font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted min-w-[100px]"
                        />
                      </>
                    )}
                    {d.isClosed && <span className="text-xs text-muted-red font-medium">Closed all day</span>}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* ── Contact Info ── */}
          <Section title="Contact Information">
            {[
              { key: 'phone', label: 'Phone Number', placeholder: '+977 976-3687532' },
              { key: 'whatsapp', label: 'WhatsApp Number', placeholder: '+977 976-3687532' },
              { key: 'instagram', label: 'Instagram URL', placeholder: 'https://www.instagram.com/hotcakesnepal/' },
              { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://www.tiktok.com/@hotcakesnepal' },
              { key: 'address', label: 'Address', placeholder: 'Hattiban, Lalitpur, Nepal' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">{label}</label>
                <input
                  type="text"
                  value={contacts.find(c => c.key === key)?.value || ''}
                  onChange={e => setContact(key, e.target.value)}
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ))}
          </Section>

          {/* ── Google Maps ── */}
          <Section title="Google Maps Link">
            <div>
              <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Maps URL</label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={e => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/…"
                className={inputCls}
              />
              <p className="text-[10px] text-mocha mt-1">Used on the Location page and footer.</p>
            </div>
          </Section>

          {/* ── Brew Streak Campaign ── */}
          {campaign && (
            <Section title="Brew Streak Campaign">
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={campaign.tagline || ''}
                  onChange={e => setCampaign({ ...campaign, tagline: e.target.value })}
                  placeholder="10 visits. 1 free coffee."
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={campaign.start_date ? campaign.start_date.slice(0, 10) : ''}
                    onChange={e => setCampaign({ ...campaign, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={campaign.end_date ? campaign.end_date.slice(0, 10) : ''}
                    onChange={e => setCampaign({ ...campaign, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className={inputCls}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-espresso cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!campaign.is_active}
                  onChange={e => setCampaign({ ...campaign, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-roasted focus:ring-roasted"
                />
                Campaign Active
              </label>
            </Section>
          )}

          {/* ── Save Settings Button ── */}
          <button
            type="submit"
            disabled={savingSettings}
            className="w-full py-3 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white font-semibold rounded-full shadow-sm text-sm flex items-center justify-center gap-2"
          >
            {savingSettings ? <><Spinner /> Saving…</> : 'Save Settings'}
          </button>

          {/* ── Media: Hero Image ── */}
          <Section title="Hero Image">
            <div className="space-y-3">
              {heroImageUrl && (
                <img src={heroImageUrl} alt="Hero preview" className="w-full max-h-40 object-cover rounded-xl border border-latte" />
              )}
              <label className="block text-xs font-semibold text-mocha uppercase mb-1">Upload New Hero Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadHeroImage}
                disabled={uploadingHero}
                className="text-xs text-mocha font-body"
              />
              {uploadingHero && <span className="text-xs text-mocha animate-pulse">Uploading…</span>}
              <p className="text-[10px] text-mocha">Recommended: 1920×1080px. Max 5MB. JPG/PNG/WEBP.</p>
            </div>
          </Section>

          {/* ── Media: Logo ── */}
          <Section title="Logo Image">
            <div className="space-y-3">
              {logoImageUrl && (
                <div className="flex items-center gap-3">
                  <img src={logoImageUrl} alt="Logo preview" className="h-16 w-16 object-contain rounded-xl border border-latte bg-warm-white p-1" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-lg text-xs font-medium"
                  >
                    Remove Logo
                  </button>
                </div>
              )}
              <label className="block text-xs font-semibold text-mocha uppercase mb-1">Upload New Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadLogoImage}
                disabled={uploadingLogo}
                className="text-xs text-mocha font-body"
              />
              {uploadingLogo && <span className="text-xs text-mocha animate-pulse">Uploading…</span>}
              <p className="text-[10px] text-mocha">Square or transparent PNG preferred. Max 5MB.</p>
            </div>
          </Section>

          {/* ── Media: Location Photos ── */}
          <Section title="Location Photos (max 4)">
            <div className="space-y-3">
              {locationPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {locationPhotos.map(url => (
                    <div key={url} className="relative group rounded-xl overflow-hidden border border-latte">
                      <img src={url} alt="Location" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteLocationPhoto(url)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-muted-red text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {locationPhotos.length < 4 && (
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">
                    Upload Photo ({locationPhotos.length}/4)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLocationPhoto}
                    disabled={uploadingLocation}
                    className="text-xs text-mocha font-body"
                  />
                  {uploadingLocation && <span className="text-xs text-mocha animate-pulse">Uploading…</span>}
                </div>
              )}
              {locationPhotos.length >= 4 && (
                <p className="text-xs text-mocha">Maximum 4 photos reached. Remove one to add another.</p>
              )}
            </div>
          </Section>

          {/* ── Media: Contact Showcase Images ── */}
          <Section title="Contact Page Showcase Images (max 8)">
            <div className="space-y-3">
              {contactShowcaseImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {contactShowcaseImages.map(url => (
                    <div key={url} className="relative group rounded-xl overflow-hidden border border-latte">
                      <img src={url} alt="Showcase" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteContactShowcaseImage(url)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-muted-red text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {contactShowcaseImages.length < 8 && (
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">
                    Upload Image ({contactShowcaseImages.length}/8)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadContactShowcaseImage}
                    disabled={uploadingContactShowcase}
                    className="text-xs text-mocha font-body"
                  />
                  {uploadingContactShowcase && <span className="text-xs text-mocha animate-pulse">Uploading…</span>}
                </div>
              )}
              {contactShowcaseImages.length >= 8 && (
                <p className="text-xs text-mocha">Maximum 8 images reached. Remove one to add another.</p>
              )}
            </div>
          </Section>
        </form>
      )}

    </div>
  );
}
