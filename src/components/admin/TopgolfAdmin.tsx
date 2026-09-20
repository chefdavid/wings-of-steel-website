import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Download, Search, Mail, X, CheckCircle, Users, DollarSign, Trash2, RefreshCw, Heart } from 'lucide-react';

interface TopgolfRegistration {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string | null;
  amount: number;
  event_tag: string;
  payment_status: string;
  created_at: string;
  ticket_count?: number | null;
  ticket_amount?: number | null;
  addon_donation?: number | null;
}

// One entry per Topgolf event. Registrations for every event live in the same
// `donations` table, told apart only by event_tag -- without this the October
// numbers would silently fold in the March outing's 37 registrations.
const EVENTS = [
  {
    key: 'topgolf-oct-2026',
    label: 'Oct 25, 2026 — Youth',
    tags: ['topgolf-oct-2026'],
    price: 25,
  },
  {
    key: 'topgolf-mar-2026',
    label: 'Mar 8, 2026 — Youth & Adult',
    tags: ['topgolf-youth', 'topgolf-adult'],
    price: 20,
  },
] as const;

const CURRENT_EVENT_KEY = 'topgolf-oct-2026';

const teamLabel = (tag: string) =>
  tag === 'topgolf-adult' ? 'Adult' : 'Youth';

// Tickets sold on a row. Rows written before migration 019 have no ticket_count,
// so fall back to dividing by that event's ticket price.
const ticketsOn = (reg: TopgolfRegistration, price: number) => {
  if (reg.ticket_count != null) return reg.ticket_count;
  const ticketPortion = reg.ticket_amount ?? reg.amount;
  return Math.max(1, Math.round(ticketPortion / price));
};

