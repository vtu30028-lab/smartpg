import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Users, Building2, Calendar, IndianRupee, Loader2, Trash2, Search,
} from 'lucide-react';
import api from '../services/api';
import { getCurrentUser, searchUsers } from '../services/auth';
import type { User, PG, Booking } from '../types';

interface Stats {
  users: number;
  pgs: number;
  bookings: number;
  revenue: number;
  recentBookings: Booking[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pgs'>('overview');
  const [userQuery, setUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    Promise.all([
      api.get<Stats>('/stats').then(({ data }) => setStats(data)),
      api.get<User[]>('/users').then(({ data }) => setUsers(data)),
      api.get<PG[]>('/pgs').then(({ data }) => setPgs(data)),
    ]).finally(() => setLoading(false));
  }, [navigate]);

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleUserSearch = async () => {
    try {
      const { data } = await searchUsers(userQuery, roleFilter || undefined);
      setUsers(data);
    } catch {
      alert('Search failed');
    }
  };

  const loadAllUsers = async () => {
    setUserQuery('');
    setRoleFilter('');
    const { data } = await api.get<User[]>('/users');
    setUsers(data);
  };

  const togglePGFeatured = async (pg: PG) => {
    try {
      await api.put(`/pg/${pg.id}`, { is_featured: !pg.is_featured });
      setPgs(pgs.map((p) => (p.id === pg.id ? { ...p, is_featured: !p.is_featured } : p)));
    } catch {
      alert('Failed to update PG');
    }
  };

  const togglePGActive = async (pg: PG) => {
    try {
      await api.put(`/pg/${pg.id}`, { is_active: !pg.is_active });
      setPgs(pgs.map((p) => (p.id === pg.id ? { ...p, is_active: !p.is_active } : p)));
    } catch {
      alert('Failed to update PG');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'users' as const, label: 'Users' },
    { id: 'pgs' as const, label: 'PGs' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500">System management & reports</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'glass hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500' },
                { label: 'Total PGs', value: stats.pgs, icon: Building2, color: 'text-green-500' },
                { label: 'Bookings', value: stats.bookings, icon: Calendar, color: 'text-purple-500' },
                { label: 'Revenue', value: `₹${Number(stats.revenue).toLocaleString()}`, icon: IndianRupee, color: 'text-accent-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass-card">
                  <Icon size={24} className={`${color} mb-2`} />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="glass-card">
              <h2 className="font-semibold text-lg mb-4">Recent Bookings</h2>
              {stats.recentBookings.length === 0 ? (
                <p className="text-gray-500">No recent bookings.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2">Student</th>
                        <th className="pb-2">PG</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3">{b.user_name}</td>
                          <td className="py-3">{b.pg_name}</td>
                          <td className="py-3">₹{b.total_amount?.toLocaleString()}</td>
                          <td className="py-3 capitalize">{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="glass-card">
            <h2 className="font-semibold text-lg mb-4">All Users (from Database)</h2>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                  placeholder="Search by name, email or phone..."
                  className="input-field !pl-9 !py-2 text-sm"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field !py-2 text-sm sm:w-36"
              >
                <option value="">All roles</option>
                <option value="student">Student</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleUserSearch} className="btn-primary !py-2 text-sm">Search</button>
              <button onClick={loadAllUsers} className="btn-secondary !py-2 text-sm">Reset</button>
            </div>

            <p className="text-xs text-gray-500 mb-3">{users.length} user(s) found in MySQL database</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Phone</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Joined</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 text-gray-400">#{u.id}</td>
                      <td className="py-3 font-medium">{u.name}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3">{u.phone || '—'}</td>
                      <td className="py-3 capitalize"><span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{u.role}</span></td>
                      <td className="py-3 text-gray-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td className="py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteUser(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pgs' && (
          <div className="glass-card">
            <h2 className="font-semibold text-lg mb-4">Manage PGs</h2>
            <div className="space-y-3">
              {pgs.map((pg) => (
                <div key={pg.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-medium">{pg.name}</p>
                    <p className="text-sm text-gray-500">{pg.location} • ₹{pg.rent}/mo • {pg.owner_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePGFeatured(pg)}
                      className={`text-xs px-3 py-1 rounded-lg ${pg.is_featured ? 'bg-accent-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      {pg.is_featured ? 'Featured' : 'Feature'}
                    </button>
                    <button
                      onClick={() => togglePGActive(pg)}
                      className={`text-xs px-3 py-1 rounded-lg ${pg.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {pg.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
