import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Plus, Edit, Trash2, Users, Loader2, X, Save, Upload, Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import type { PG, Booking } from '../types';

const emptyForm = {
  name: '', description: '', location: '', address: '',
  latitude: '', longitude: '', rooms: '1',
  room_pricing: {} as Record<string, number>, gender_preference: 'any',
  food_available: false, wifi: false, ac: false,
  attached_bathroom: false, laundry: false, parking: false,
  images: [] as string[],
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/login');
      return;
    }
    Promise.all([
      api.get<PG[]>(`/pgs?ownerId=${user.id}`).then(({ data }) => setPgs(data)),
      api.get<Booking[]>('/bookings').then(({ data }) => setBookings(data)),
    ]).finally(() => setLoading(false));
  }, [user, navigate]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (pg: PG) => {
    setEditingId(pg.id);
    setForm({
      name: pg.name,
      description: pg.description || '',
      location: pg.location,
      address: pg.address || '',
      latitude: pg.latitude?.toString() || '',
      longitude: pg.longitude?.toString() || '',
      rooms: pg.rooms.toString(),
      room_pricing: pg.room_pricing || {},
      gender_preference: pg.gender_preference,
      food_available: pg.food_available,
      wifi: pg.wifi,
      ac: pg.ac,
      attached_bathroom: pg.attached_bathroom,
      laundry: pg.laundry,
      parking: pg.parking,
      images: pg.images?.length ? pg.images : emptyForm.images,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(form.room_pricing).length === 0) {
      alert('Please select at least one room type and set its price.');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      rooms: Number(form.rooms),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    };

    try {
      if (editingId) {
        await api.put(`/pg/${editingId}`, payload);
      } else {
        await api.post('/pg', payload);
      }
      const { data } = await api.get<PG[]>(`/pgs?ownerId=${user!.id}`);
      setPgs(data);
      setShowForm(false);
    } catch {
      alert('Failed to save PG');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this PG listing?')) return;
    try {
      await api.delete(`/pg/${id}`);
      setPgs(pgs.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // The backend returns a relative URL like /uploads/...
      // For local development, prefix with the API base URL if needed, or rely on vite proxy.
      // Assuming Vite proxies /uploads if configured, but let's just use the relative URL.
      setForm({ ...form, images: [data.url] });
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      const { data } = await api.get<Booking[]>('/bookings');
      setBookings(data);
    } catch {
      alert('Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Owner Dashboard</h1>
              <p className="text-gray-500">Manage your PG listings</p>
            </div>
          </div>
          <button onClick={openCreate} className="btn-primary !py-2">
            <Plus size={18} /> Add PG
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card"><p className="text-2xl font-bold">{pgs.length}</p><p className="text-sm text-gray-500">Total Listings</p></div>
          <div className="glass-card"><p className="text-2xl font-bold">{bookings.filter((b) => b.status === 'pending').length}</p><p className="text-sm text-gray-500">Pending Bookings</p></div>
          <div className="glass-card"><p className="text-2xl font-bold">{bookings.filter((b) => b.status === 'confirmed').length}</p><p className="text-sm text-gray-500">Active Tenants</p></div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">{editingId ? 'Edit PG' : 'Add New PG'}</h2>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <input placeholder="PG Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field !py-2" required />
                <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[60px]" />
                <input placeholder="Location *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field !py-2" required />
                <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field !py-2" />
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50">
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <ImageIcon size={16} /> PG Photo
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2"
                    >
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {uploading ? 'Uploading...' : 'Choose Photo'}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {form.images[0] && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                        <img src={form.images[0]} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="input-field !py-2" />
                  <input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="input-field !py-2" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <input type="number" placeholder="Total Rooms" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} className="input-field !py-2" />
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50">
                  <label className="text-sm font-medium mb-2 block">Room Types & Pricing *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['single', 'double', 'triple', 'shared'].map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={form.room_pricing[type] !== undefined}
                          onChange={(e) => {
                            const newPricing = { ...form.room_pricing };
                            if (e.target.checked) newPricing[type] = 5000;
                            else delete newPricing[type];
                            setForm({ ...form, room_pricing: newPricing });
                          }}
                        />
                        <span className="capitalize text-sm w-16">{type}</span>
                        {form.room_pricing[type] !== undefined && (
                          <input 
                            type="number"
                            min="0"
                            placeholder="₹/mo"
                            value={form.room_pricing[type] || ''}
                            onChange={(e) => setForm({ 
                              ...form, 
                              room_pricing: { ...form.room_pricing, [type]: Number(e.target.value) } 
                            })}
                            className="input-field !py-1 !text-sm w-full"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <select value={form.gender_preference} onChange={(e) => setForm({ ...form, gender_preference: e.target.value })} className="input-field !py-2">
                    <option value="any">Any</option><option value="male">Male</option><option value="female">Female</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {(['food_available', 'wifi', 'ac', 'attached_bathroom', 'laundry', 'parking'] as const).map((key) => (
                    <label key={key} className="flex items-center gap-1">
                      <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                      {key.replace('_', ' ')}
                    </label>
                  ))}
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full !py-2">
                  <Save size={16} /> {saving ? 'Saving...' : 'Save PG'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card">
            <h2 className="font-semibold text-lg mb-4">My PG Listings</h2>
            {pgs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No listings yet. Add your first PG!</p>
            ) : (
              <div className="space-y-3">
                {pgs.map((pg) => (
                  <div key={pg.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <img src={pg.images?.[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pg.name}</p>
                      <p className="text-sm text-gray-500">
                        {pg.room_pricing && Object.keys(pg.room_pricing).length > 0 
                          ? `Starts from ₹${Math.min(...Object.values(pg.room_pricing))}/mo`
                          : `₹${pg.rent}/mo`} • {pg.location}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(pg)} className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg text-primary-500"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(pg.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary-500" /> Bookings
            </h2>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{b.user_name}</p>
                        <p className="text-xs text-gray-500">{b.pg_name} • ₹{b.total_amount?.toLocaleString()}</p>
                      </div>
                      <span className="text-xs capitalize font-medium">{b.status}</span>
                    </div>
                    {b.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="btn-primary !py-1 !px-2 text-xs">Confirm</button>
                        <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="btn-secondary !py-1 !px-2 text-xs text-red-500">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
