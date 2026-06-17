'use client';

import { useState, useEffect } from 'react';

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
  
  // 2. Streak Manager States
  const [streakQuery, setStreakQuery] = useState('');
  const [streakResult, setStreakResult] = useState<any>(null);
  const [streakStampPhone, setStreakStampPhone] = useState('');

  // 3. Order Links States
  const [orderLinks, setOrderLinks] = useState<OrderLink[]>([]);

  // 4. Vacancies Manager States
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [editingVacancy, setEditingVacancy] = useState<Partial<Vacancy> | null>(null);

  // 5. Settings States
  const [isOpen, setIsOpen] = useState(true);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      const menuData = await res.json();
      setMenuItems(menuData.items || []);

      const settingsRes = await fetch('/api/admin/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'search', phone_number: 'dummy-load' }) // dummy query to get database schema check
      });
      // Additional public fetches
      const publicHome = await fetch('/'); 
      
      // Let's query orders and contacts directly from public endpoints or database
      // Since they are public, we can fetch them from their respective tables using anon key
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: ord } = await supabase.from('order_links').select('*');
      setOrderLinks(ord || []);

      const { data: vac } = await supabase.from('vacancies').select('*');
      setVacancies(vac || []);

      const { data: con } = await supabase.from('contact_info').select('*');
      setContacts(con || []);

      const { data: camp } = await supabase.from('campaigns').select('*').single();
      setCampaign(camp);

      const { data: openSetting } = await supabase.from('site_settings').select('value').eq('key', 'open_status').single();
      setIsOpen((openSetting?.value as any)?.is_open ?? true);
      
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
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const isNew = !editingItem.id;
      const url = '/api/admin/menu';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingItem)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save menu item');

      showFeedback(`Menu item ${isNew ? 'added' : 'updated'} successfully!`);
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      showFeedback(err.message, true);
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
    } catch (err: any) {
      showFeedback(err.message, true);
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
    } catch (err: any) {
      showFeedback(err.message, true);
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
      loadData();
    } catch (err: any) {
      showFeedback(err.message, true);
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
      loadData();
    } catch (err: any) {
      showFeedback(err.message, true);
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
      loadData();
    } catch (err: any) {
      showFeedback(err.message, true);
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
    } catch (err: any) {
      showFeedback(err.message, true);
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
    } catch (err: any) {
      showFeedback(err.message, true);
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
    } catch (err: any) {
      showFeedback(err.message, true);
    }
  };

  // ==========================================
  // GENERAL SETTINGS & CONTACTS
  // ==========================================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Save open_status
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'open_status', data: { is_open: isOpen } })
      });

      // 2. Save contacts
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'contact_info', data: contacts })
      });

      // 3. Save campaign details (if loaded)
      if (campaign) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ type: 'campaign', data: campaign })
        });
      }

      showFeedback('All settings saved successfully!');
      loadData();
    } catch (err: any) {
      showFeedback(err.message, true);
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
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingItem.image_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                  placeholder="/images/menu/menu-cappuccino.jpg"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                />
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
                  className="px-6 py-2.5 border border-latte text-mocha hover:bg-latte/15 rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-roasted hover:bg-dark-roast text-white rounded-full text-xs font-semibold"
                >
                  Save Item
                </button>
              </div>
            </form>
          ) : (
            <div className="overflow-x-auto border border-latte rounded-2xl bg-warm-white">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-latte/20 font-body text-xs font-bold uppercase tracking-wider text-mocha border-b border-latte">
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-latte/60 font-body text-sm text-espresso">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-latte/5 transition-colors">
                      <td className="p-4 font-heading font-semibold">{item.name}</td>
                      <td className="p-4">{item.category}</td>
                      <td className="p-4">Rs. {item.price}</td>
                      <td className="p-4">{item.is_featured ? '⭐ Yes' : 'No'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.is_available ? 'bg-olive/15 text-olive' : 'bg-muted-red/15 text-muted-red'
                        }`}>
                          {item.is_available ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem(item)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB CONTENT: STREAK MANAGER (BARISTA)
          ========================================== */}
      {activeTab === 'streak' && !loading && (
        <div className="space-y-8 max-w-2xl mx-auto">
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
                  <span className={`font-heading font-bold text-2xl ${streakResult.streak_count === 10 ? 'text-olive animate-pulse' : 'text-roasted'}`}>
                    {streakResult.streak_count} / 10 Stamps
                  </span>
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

              <div>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1">Job Banner URL</label>
                <input
                  type="text"
                  value={editingVacancy.image_url || ''}
                  onChange={(e) => setEditingVacancy({ ...editingVacancy, image_url: e.target.value })}
                  placeholder="/images/vacancies/vacancy-default.jpg"
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso focus:outline-none focus:ring-2 focus:ring-roasted text-sm"
                />
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
                  className="px-6 py-2.5 border border-latte text-mocha hover:bg-latte/15 rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-roasted hover:bg-dark-roast text-white rounded-full text-xs font-semibold"
                >
                  Save Campaign
                </button>
              </div>
            </form>
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
          )}
        </div>
      )}

      {/* ==========================================
          TAB CONTENT: SETTINGS & SOCIAL CONTACTS
          ========================================== */}
      {activeTab === 'settings' && !loading && (
        <form onSubmit={handleSaveSettings} className="max-w-xl mx-auto space-y-6">
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

          {/* Social Links */}
          <div className="glass-card p-6 rounded-2xl border border-latte space-y-4">
            <h2 className="font-heading font-bold text-lg text-espresso">Contacts & Social URLs</h2>
            {contacts.map((contact, idx) => (
              <div key={contact.key}>
                <label className="block text-xs font-semibold text-mocha uppercase mb-1.5">{contact.key}</label>
                <input
                  type="text"
                  value={contact.value}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[idx].value = e.target.value;
                    setContacts(updated);
                  }}
                  className="w-full h-11 px-3 bg-warm-white border border-latte rounded-xl font-body text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-roasted"
                />
              </div>
            ))}
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
            className="w-full py-3 bg-roasted hover:bg-dark-roast text-white font-semibold rounded-full shadow-sm text-sm"
          >
            Save All Settings
          </button>
        </form>
      )}
    </div>
  );
}