const TopgolfAdmin = () => {
  const [registrations, setRegistrations] = useState<TopgolfRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEvent, setFilterEvent] = useState<string>(CURRENT_EVENT_KEY);
  const [filterTeam, setFilterTeam] = useState<'all' | 'youth' | 'adult'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<TopgolfRegistration | null>(null);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalRevenue: 0,
    totalPlayers: 0,
    youthPlayers: 0,
    adultPlayers: 0,
    ticketRevenue: 0,
    donationRevenue: 0,
    donorCount: 0,
  });

  const activeEvent =
    EVENTS.find((e) => e.key === filterEvent) ?? EVENTS[0];

  useEffect(() => {
    fetchRegistrations();

    // Set up real-time subscription
    const channel = supabase
      .channel('topgolf_registrations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        () => { fetchRegistrations(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEvent]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .in('event_tag', [...activeEvent.tags])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
      calculateStats(data || [], activeEvent.price);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: TopgolfRegistration[], price: number) => {
    const stats = data.reduce((acc, reg) => {
      // Count all registrations except failed/canceled
      if (reg.payment_status !== 'failed' && reg.payment_status !== 'canceled') {
        acc.totalRegistrations++;
        acc.totalRevenue += reg.amount;

        const addon = reg.addon_donation ?? 0;
        const tickets = ticketsOn(reg, price);
        acc.donationRevenue += addon;
        acc.ticketRevenue += reg.ticket_amount ?? reg.amount - addon;
        if (addon > 0) acc.donorCount++;

        acc.totalPlayers += tickets;
        if (reg.event_tag === 'topgolf-adult') {
          acc.adultPlayers += tickets;
        } else {
          acc.youthPlayers += tickets;
        }
      }
      return acc;
    }, {
      totalRegistrations: 0,
      totalRevenue: 0,
      totalPlayers: 0,
      youthPlayers: 0,
      adultPlayers: 0,
      ticketRevenue: 0,
      donationRevenue: 0,
      donorCount: 0,
    });

    setStats(stats);
  };

  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const syncPayments = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/.netlify/functions/sync-topgolf-payments');
      const result = await response.json();

      if (result.updated > 0) {
        alert(`Synced ${result.updated} payment(s) to succeeded status.`);
        fetchRegistrations();
      } else if (result.total === 0) {
        alert('No pending payments to sync.');
      } else {
        alert(`Checked ${result.total} pending payments. ${result.stillPending} still pending, ${result.failed} failed.`);
      }
    } catch (error) {
      console.error('Error syncing payments:', error);
      alert('Failed to sync payments. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  const deleteRegistration = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this registration? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      console.log('Attempting to delete registration:', id);
      const { error, count } = await supabase
        .from('donations')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Delete successful, rows affected:', count);
      setSelectedRegistration(null);
      await fetchRegistrations();
      alert('Registration deleted successfully');
    } catch (error: any) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Name',
      'Email',
      'Phone',
      'Team',
      'Players',
      'Tickets',
      'Donation',
      'Total',
      'Status',
    ];

    const rows = filteredRegistrations.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      r.donor_name,
      r.donor_email,
      r.donor_phone || '',
      teamLabel(r.event_tag),
      ticketsOn(r, activeEvent.price),
      `$${(r.ticket_amount ?? r.amount - (r.addon_donation ?? 0)).toFixed(2)}`,
      `$${(r.addon_donation ?? 0).toFixed(2)}`,
      `$${r.amount.toFixed(2)}`,
      r.payment_status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeEvent.key}-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesTeam = filterTeam === 'all' ||
      teamLabel(reg.event_tag).toLowerCase() === filterTeam;

    const matchesSearch = !searchTerm ||
      reg.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.donor_email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTeam && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading registrations...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark-steel">Topgolf Registrations</h1>
            <p className="text-gray-500 text-sm mt-1">{activeEvent.label}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={syncPayments}
              disabled={syncing}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Payments'}
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition-colors"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Registrations</p>
                <p className="text-2xl font-bold text-dark-steel">{stats.totalRegistrations}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CheckCircle className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Players</p>
                <p className="text-2xl font-bold text-dark-steel">{stats.totalPlayers}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Users className="text-indigo-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-dark-steel">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {formatCurrency(stats.ticketRevenue)} tickets
                  {stats.donationRevenue > 0 &&
                    ` + ${formatCurrency(stats.donationRevenue)} donations`}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Youth Players</p>
                <p className="text-2xl font-bold text-dark-steel">{stats.youthPlayers}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <span className="text-2xl">🏒</span>
              </div>
            </div>
          </div>

          {activeEvent.key === CURRENT_EVENT_KEY ? (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Add-on Donations</p>
                  <p className="text-2xl font-bold text-dark-steel">
                    {formatCurrency(stats.donationRevenue)}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    from {stats.donorCount} of {stats.totalRegistrations} buyers
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Heart className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Adult Players</p>
                  <p className="text-2xl font-bold text-dark-steel">{stats.adultPlayers}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <span className="text-2xl">🛷</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              />
            </div>

            <select
              value={filterEvent}
              onChange={(e) => {
                setFilterEvent(e.target.value);
                setFilterTeam('all');
              }}
              aria-label="Event"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
            >
              {EVENTS.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.label}
                </option>
              ))}
            </select>

            {activeEvent.tags.length > 1 && (
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value as any)}
                aria-label="Team"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              >
                <option value="all">All Teams</option>
                <option value="youth">Youth Team</option>
                <option value="adult">Adult Team</option>
              </select>
            )}
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Players</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{reg.donor_name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reg.donor_email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        teamLabel(reg.event_tag) === 'Youth'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {teamLabel(reg.event_tag)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticketsOn(reg, activeEvent.price)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {reg.addon_donation ? (
                        <span className="font-semibold text-yellow-700">
                          {formatCurrency(reg.addon_donation)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(reg.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reg.payment_status === 'succeeded'
                          ? 'bg-green-100 text-green-800'
                          : reg.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {reg.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRegistration(reg)}
                        className="text-steel-blue hover:text-dark-steel mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteRegistration(reg.id)}
                        disabled={deleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete registration"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No registrations found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-dark-steel">Registration Details</h2>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{selectedRegistration.donor_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedRegistration.donor_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedRegistration.donor_phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Team</label>
                  <p className="text-gray-900">
                    {teamLabel(selectedRegistration.event_tag)} Team
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-gray-900 font-bold">{formatCurrency(selectedRegistration.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900 capitalize">{selectedRegistration.payment_status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Date</label>
                  <p className="text-gray-900">{new Date(selectedRegistration.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => deleteRegistration(selectedRegistration.id)}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      window.open(`mailto:${selectedRegistration.donor_email}?subject=Wings of Steel Topgolf Fundraiser`, '_blank');
                    }}
                    className="flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition-colors"
                  >
                    <Mail size={18} />
                    Email
                  </button>
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopgolfAdmin;
