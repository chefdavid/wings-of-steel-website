import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Package,
  Heart,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronDown,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  Building,
  Trash2
} from 'lucide-react';

interface Registration {
  id: string;
  event_name: string;
  event_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string;
  team_members: string;
  special_requests: string;
  package_name: string;
  package_price: number;
  addons: any[];
  donation_amount: number;
  subtotal: number;
  total_amount: number;
  payment_intent_id: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalRegistrations: number;
  totalDonations: number;
  averageOrder: number;
  pendingPayments: number;
  completedPayments: number;
  totalLanes: number;
  totalAddons: number;
}

export default function PizzaPinsDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalRegistrations: 0,
    totalDonations: 0,
    averageOrder: 0,
    pendingPayments: 0,
    completedPayments: 0,
    totalLanes: 0,
    totalAddons: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    fetchRegistrations();

    // Set up real-time subscription
    const subscription = supabase
      .channel('event_registrations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations' },
        (payload) => {
          console.log('Registration update:', payload);
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_name', 'Pizza, Pins & Pop 2024')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const registrationData = data || [];
      setRegistrations(registrationData);

      // Calculate statistics
      const stats = calculateStats(registrationData);
      setStats(stats);
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      setError(err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('event_registrations')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Immediately update the local state
      setRegistrations(prev => {
        const updated = prev.filter(r => r.id !== id);
        // Recalculate stats with the updated data
        const newStats = calculateStats(updated);
        setStats(newStats);
        return updated;
      });

      // Close the modal if it was open
      setSelectedRegistration(null);

      // Also fetch fresh data from the server
      setTimeout(() => {
        fetchRegistrations();
      }, 500);
    } catch (err: any) {
      console.error('Error deleting registration:', err);
      alert('Failed to delete registration: ' + err.message);
    }
  };

  const calculateStats = (data: Registration[]): DashboardStats => {
    const completedRegistrations = data.filter(r => r.payment_status === 'completed' || r.payment_status === 'succeeded');
    const pendingRegistrations = data.filter(r => r.payment_status === 'pending');

    const totalRevenue = completedRegistrations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
    const totalDonations = completedRegistrations.reduce((sum, r) => sum + (r.donation_amount || 0), 0);
    const totalAddons = completedRegistrations.reduce((sum, r) => sum + (r.addons?.length || 0), 0);

    return {
      totalRevenue: totalRevenue / 100, // Convert from cents
      totalRegistrations: data.length,
      totalDonations: totalDonations / 100,
      averageOrder: completedRegistrations.length > 0 ? totalRevenue / completedRegistrations.length / 100 : 0,
      pendingPayments: pendingRegistrations.length,
      completedPayments: completedRegistrations.length,
      totalLanes: completedRegistrations.length,
      totalAddons
    };
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return 'text-green-500 bg-green-500/20';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'failed':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return <Check className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredRegistrations = registrations
    .filter(r => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'completed' && r.payment_status !== 'completed' && r.payment_status !== 'succeeded') {
          return false;
        }
        if (filterStatus === 'pending' && r.payment_status !== 'pending') {
          return false;
        }
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          r.customer_name?.toLowerCase().includes(search) ||
          r.customer_email?.toLowerCase().includes(search) ||
          r.customer_phone?.includes(search) ||
          r.customer_company?.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof Registration];
      const bVal = b[sortBy as keyof Registration];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (aVal < bVal) return -1 * modifier;
      if (aVal > bVal) return 1 * modifier;
      return 0;
    });

  const exportToCSV = () => {
    const headers = [
      'Date', 'Name', 'Email', 'Phone', 'Company', 'Package', 'Add-ons',
      'Donation', 'Total', 'Status', 'Team Members', 'Special Requests'
    ];

    const rows = filteredRegistrations.map(r => [
      formatDate(r.created_at),
      r.customer_name,
      r.customer_email,
      r.customer_phone || '',
      r.customer_company || '',
      r.package_name,
      r.addons?.map(a => a.name).join('; ') || '',
      formatCurrency(r.donation_amount || 0),
      formatCurrency(r.total_amount / 100),
      r.payment_status,
      r.team_members || '',
      r.special_requests || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pizza-pins-pop-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-96">
          <RefreshCw className="w-12 h-12 text-steel-blue animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  🎳 Pizza, Pins & Pop Event Sales
                </h1>
                <p className="text-gray-600">
                  Real-time registration and sales data
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={fetchRegistrations}
                  className="flex items-center gap-2 px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/80 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 shadow-sm rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <span className="text-xs text-gray-500">TOTAL REVENUE</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Avg: {formatCurrency(stats.averageOrder)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 shadow-sm rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-ice-blue" />
                  <span className="text-xs text-gray-500">REGISTRATIONS</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalRegistrations}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.completedPayments} paid, {stats.pendingPayments} pending
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-gray-200 shadow-sm rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-8 h-8 text-red-500" />
                  <span className="text-xs text-gray-500">DONATIONS</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalDonations)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Extra support received
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-gray-200 shadow-sm rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-yellow-500" />
                  <span className="text-xs text-gray-500">LANES & ADD-ONS</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalLanes}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.totalAddons} add-ons purchased
                </p>
              </motion.div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 rounded border border-gray-300 focus:border-steel-blue outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 focus:border-steel-blue outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 focus:border-steel-blue outline-none"
                  >
                    <option value="created_at">Date</option>
                    <option value="customer_name">Name</option>
                    <option value="total_amount">Amount</option>
                    <option value="payment_status">Status</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 hover:border-steel-blue"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Package
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRegistrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(registration.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{registration.customer_name}</div>
                          <div className="text-xs text-gray-600">{registration.customer_email}</div>
                          {registration.customer_phone && (
                            <div className="text-xs text-gray-600">{registration.customer_phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{registration.package_name}</div>
                          {registration.addons && registration.addons.length > 0 && (
                            <div className="text-xs text-gray-600">
                              +{registration.addons.length} add-on{registration.addons.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-bold">
                            {formatCurrency(registration.total_amount / 100)}
                          </div>
                          {registration.donation_amount > 0 && (
                            <div className="text-xs text-green-400">
                              +{formatCurrency(registration.donation_amount / 100)} donation
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(registration.payment_status)}`}>
                            {getStatusIcon(registration.payment_status)}
                            {registration.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedRegistration(registration)}
                              className="text-steel-blue hover:text-blue-700 transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => deleteRegistration(registration.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete registration"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRegistrations.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-steel-gray">No registrations found</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-steel rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-steel-gray/30">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Registration Details</h2>
                  <p className="text-gray-600">ID: {selectedRegistration.id.substring(0, 8)}...</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      deleteRegistration(selectedRegistration.id);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-bebas text-ice-blue mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-steel-gray">Name</p>
                    <p className="text-white">{selectedRegistration.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-steel-gray">Email</p>
                    <p className="text-white">{selectedRegistration.customer_email}</p>
                  </div>
                  {selectedRegistration.customer_phone && (
                    <div>
                      <p className="text-xs text-steel-gray">Phone</p>
                      <p className="text-white">{selectedRegistration.customer_phone}</p>
                    </div>
                  )}
                  {selectedRegistration.customer_company && (
                    <div>
                      <p className="text-xs text-steel-gray">Company</p>
                      <p className="text-white">{selectedRegistration.customer_company}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h3 className="text-lg font-bebas text-ice-blue mb-3">Order Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-steel-gray">Package</span>
                    <span className="text-white">{selectedRegistration.package_name}</span>
                  </div>
                  {selectedRegistration.addons && selectedRegistration.addons.length > 0 && (
                    <div>
                      <p className="text-steel-gray mb-1">Add-ons:</p>
                      {selectedRegistration.addons.map((addon, idx) => (
                        <div key={idx} className="flex justify-between pl-4">
                          <span className="text-sm text-steel-gray">{addon.name}</span>
                          <span className="text-sm text-white">
                            {formatCurrency((addon.price || 0) / 100)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedRegistration.donation_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-steel-gray">Donation</span>
                      <span className="text-green-400">
                        {formatCurrency(selectedRegistration.donation_amount / 100)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-steel-gray/30">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-ice-blue font-bold">
                      {formatCurrency(selectedRegistration.total_amount / 100)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {selectedRegistration.team_members && (
                <div>
                  <h3 className="text-lg font-bebas text-ice-blue mb-3">Team Members</h3>
                  <p className="text-white whitespace-pre-wrap bg-black/30 p-3 rounded">
                    {selectedRegistration.team_members}
                  </p>
                </div>
              )}

              {/* Special Requests */}
              {selectedRegistration.special_requests && (
                <div>
                  <h3 className="text-lg font-bebas text-ice-blue mb-3">Special Requests</h3>
                  <p className="text-white whitespace-pre-wrap bg-yellow-500/10 p-3 rounded">
                    {selectedRegistration.special_requests}
                  </p>
                </div>
              )}

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-bebas text-ice-blue mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-steel-gray">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedRegistration.payment_status)}`}>
                      {getStatusIcon(selectedRegistration.payment_status)}
                      {selectedRegistration.payment_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-steel-gray">Payment ID</p>
                    <p className="text-white text-sm font-mono">
                      {selectedRegistration.payment_intent_id?.substring(0, 20)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-steel-gray">Created</p>
                    <p className="text-white">{formatDate(selectedRegistration.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-steel-gray">Updated</p>
                    <p className="text-white">{formatDate(selectedRegistration.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}