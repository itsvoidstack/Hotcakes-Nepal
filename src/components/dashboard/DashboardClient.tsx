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

interface MenuItem {
  id: string;
  category: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  is_available: boolean;
  display_order: number;
  dietary_tags?: string;
}

interface OrderLink {
  platform: string;
  url: string | null;
  is_active: boolean;
}

interface ContactInfo {
  key: string;
  value: string;
}

interface Campaign {
  name: string;
  tagline: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

interface Vacancy {
  id?: string;
  title: string;
  description: string | null;
  google_form_link: string;
  image_url: string | null;
  is_active: boolean;
}

interface SiteSetting {
  key: string;
  value: unknown;
}

interface DashboardClientProps {
  token: string;
  onLogout: () => void;
}

export default function DashboardClient({ token, onLogout }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'streak' | 'order' | 'vacancies' | 'settings'>('menu');
  
  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Menu Manager States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [menuFeaturedFilter, setMenuFeaturedFilter] = useState('all');
  const [menuAvailableFilter, setMenuAvailableFilter] = useState('all');
  const [menuImageFilter, setMenuImageFilter] = useState('all'); // New image filter!
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]); // Multi-select!
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false); // Confirmation dialog!

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    menuItems.forEach((item) => categories.add(item.category));
    return Array.from(categories);
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Search filter
      const matchesSearch =
        menuSearchQuery === '' ||
        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory =
        menuCategoryFilter === 'all' ||
        item.category === menuCategoryFilter;
      
      // Featured filter
      const matchesFeatured =
        menuFeaturedFilter === 'all' ||
        (menuFeaturedFilter === 'featured' && item.is_featured) ||
        (menuFeaturedFilter === 'not-featured' && !item.is_featured);
      
      // Availability filter
      const matchesAvailable =
        menuAvailableFilter === 'all' ||
        (menuAvailableFilter === 'available' && item.is_available) ||
        (menuAvailableFilter === 'hidden' && !item.is_available);
      
      // Image filter
      const hasImage = !!item.image_url;
      // For now, we'll treat "broken" as theoretical, or we can just use hasImage (since we don't have real-time broken image detection)
      let matchesImage = true;
      if (menuImageFilter === 'has-image') matchesImage = hasImage;
      if (menuImageFilter === 'missing-image') matchesImage = !hasImage;
      
      return matchesSearch && matchesCategory && matchesFeatured && matchesAvailable && matchesImage;
    });
  }, [menuItems, menuSearchQuery, menuCategoryFilter, menuFeaturedFilter, menuAvailableFilter, menuImageFilter]);
  
  // 2. Streak Manager States
  const [streakQuery, setStreakQuery] = useState('');
  const [streakResult, setStreakResult] = useState<StreakRecord | null>(null);
  const [streakStampPhone, setStreakStampPhone] = useState('');
  const [streakRecords, setStreakRecords] = useState<StreakRecord[]>([]);
  const [streakMetrics, setStreakMetrics] = useState<{ total_customers: number; total_stamps: number; total_active_rewards: number; total_rewards_redeemed?: number; } | null>(null);
  const [streakLoading, setStreakLoading] = useState(false);

  // 3. Order Links States
  const [orderLinks, setOrderLinks] = useState<OrderLink[]>([]);

  // 4. Vacancies Manager States
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [editingVacancy, setEditingVacancy] = useState<Partial<Vacancy> | null>(null);

  // 5. Settings States
  const [isOpen, setIsOpen] = useState(true);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_OPENING_HOURS);
  
  // 6. Additional Media States
  const [locationPhotos, setLocationPhotos] = useState<string[]>([]);
  const [contactShowcaseImages, setContactShowcaseImages] = useState<string[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [logoImageUrl, setLogoImageUrl] = useState<string>('');
  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [uploadingVacancy, setUploadingVacancy] = useState(false);
  const [uploadingLocation, setUploadingLocation] = useState(false);
  const [uploadingContactShowcase, setUploadingContactShowcase] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch Streak analytics records
  const loadStreakData = async () => {
    setStreakLoading(true);
    try {
      const res = await fetch('/api/admin/streak', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStreakRecords(data.records || []);
        setStreakMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error('Error fetching streak data:', err);
    } finally {
      setStreakLoading(false);
    }
  };

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/menu', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const menuData = await res.json();
      setMenuItems(menuData.items || []);

      // Fetch all settings via admin API
      const settingsRes = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setOrderLinks(settingsData.orderLinks || []);
        setVacancies(settingsData.vacancies || []);
        setContacts(settingsData.contactInfo || []);
        setCampaign(settingsData.campaigns?.[0] || null);
        
        // Process site settings
        const siteSettings = settingsData.siteSettings || [];
        const openSetting = siteSettings.find((s: SiteSetting) => s.key === 'open_status');
        const openValue = openSetting?.value as { is_open?: boolean } | null;
        setIsOpen(openValue?.is_open ?? true);
        
        const mapsSetting = siteSettings.find((s: SiteSetting) => s.key === 'google_maps');
        const mapsValue = mapsSetting?.value as { url?: string } | null;
        setGoogleMapsUrl(mapsValue?.url ?? 'https://maps.app.goo.gl/y2qh1TqYovxSpzDL9');
        
        const locPhotos = siteSettings.find((s: SiteSetting) => s.key === 'location_photos');
        setLocationPhotos((locPhotos?.value as string[]) || []);
        
        const heroSet = siteSettings.find((s: SiteSetting) => s.key === 'hero_image');
        setHeroImageUrl((heroSet?.value as { url?: string })?.url || '');

        const logoSet = siteSettings.find((s: SiteSetting) => s.key === 'logo_image');
        setLogoImageUrl((logoSet?.value as { url?: string })?.url || '');
        
        const contactShowcaseSet = siteSettings.find((s: SiteSetting) => s.key === 'contact_showcase_images');
        setContactShowcaseImages((contactShowcaseSet?.value as string[]) || []);

        const hoursSetting = siteSettings.find((s: SiteSetting) => s.key === 'opening_hours');
        if (hoursSetting?.value) {
          setOpeningHours(hoursSetting.value as OpeningHours);
        } else {
          setOpeningHours(DEFAULT_OPENING_HOURS);
        }
      }
      
      await loadStreakData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // ==========================================
  // MENU OPERATIONS
  // ==========================================
  const handleStartEdit = (item: MenuItem) => {
    let desc = item.description || '';
    let tags = '';
    if (desc.includes(' | Tags: ')) {
      const parts = desc.split(' | Tags: ');
      desc = parts[0];
      tags = parts[1];
    }
    setEditingItem({
      ...item,
      description: desc,
      dietary_tags: tags
    });
  };

  const handleUploadMenuItemImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadingMenu) return;

    setUploadingMenu(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'menu-images');
      if (editingItem?.slug) {
        formData.append('filename', `menu-${editingItem.slug}`);
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      setEditingItem(prev => prev ? { ...prev, image_url: data.url } : null);
      showFeedback('Menu item image uploaded successfully!');
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err) || 'Something went wrong. Try again.', true);
    } finally {
      setUploadingMenu(false);
    }
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setLoading(true);
    try {
      const isNew = !editingItem.id;
      const url = '/api/admin/menu';
      const method = isNew ? 'POST' : 'PUT';

      const finalDescription = (editingItem.description || '') + (editingItem.dietary_tags ? ` | Tags: ${editingItem.dietary_tags}` : '');

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...editingItem,
          description: finalDescription
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save menu item');

      showFeedback('Saved successfully');
      setEditingItem(null);
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVacancyImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadingVacancy) return;

    setUploadingVacancy(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'vacancy-images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      setEditingVacancy(prev => prev ? { ...prev, image_url: data.url } : null);
      showFeedback('Vacancy image uploaded successfully!');
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err) || 'Something went wrong. Try again.', true);
    } finally {
      setUploadingVacancy(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to delete menu item');

      showFeedback('Menu item deleted successfully!');
      loadData();
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err), true);
    }
  };

  // BULK DELETE!
  const handleBulkDelete = async () => {
    console.log('=== [handleBulkDelete] Starting ===');
    console.log('=== [handleBulkDelete] Selected Menu Items IDs ===', selectedMenuItems);
    console.log('=== [handleBulkDelete] Selected IDs type check ===', typeof selectedMenuItems[0], selectedMenuItems.map(id => typeof id));
    console.log('=== [handleBulkDelete] Filtered Menu Items ===', filteredMenuItems.map(item => ({ id: item.id, name: item.name })));
    
    setShowBulkDeleteConfirm(false);
    try {
      const requestUrl = `/api/admin/menu?ids=${selectedMenuItems.join(',')}`;
      console.log('=== [handleBulkDelete] Request URL ===', requestUrl);
      
      const res = await fetch(requestUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('=== [handleBulkDelete] Response status ===', res.status);
      
      if (!res.ok) {
        const data = await res.json();
        console.error('=== [handleBulkDelete] Error response data ===', data);
        throw new Error(data.error || 'Failed to delete selected items');
      }
      
      const successData = await res.json();
      console.log('=== [handleBulkDelete] Success response data ===', successData);

      showFeedback(`${successData.deletedCount} menu items deleted successfully!`);
      setSelectedMenuItems([]);
      await loadData();
      console.log('=== [handleBulkDelete] Load data completed ===');
    } catch (err: unknown) {
      console.error('=== [handleBulkDelete] Unhandled exception ===', err);
      showFeedback(getErrorMessage(err), true);
    }
  };

  // ==========================================
  // STREAK OPERATIONS
  // ==========================================
  const handleStreakSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streakQuery.trim()) return;

    try {
      const res = await fetch('/api/admin/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'search', phone_number: streakQuery.trim(), customer_code: streakQuery.trim() })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to search streak profile');

      setStreakResult(data.record);
      if (!data.record) {
        showFeedback('No profile found. You can add a stamp to create one.', true);
      }
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err), true);
    }
  };
  const handleAddStamp = async (phone: string) => {
    if (!phone.trim()) return;
    try {
      const res = await fetch('/api/admin/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'stamp', phone_number: phone.trim() })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to add stamp');

      showFeedback('Stamp added successfully (+1)!');
      setStreakResult(data.record);
      setStreakStampPhone('');
      await loadData();
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err), true);
    }
  };

  const handleResetStreak = async (code: string) => {
    if (!confirm('Reset this customer\'s streak back to 0?')) return;
    try {
      const res = await fetch('/api/admin/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'reset', customer_code: code })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to reset streak');

      showFeedback('Streak count reset to 0!');
      setStreakResult(data.record);
      await loadData();
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err), true);
    }
  };

  const handleDeleteStreak = async (code: string) => {
    if (!confirm('Permanently delete this customer\'s profile?')) return;
    try {
      const res = await fetch('/api/admin/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'delete', customer_code: code })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to delete profile');

      showFeedback('Customer profile deleted successfully!');
      setStreakResult(null);
      await loadData();
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err), true);
    }
  };
  // ==========================================
  // ORDER LINKS OPERATIONS
  // ==========================================
  const handleSaveOrderLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'order_links', data: orderLinks })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save order links');

      showFeedback('Order links updated successfully!');
      loadData();
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err), true);
    }
  };

  // ==========================================
  // VACANCIES OPERATIONS
  // ==========================================
  const handleSaveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVacancy) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'vacancy', data: editingVacancy })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save vacancy campaign');

      showFeedback('Vacancy campaign saved successfully!');
      setEditingVacancy(null);
      loadData();
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err), true);
    }
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vacancy campaign?')) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'vacancy_delete', data: { id } })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to delete vacancy campaign');

      showFeedback('Vacancy campaign deleted successfully!');
      loadData();
    } catch (err: unknown) {
      showFeedback(getErrorMessage(err), true);
    }
  };

  // ==========================================
  // GENERAL SETTINGS & MEDIA
  // ==========================================
  const handleUploadLocationPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadingLocation) return;

    setUploadingLocation(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'location-images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');

      const updatedPhotos = [...locationPhotos, data.url].slice(-4);
      setLocationPhotos(updatedPhotos);

      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'location_photos', data: { photos: updatedPhotos } })
      });
      if (!saveRes.ok) throw new Error('Failed to update settings');

      showFeedback('Saved successfully');
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    } finally {
      setUploadingLocation(false);
    }
  };

  const handleDeleteLocationPhoto = async (photoUrl: string) => {
    if (!confirm('Are you sure you want to delete this location photo?')) return;
    setLoading(true);
    try {
      const updatedPhotos = locationPhotos.filter(p => p !== photoUrl);
      setLocationPhotos(updatedPhotos);

      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'location_photos', data: { photos: updatedPhotos } })
      });
      if (!saveRes.ok) throw new Error('Failed to update settings');

      showFeedback('Saved successfully');
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CONTACT SHOWCASE IMAGE MANAGEMENT
  // ==========================================
  const handleUploadContactShowcaseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadingContactShowcase) return;
    if (contactShowcaseImages.length >= 8) return;

    setUploadingContactShowcase(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'contact-showcase-images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      const updatedImages = [...contactShowcaseImages, data.url].slice(-8);
      setContactShowcaseImages(updatedImages);

      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'contact_showcase_images', data: { images: updatedImages } })
      });
      if (!saveRes.ok) throw new Error('Failed to update settings');

      showFeedback('Image uploaded successfully');
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    } finally {
      setUploadingContactShowcase(false);
    }
  };

  const handleDeleteContactShowcaseImage = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this showcase image?')) return;
    setLoading(true);
    try {
      const updatedImages = contactShowcaseImages.filter(p => p !== imageUrl);
      setContactShowcaseImages(updatedImages);

      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'contact_showcase_images', data: { images: updatedImages } })
      });
      if (!saveRes.ok) throw new Error('Failed to update settings');

      showFeedback('Image deleted successfully');
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadingHero) return;

    setUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'hero-images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      setHeroImageUrl(data.url);

      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'hero_image', data: { url: data.url } })
      });
      if (!saveRes.ok) throw new Error('Failed to update settings');

      showFeedback('Saved successfully');
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleUploadLogoImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadingLogo) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'logo-images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      setLogoImageUrl(data.url);

      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'logo_image', data: { url: data.url } })
      });
      if (!saveRes.ok) throw new Error('Failed to update settings');

      showFeedback('Saved successfully');
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove the logo?')) return;
    setLogoImageUrl('');
    try {
      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'logo_image', data: { url: '' } })
      });
      if (!saveRes.ok) throw new Error('Failed to update settings');
      showFeedback('Logo removed successfully');
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      // 1. Save open_status
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'open_status', data: { is_open: isOpen } })
      });

      // 2. Save google_maps
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'google_maps', data: { url: googleMapsUrl } })
      });

      // 3. Save contacts
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'contact_info', data: contacts })
      });

      // 4. Save order links
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'order_links', data: orderLinks })
      });

      // 5. Save campaign details (if loaded)
      if (campaign) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ type: 'campaign', data: campaign })
        });
      }

      // 6. Save opening hours
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'opening_hours', data: openingHours })
      });

      showFeedback('Saved successfully');
      loadData();
    } catch {
      showFeedback('Something went wrong. Try again.', true);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
      {/* Header and Logout */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-latte pb-6 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="font-heading font-bold text-3xl text-espresso">Owner Dashboard</h1>
          <p className="font-body text-xs text-mocha mt-1">Logged in as Administrator</p>
        </div>
        <button
          onClick={onLogout}
          className="px-5 py-2 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-full text-xs font-semibold transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Feedback Alerts */}
      {message && (
        <div className="p-4 bg-olive/15 text-olive font-body text-sm rounded-xl mb-6 text-center animate-fade-up">
          {message}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-muted-red/15 text-muted-red font-body text-sm rounded-xl mb-6 text-center animate-fade-up">
          {errorMsg}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-latte pb-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        {(['menu', 'streak', 'order', 'vacancies', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setEditingItem(null);
              setEditingVacancy(null);
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-roasted text-white shadow-sm'
                : 'text-mocha hover:bg-latte/10'
            }`}
          >
            {tab === 'order' ? 'Delivery Links' : tab}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-mocha font-body">Updating dashboard records...</div>}

      {/* Dashboard Health Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="glass-card p-4 rounded-xl border border-latte text-center">
          <p className="text-xs font-semibold text-mocha uppercase">Menu Items</p>
          <p className="font-heading font-bold text-2xl text-espresso mt-1">{menuItems.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-latte text-center">
          <p className="text-xs font-semibold text-mocha uppercase">Featured</p>
          <p className="font-heading font-bold text-2xl text-roasted mt-1">
            {menuItems.filter(item => item.is_featured && item.is_available).length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-latte text-center">
          <p className="text-xs font-semibold text-mocha uppercase">Active Vacancies</p>
          <p className="font-heading font-bold text-2xl text-espresso mt-1">
            {vacancies.filter(v => v.is_active).length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-latte text-center">
          <p className="text-xs font-semibold text-mocha uppercase">Loyalty Customers</p>
          <p className="font-heading font-bold text-2xl text-espresso mt-1">
            {streakMetrics?.total_customers || 0}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-latte text-center">
          <p className="text-xs font-semibold text-mocha uppercase">Campaign</p>
          <p className={`font-heading font-bold text-lg mt-1 ${campaign ? 'text-olive' : 'text-mocha'}`}>
            {campaign ? 'Active' : 'None'}
          </p>
        </div>
      </div>

      {/* ==========================================
          TAB CONTENT: MENU MANAGER
          ========================================== */}
      {activeTab === 'menu' && !loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-xl text-espresso">Manage Menu Items</h2>
            {!editingItem && (
              <button
                onClick={() => setEditingItem({
                  category: 'Hotcakes',
                  name: '',
                  slug: '',
                  description: '',
                  price: 200,
                  image_url: '',
                  is_featured: false,
                  is_available: true,
                  display_order: 0
                })}
                className="px-5 py-2.5 bg-roasted hover:bg-dark-roast text-white rounded-full text-xs font-semibold shadow-sm"
              >
                Add Menu Item
              </button>
            )}
          </div>

          {editingItem ? (
            <form onSubmit={handleSaveMenu} className="glass-card p-6 md:p-8 rounded-[24px] max-w-xl mx-auto space-y-4 animate-fade-up">
              <h3 className="font-heading font-bold text-lg text-espresso mb-4">
                {editingItem.id ? 'Edit Item' : 'New Menu Item'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Category</label>
                  <select
                    value={editingItem.category || 'Hotcakes'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                  >
                    <option value="Hotcakes">Hotcakes</option>
                    <option value="Hot Coffee">Hot Coffee</option>
                    <option value="Cold Coffee">Cold Coffee</option>
                    <option value="Tea & Hot Beverages">Tea & Hot Beverages</option>
                    <option value="Beverages & Shakes">Beverages & Shakes</option>
                    <option value="Sandwiches & Savories">Sandwiches & Savories</option>
                    <option value="Desserts & Bakery">Desserts & Bakery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
                      setEditingItem({ ...editingItem, name, slug });
                    }}
                    placeholder="e.g. Classic Cappuccino"
                    className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Slug (URL Identifer)</label>
                <input
                  type="text"
                  required
                  value={editingItem.slug || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                  placeholder="classic-cappuccino"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                    placeholder="180"
                    className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingItem.display_order ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Optional details, ingredients, or servings"
                    className="w-full h-24 p-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1">Dietary Tags</label>
                  <input
                    type="text"
                    value={editingItem.dietary_tags || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dietary_tags: e.target.value })}
                    placeholder="e.g. Vegetarian, Gluten-Free, Spicy"
                    className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm mb-2"
                  />
                  <span className="text-[10px] text-mocha font-body block leading-relaxed">
                    Separate tags with commas. e.g. &quot;Veg, Hot, Sweet&quot;
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Item Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {editingItem.image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-latte bg-latte/30 flex-shrink-0">
                      <img
                        src={editingItem.image_url}
                        alt="Menu Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="flex-grow space-y-1.5 w-full">
                    <input
                      type="text"
                      value={editingItem.image_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                      placeholder="/images/menu/menu-cappuccino.jpg"
                      className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadMenuItemImage}
                        disabled={uploadingMenu}
                        className="text-xs text-mocha font-body"
                      />
                      {uploadingMenu && <span className="text-xs text-mocha animate-pulse">Uploading...</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-espresso cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingItem.is_featured}
                    onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-roasted focus:ring-roasted cursor-pointer"
                  />
                  Featured Item (Bestseller Carousel)
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-espresso cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_available !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                    className="w-4 h-4 rounded text-roasted focus:ring-roasted cursor-pointer"
                  />
                  Available (In Stock)
                </label>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={loading || uploadingMenu}
                  className="px-6 py-2.5 border border-latte text-mocha hover:bg-latte/15 rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingMenu}
                  className="px-6 py-2.5 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white rounded-full text-xs font-semibold flex items-center gap-2"
                >
                  {uploadingMenu ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Item'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
                <select
                  value={menuCategoryFilter}
                  onChange={(e) => setMenuCategoryFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={menuFeaturedFilter}
                  onChange={(e) => setMenuFeaturedFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                >
                  <option value="all">All (Featured)</option>
                  <option value="featured">Featured</option>
                  <option value="not-featured">Not Featured</option>
                </select>
                <select
                  value={menuAvailableFilter}
                  onChange={(e) => setMenuAvailableFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                >
                  <option value="all">All (Availability)</option>
                  <option value="available">Available</option>
                  <option value="hidden">Hidden</option>
                </select>
                <select
                  value={menuImageFilter}
                  onChange={(e) => setMenuImageFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                >
                  <option value="all">All (Images)</option>
                  <option value="has-image">Has Image</option>
                  <option value="missing-image">Missing Image</option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedMenuItems.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-latte/20 rounded-xl border border-latte">
                  <div className="flex items-center gap-4">
                    <span className="font-heading font-semibold text-espresso">
                      {selectedMenuItems.length} item{selectedMenuItems.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={() => setSelectedMenuItems([])}
                      className="text-xs text-mocha hover:text-espresso transition-colors"
                    >
                      Clear selection
                    </button>
                  </div>
                  <button
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="px-4 py-2 bg-muted-red hover:bg-red-700 text-white rounded-full text-xs font-semibold"
                  >
                    Delete Selected
                  </button>
                </div>
              )}

              {/* Menu Items Table */}
              <div className="overflow-x-auto border border-latte rounded-2xl bg-warm-white">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-latte/20 font-body text-xs font-bold uppercase tracking-wider text-mocha border-b border-latte">
                    <th className="p-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMenuItems.length === filteredMenuItems.length && filteredMenuItems.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMenuItems(filteredMenuItems.map(item => item.id));
                            } else {
                              setSelectedMenuItems([]);
                            }
                          }}
                          className="w-4 h-4 rounded text-roasted focus:ring-roasted"
                        />
                        Select All
                      </label>
                    </th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4">Image</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-latte/60 font-body text-sm text-espresso">
                  {filteredMenuItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-mocha">
                        No menu items found.
                      </td>
                    </tr>
                  ) : (
                    filteredMenuItems.map((item) => (
                      <tr key={item.id} className={`hover:bg-latte/5 transition-colors ${selectedMenuItems.includes(item.id) ? 'bg-roasted/5' : ''}`}>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedMenuItems.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMenuItems(prev => [...prev, item.id]);
                              } else {
                                setSelectedMenuItems(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-roasted focus:ring-roasted"
                          />
                        </td>
                        <td className="p-4 font-heading font-semibold">{item.name}</td>
                        <td className="p-4">{item.category}</td>
                        <td className="p-4">Rs. {item.price}</td>
                        <td className="p-4">{item.is_featured ? '⭐ Yes' : 'No'}</td>
                        <td className="p-4">
                          {item.image_url ? (
                            <span className="px-2 py-0.5 bg-olive/15 text-olive rounded-full text-xs font-medium">Valid Image</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-muted-red/15 text-muted-red rounded-full text-xs font-medium">Missing Image</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.is_available ? 'bg-olive/15 text-olive' : 'bg-muted-red/15 text-muted-red'
                          }`}>
                            {item.is_available ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="px-3 py-1 bg-roasted hover:bg-dark-roast text-white rounded-md text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(item.id)}
                            className="px-3 py-1 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-md text-xs font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>

              {/* Bulk Delete Confirmation Dialog */}
              {showBulkDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-cream rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fade-in">
                    <h3 className="font-heading font-bold text-xl text-espresso mb-4">
                      Delete {selectedMenuItems.length} Menu Items?
                    </h3>
                    <p className="font-body text-mocha text-sm mb-6">
                      This action cannot be undone. Are you sure you want to delete the selected items?
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowBulkDeleteConfirm(false)}
                        className="px-4 py-2 border border-latte text-mocha hover:bg-latte/10 rounded-full text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-muted-red hover:bg-red-700 text-white rounded-full text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB CONTENT: STREAK MANAGER (BARISTA)
          ========================================== */}
      {activeTab === 'streak' && !loading && (
        <div className="space-y-8 max-w-2xl mx-auto">
          {/* Loyalty Analytics Summary */}
          {streakMetrics && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-xl border border-latte text-center">
                <span className="block text-xs font-semibold text-mocha uppercase">Registered Customers</span>
                <span className="block font-heading font-bold text-2xl text-espresso mt-1">{streakMetrics.total_customers}</span>
              </div>
              <div className="glass-card p-4 rounded-xl border border-latte text-center">
                <span className="block text-xs font-semibold text-mocha uppercase">Stamps Collected</span>
                <span className="block font-heading font-bold text-2xl text-espresso mt-1">{streakMetrics.total_stamps}</span>
              </div>
              <div className="glass-card p-4 rounded-xl border border-latte text-center">
                <span className="block text-xs font-semibold text-mocha uppercase">Active Rewards</span>
                <span className="block font-heading font-bold text-2xl text-olive mt-1">{streakMetrics.total_active_rewards} 🎁</span>
              </div>
              <div className="glass-card p-4 rounded-xl border border-latte text-center">
                <span className="block text-xs font-semibold text-mocha uppercase">Rewards Redeemed</span>
                <span className="block font-heading font-bold text-2xl text-roasted mt-1">{streakMetrics.total_rewards_redeemed || 0}</span>
              </div>
            </div>
          )}

          {/* Quick Stamp Action */}
          <div className="glass-card p-6 rounded-2xl border border-latte">
            <h2 className="font-heading font-bold text-lg text-espresso mb-4">Barista Stamp Station</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddStamp(streakStampPhone); }} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={streakStampPhone}
                onChange={(e) => setStreakStampPhone(e.target.value)}
                placeholder="Enter customer phone number to stamp..."
                className="flex-grow h-11 px-4 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
              />
              <button
                type="submit"
                className="px-6 h-11 bg-roasted hover:bg-dark-roast text-white font-semibold rounded-xl text-xs transition-colors shrink-0"
              >
                +1 Stamp
              </button>
            </form>
            <p className="text-[10px] text-mocha font-body mt-2">
              Note: This will add a stamp (+1) to the customer record. If the phone number is not yet registered, it automatically creates a new customer profile with a generated code (HC-XXXX). Updates are locked to 1 stamp every 24 hours.
            </p>
          </div>

          {/* Search Lookup Profile */}
          <div className="glass-card p-6 rounded-2xl border border-latte">
            <h2 className="font-heading font-bold text-lg text-espresso mb-4">Lookup Customer Profile</h2>
            <form onSubmit={handleStreakSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                required
                value={streakQuery}
                onChange={(e) => setStreakQuery(e.target.value)}
                placeholder="Search by Customer Code or Phone Number..."
                className="flex-grow h-11 px-4 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
              />
              <button
                type="submit"
                className="px-6 h-11 bg-roasted hover:bg-dark-roast text-white font-semibold rounded-xl text-xs transition-colors shrink-0"
              >
                Search Profile
              </button>
            </form>

            {streakResult && (
              <div className="p-6 bg-warm-white rounded-xl border border-latte space-y-4 animate-fade-up">
                <div className="flex justify-between items-start pb-3 border-b border-latte/60">
                  <div>
                    <h3 className="font-heading font-bold text-espresso text-lg">{streakResult.customer_code}</h3>
                    <p className="font-body text-xs text-mocha font-medium">Phone: {streakResult.phone_number}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-heading font-bold text-2xl block ${streakResult.streak_count === 10 ? 'text-olive animate-pulse' : 'text-roasted'}`}>
                      {streakResult.streak_count} / 10 Stamps
                    </span>
                    <span className="text-xs text-mocha font-medium">
                      Rewards Redeemed: {(streakResult as StreakRecord).rewards_redeemed || 0}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-mocha font-body">
                  <p>Last stamp earned: {streakResult.last_stamp_at ? new Date(streakResult.last_stamp_at).toLocaleString() : 'Never'}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-2">
                  {streakResult.streak_count < 10 && (
                    <button
                      onClick={() => handleAddStamp(streakResult.phone_number)}
                      className="px-4 py-2 bg-roasted hover:bg-dark-roast text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      +1 Stamp
                    </button>
                  )}
                  <button
                    onClick={() => handleResetStreak(streakResult.customer_code)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      streakResult.streak_count === 10
                        ? 'bg-olive border-olive text-white hover:bg-olive/90 animate-pulse'
                        : 'border-roasted text-roasted hover:bg-roasted/5'
                    }`}
                  >
                    {streakResult.streak_count === 10 ? '🎁 Claim Coffee & Reset' : 'Reset Stamps'}
                  </button>
                  <button
                    onClick={() => handleDeleteStreak(streakResult.customer_code)}
                    className="px-4 py-2 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Delete Profile
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Customer Overview Table */}
          <div className="glass-card p-6 rounded-2xl border border-latte">
            <h2 className="font-heading font-bold text-lg text-espresso mb-4">Customer Registry</h2>
            {streakLoading ? (
              <div className="text-center py-6 text-mocha text-sm">Loading registry...</div>
            ) : streakRecords.length === 0 ? (
              <div className="text-center py-6 text-mocha text-sm">No customers found.</div>
            ) : (
              <div className="overflow-x-auto border border-latte rounded-xl bg-warm-white">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-latte/20 font-body text-xs font-bold uppercase tracking-wider text-mocha border-b border-latte">
                      <th className="p-3">Customer Code</th>
                      <th className="p-3">Phone Number</th>
                      <th className="p-3">Stamps</th>
                      <th className="p-3">Redeemed</th>
                      <th className="p-3">Last Visit</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-latte/60 font-body text-espresso">
                    {streakRecords.map((record) => {
                      // Mask phone number: e.g. 9841234567 -> 984*****67
                      const phone = record.phone_number || '';
                      const maskedPhone = phone.length > 5 
                        ? phone.substring(0, 3) + '*'.repeat(phone.length - 5) + phone.substring(phone.length - 2)
                        : phone;

                      return (
                        <tr key={record.id} className="hover:bg-latte/5 transition-colors">
                          <td className="p-3 font-semibold">{record.customer_code}</td>
                          <td className="p-3">{maskedPhone}</td>
                          <td className="p-3">
                            <span className={`font-semibold ${record.streak_count >= 10 ? 'text-olive' : 'text-roasted'}`}>
                              {record.streak_count} / 10
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-mocha">
                              {(record as StreakRecord).rewards_redeemed || 0}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-mocha">
                            {record.last_stamp_at ? new Date(record.last_stamp_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {record.streak_count < 10 && (
                              <button
                                onClick={() => handleAddStamp(record.phone_number)}
                                className="px-2.5 py-1 bg-roasted hover:bg-dark-roast text-white rounded text-xs font-medium"
                              >
                                +1
                              </button>
                            )}
                            <button
                              onClick={() => handleResetStreak(record.customer_code)}
                              className={`px-2.5 py-1 rounded text-xs font-medium border ${
                                record.streak_count === 10
                                  ? 'bg-olive border-olive text-white hover:bg-olive/90'
                                  : 'border-roasted text-roasted hover:bg-roasted/5'
                              }`}
                            >
                              {record.streak_count === 10 ? '🎁 Claim' : 'Reset'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB CONTENT: DELIVERY/ORDER LINKS
          ========================================== */}
      {activeTab === 'order' && !loading && (
        <form onSubmit={handleSaveOrderLinks} className="max-w-xl mx-auto glass-card p-6 md:p-8 rounded-[24px] border border-latte space-y-6">
          <h2 className="font-heading font-bold text-xl text-espresso mb-4">Delivery Platform Links</h2>
          
          {orderLinks.map((link, idx) => (
            <div key={link.platform} className="p-4 bg-warm-white rounded-xl border border-latte space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-heading font-bold capitalize text-espresso">{link.platform}</span>
                <label className="flex items-center gap-1.5 text-xs text-mocha font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={link.is_active}
                    onChange={(e) => {
                      const updated = [...orderLinks];
                      updated[idx].is_active = e.target.checked;
                      setOrderLinks(updated);
                    }}
                    className="w-4 h-4 text-roasted focus:ring-roasted rounded"
                  />
                  Active
                </label>
              </div>
              <input
                type="text"
                value={link.url || ''}
                onChange={(e) => {
                  const updated = [...orderLinks];
                  updated[idx].url = e.target.value;
                  setOrderLinks(updated);
                }}
                placeholder={`Paste ${link.platform} store URL here...`}
                className="w-full h-11 px-3 bg-white border border-latte rounded-lg font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-3 bg-roasted hover:bg-dark-roast text-white font-semibold rounded-full shadow-sm text-sm"
          >
            Save Delivery Links
          </button>
        </form>
      )}

      {/* ==========================================
          TAB CONTENT: VACANCIES MANAGER
          ========================================== */}
      {activeTab === 'vacancies' && !loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-xl text-espresso">Vacancy Campaigns</h2>
            {!editingVacancy && (
              <button
                onClick={() => setEditingVacancy({
                  title: '',
                  description: '',
                  google_form_link: '',
                  image_url: '/images/vacancies/vacancy-default.jpg',
                  is_active: true
                })}
                className="px-5 py-2.5 bg-roasted hover:bg-dark-roast text-white rounded-full text-xs font-semibold shadow-sm"
              >
                Create Job Campaign
              </button>
            )}
          </div>

          {editingVacancy ? (
            <form onSubmit={handleSaveVacancy} className="glass-card p-6 md:p-8 rounded-[24px] max-w-xl mx-auto space-y-4 animate-fade-up">
              <h3 className="font-heading font-bold text-lg text-espresso mb-4">
                {editingVacancy.id ? 'Edit Vacancy' : 'New Vacancy Campaign'}
              </h3>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editingVacancy.title || ''}
                  onChange={(e) => setEditingVacancy({ ...editingVacancy, title: e.target.value })}
                  placeholder="e.g. Senior Barista"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Google Form Link</label>
                <input
                  type="text"
                  required
                  value={editingVacancy.google_form_link || ''}
                  onChange={(e) => setEditingVacancy({ ...editingVacancy, google_form_link: e.target.value })}
                  placeholder="https://forms.gle/..."
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Job Description</label>
                <textarea
                  required
                  value={editingVacancy.description || ''}
                  onChange={(e) => setEditingVacancy({ ...editingVacancy, description: e.target.value })}
                  placeholder="Responsibilities, requirements, shift details..."
                  className="w-full h-32 p-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Job Banner Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {editingVacancy.image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-latte bg-latte/30 flex-shrink-0">
                      <img
                        src={editingVacancy.image_url}
                        alt="Vacancy Banner Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="flex-grow space-y-1.5 w-full">
                    <input
                      type="text"
                      value={editingVacancy.image_url || ''}
                      onChange={(e) => setEditingVacancy({ ...editingVacancy, image_url: e.target.value })}
                      placeholder="/images/vacancies/vacancy-default.jpg"
                      className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadVacancyImage}
                        disabled={uploadingVacancy}
                        className="text-xs text-mocha font-body"
                      />
                      {uploadingVacancy && <span className="text-xs text-mocha animate-pulse">Uploading...</span>}
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-espresso cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={!!editingVacancy.is_active}
                  onChange={(e) => setEditingVacancy({ ...editingVacancy, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-roasted focus:ring-roasted cursor-pointer"
                />
                Active Campaign (Visible on site)
              </label>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingVacancy(null)}
                  disabled={loading || uploadingVacancy}
                  className="px-6 py-2.5 border border-latte text-mocha hover:bg-latte/15 rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingVacancy}
                  className="px-6 py-2.5 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white rounded-full text-xs font-semibold flex items-center gap-2"
                >
                  {uploadingVacancy ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Campaign'
                  )}
                </button>
              </div>
            </form>
          ) : (
            vacancies.length === 0 ? (
              <div className="text-center py-12 text-mocha">
                No vacancies available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vacancies.map((vac) => (
                  <div key={vac.id} className="p-6 bg-warm-white rounded-2xl border border-latte space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-heading font-bold text-lg text-espresso">{vac.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vac.is_active ? 'bg-olive/15 text-olive' : 'bg-mocha/15 text-mocha'
                      }`}>
                        {vac.is_active ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <p className="font-body text-mocha text-xs line-clamp-3 leading-relaxed">{vac.description}</p>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setEditingVacancy(vac)}
                        className="px-3 py-1.5 bg-roasted hover:bg-dark-roast text-white rounded-md text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => vac.id && handleDeleteVacancy(vac.id)}
                        className="px-3 py-1.5 border border-muted-red text-muted-red hover:bg-muted-red/5 rounded-md text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ==========================================
          TAB CONTENT: SETTINGS & SOCIAL CONTACTS
          ========================================== */}
      {activeTab === 'settings' && !loading && (
        <div className="max-w-xl mx-auto space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Cafe Open Status */}
            <div className="glass-card p-6 rounded-2xl border border-latte space-y-3">
              <h2 className="font-heading font-bold text-lg text-espresso">Cafe Shop Status</h2>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-espresso cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  className="w-4 h-4 rounded text-roasted focus:ring-roasted cursor-pointer"
                />
                Show cafe open banner strip on home page
              </label>
            </div>

            {/* Cafe Opening Hours */}
            <div className="glass-card p-6 rounded-2xl border border-latte space-y-4">
              <h2 className="font-heading font-bold text-lg text-espresso">Cafe Opening Hours</h2>
              <p className="text-xs text-mocha font-body">Configure the opening times and closed days for each day of the week.</p>
              
              <div className="space-y-3">
                {DAY_NAMES.map((day) => {
                  const dayHours = openingHours[day] || DEFAULT_OPENING_HOURS[day];
                  return (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-latte/30 last:border-0 last:pb-0">
                      <span className="capitalize font-body text-sm font-semibold text-espresso min-w-[90px]">
                        {day}
                      </span>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Closed Toggle */}
                        <label className="flex items-center gap-1.5 font-body text-xs font-semibold text-espresso cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={dayHours.isClosed}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setOpeningHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day], isClosed: checked }
                              }));
                            }}
                            className="w-3.5 h-3.5 rounded text-roasted focus:ring-roasted cursor-pointer"
                          />
                          Closed
                        </label>
                        
                        {/* Open Time */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] uppercase font-bold text-mocha">Open:</span>
                          <input
                            type="time"
                            value={dayHours.openTime}
                            disabled={dayHours.isClosed}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOpeningHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day], openTime: val }
                              }));
                            }}
                            className="h-8 px-2 bg-warm-white border border-latte rounded-lg font-body text-espresso text-xs focus:outline-none focus:ring-2 focus:ring-roasted disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        
                        {/* Close Time */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] uppercase font-bold text-mocha">Close:</span>
                          <input
                            type="time"
                            value={dayHours.closeTime}
                            disabled={dayHours.isClosed}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOpeningHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day], closeTime: val }
                              }));
                            }}
                            className="h-8 px-2 bg-warm-white border border-latte rounded-lg font-body text-espresso text-xs focus:outline-none focus:ring-2 focus:ring-roasted disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Online Order Link */}
            <div className="glass-card p-6 rounded-2xl border border-latte space-y-3">
              <h2 className="font-heading font-bold text-lg text-espresso">Online Order Link</h2>
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Online Order Link</label>
                <input
                  type="text"
                  value={(() => {
                    const active = orderLinks.find(l => l.is_active);
                    return active?.url || '';
                  })()}
                  onChange={(e) => {
                    const val = e.target.value;
                    let platform = 'custom';
                    const lower = val.toLowerCase();
                    if (lower.includes('foodmandu')) platform = 'foodmandu';
                    else if (lower.includes('bhoj')) platform = 'bhoj';

                    const updated = orderLinks.map(link => {
                      if (link.platform === platform) {
                        return { ...link, url: val || null, is_active: true };
                      } else {
                        return { ...link, is_active: false };
                      }
                    });
                    setOrderLinks(updated);
                  }}
                  placeholder="Paste Bhoj or Foodmandu link here"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
              </div>
            </div>

            {/* Social & Contact Links */}
            <div className="glass-card p-6 rounded-2xl border border-latte space-y-4">
              <h2 className="font-heading font-bold text-lg text-espresso">Contacts & Social URLs</h2>
              
              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">WhatsApp Link</label>
                <input
                  type="text"
                  value={contacts.find(c => c.key === 'whatsapp')?.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContacts(prev => {
                      const idx = prev.findIndex(c => c.key === 'whatsapp');
                      if (idx > -1) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], value: val };
                        return updated;
                      }
                      return [...prev, { key: 'whatsapp', value: val }];
                    });
                  }}
                  placeholder="https://wa.me/977xxxxxxxxx"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Instagram Link</label>
                <input
                  type="text"
                  value={contacts.find(c => c.key === 'instagram')?.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContacts(prev => {
                      const idx = prev.findIndex(c => c.key === 'instagram');
                      if (idx > -1) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], value: val };
                        return updated;
                      }
                      return [...prev, { key: 'instagram', value: val }];
                    });
                  }}
                  placeholder="https://instagram.com/yourpage"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">TikTok Link</label>
                <input
                  type="text"
                  value={contacts.find(c => c.key === 'tiktok')?.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContacts(prev => {
                      const idx = prev.findIndex(c => c.key === 'tiktok');
                      if (idx > -1) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], value: val };
                        return updated;
                      }
                      return [...prev, { key: 'tiktok', value: val }];
                    });
                  }}
                  placeholder="https://tiktok.com/@yourpage"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={contacts.find(c => c.key === 'phone')?.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContacts(prev => {
                      const idx = prev.findIndex(c => c.key === 'phone');
                      if (idx > -1) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], value: val };
                        return updated;
                      }
                      return [...prev, { key: 'phone', value: val }];
                    });
                  }}
                  placeholder="+977 xxx-xxxxxxx"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Google Maps Link</label>
                <input
                  type="text"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Address Text</label>
                <input
                  type="text"
                  value={contacts.find(c => c.key === 'address')?.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContacts(prev => {
                      const idx = prev.findIndex(c => c.key === 'address');
                      if (idx > -1) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], value: val };
                        return updated;
                      }
                      return [...prev, { key: 'address', value: val }];
                    });
                  }}
                  placeholder="Hattiban, Lalitpur, Nepal"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
              </div>
            </div>

            {/* Hero Image Upload */}
            <div className="glass-card p-6 rounded-2xl border border-latte space-y-3">
              <h2 className="font-heading font-bold text-lg text-espresso">Hero/Banner Image</h2>
              <p className="text-xs text-mocha">Recommended: 1920x1080px</p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {heroImageUrl && (
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-latte bg-latte/30 flex-shrink-0">
                    <img
                      src={heroImageUrl}
                      alt="Hero Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="flex-grow space-y-1.5 w-full">
                  <input
                    type="text"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="Hero Image URL"
                    className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadHeroImage}
                      disabled={uploadingHero}
                      className="text-xs text-mocha font-body"
                    />
                    {uploadingHero && <span className="text-xs text-mocha animate-pulse">Uploading...</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Image Upload */}
            <div className="glass-card p-6 rounded-2xl border border-latte space-y-3">
              <h2 className="font-heading font-bold text-lg text-espresso">Logo Image</h2>
              <p className="text-xs text-mocha">Recommended: 500x500px PNG</p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {(logoImageUrl || true) && (
                  <div className="relative w-32 h-12 rounded-lg overflow-hidden border border-latte bg-latte/30 flex-shrink-0">
                    {logoImageUrl ? (
                      <img
                        src={logoImageUrl}
                        alt="Logo Preview"
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-mocha text-xs">No Logo</div>
                    )}
                  </div>
                )}
                <div className="flex-grow space-y-1.5 w-full">
                  <input
                    type="text"
                    value={logoImageUrl}
                    onChange={(e) => setLogoImageUrl(e.target.value)}
                    placeholder="Logo Image URL"
                    className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogoImage}
                      disabled={uploadingLogo}
                      className="text-xs text-mocha font-body"
                    />
                    {uploadingLogo && <span className="text-xs text-mocha animate-pulse">Uploading...</span>}
                    {logoImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={uploadingLogo}
                        className="px-4 py-1.5 border border-muted-red text-muted-red hover:bg-muted-red/10 text-xs font-semibold rounded-full transition-colors"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Photos */}
            <div className="glass-card p-6 rounded-2xl border border-latte space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-lg text-espresso">Location Gallery Photos</h2>
                <span className="text-xs font-semibold text-mocha">{locationPhotos.length}/4</span>
              </div>
              <p className="text-xs text-mocha">Recommended: 1200px+ width</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {locationPhotos.map((photoUrl, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-latte bg-latte/30 group">
                    <img
                      src={photoUrl}
                      alt={`Location ${index}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteLocationPhoto(photoUrl)}
                      className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 text-white rounded-full p-1 text-xs transition-colors"
                      title="Delete Photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLocationPhoto}
                  disabled={uploadingLocation || locationPhotos.length >= 4}
                  className="text-xs text-mocha font-body"
                />
                {uploadingLocation && <span className="text-xs text-mocha animate-pulse">Uploading...</span>}
              </div>
            </div>

            {/* Contact Showcase Images */}
            <div className="glass-card p-6 rounded-2xl border border-latte space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-lg text-espresso">Contact Showcase Images</h2>
                <span className="text-xs font-semibold text-mocha">{contactShowcaseImages.length}/8</span>
              </div>
              <p className="text-xs text-mocha">Recommended: 1200px+ width (jpg, png, webp)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {contactShowcaseImages.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-latte bg-latte/30 group">
                    <img
                      src={imageUrl}
                      alt={`Contact Showcase ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteContactShowcaseImage(imageUrl)}
                      className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 text-white rounded-full p-1 text-xs transition-colors"
                      title="Delete Image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleUploadContactShowcaseImage}
                  disabled={uploadingContactShowcase || contactShowcaseImages.length >= 8}
                  className="text-xs text-mocha font-body"
                />
                {uploadingContactShowcase && <span className="text-xs text-mocha animate-pulse">Uploading...</span>}
              </div>
            </div>

            {/* Brew Streak Campaign Setup */}
            {campaign && (
              <div className="glass-card p-6 rounded-2xl border border-latte space-y-4">
                <h2 className="font-heading font-bold text-lg text-espresso">Brew Streak Campaign</h2>
                <label className="flex items-center gap-2 font-body text-sm font-semibold text-espresso cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.is_active}
                    onChange={(e) => setCampaign({ ...campaign, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-roasted focus:ring-roasted cursor-pointer"
                  />
                  Active loyalty campaign (shows on home page)
                </label>

                <div>
                  <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Tagline</label>
                  <input
                    type="text"
                    value={campaign.tagline || ''}
                    onChange={(e) => setCampaign({ ...campaign, tagline: e.target.value })}
                    placeholder="10 stamps = 1 free coffee"
                    className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={campaign.start_date ? campaign.start_date.substring(0, 10) : ''}
                      onChange={(e) => setCampaign({ ...campaign, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={campaign.end_date ? campaign.end_date.substring(0, 10) : ''}
                      onChange={(e) => setCampaign({ ...campaign, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={savingSettings || uploadingMenu || uploadingVacancy || uploadingLocation || uploadingContactShowcase || uploadingHero || uploadingLogo}
              className="w-full py-3 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white font-semibold rounded-full shadow-sm text-sm flex items-center justify-center gap-2"
            >
              {savingSettings ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save All Settings'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
