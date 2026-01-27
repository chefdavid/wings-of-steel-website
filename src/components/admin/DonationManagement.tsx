import { useState, useEffect } from 'react';
import { useDonations } from '../../hooks/useDonations';
import { Download, Search, Filter, Mail, X, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const DonationManagement = () => {
  const [filterType, setFilterType] = useState<'all' | 'one-time' | 'recurring'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'succeeded' | 'failed'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'month' | 'year'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  const { donations, statistics, loading, refetch } = useDonations({
    type: filterType === 'all' ? undefined : filterType,
    status: filterStatus === 'all' ? undefined : filterStatus,
    dateRange: filterDateRange === 'all' ? undefined : filterDateRange,
    search: searchTerm || undefined,
  });

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Donor Name',
      'Email',
      'Phone',
      'Company',
      'Amount',
      'Type',
      'Player Name',
      'Anonymous',
      'Status',
      'Payment Intent ID',
      'Subscription ID'
    ];

    const rows = donations.map(d => [
      new Date(d.created_at).toLocaleDateString(),
      d.donor_name,
      d.donor_email,
      d.donor_phone || '',
      d.company_name || '',
      `$${d.amount.toFixed(2)}`,
      d.donation_type,
      d.player_name || '',
      d.is_anonymous ? 'Yes' : 'No',
      d.payment_status,
      d.stripe_payment_intent_id,
      d.stripe_subscription_id || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading && !donations.length) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading donations...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-dark-steel">Donation Management</h1>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition-colors"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Raised</p>
                  <p className="text-2xl font-bold text-dark-steel">{formatCurrency(statistics.total_raised)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Donations</p>
                  <p className="text-2xl font-bold text-dark-steel">{statistics.total_donations}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <CheckCircle className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Unique Donors</p>
                  <p className="text-2xl font-bold text-dark-steel">{statistics.unique_donors}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <CheckCircle className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Average Donation</p>
                  <p className="text-2xl font-bold text-dark-steel">{formatCurrency(statistics.average_donation)}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <CheckCircle className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Recurring</p>
                  <p className="text-2xl font-bold text-dark-steel">{statistics.recurring_count}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(statistics.recurring_total)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">One-Time</p>
                  <p className="text-2xl font-bold text-dark-steel">{statistics.one_time_count}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(statistics.one_time_total)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Company Donations</p>
                  <p className="text-2xl font-bold text-dark-steel">{statistics.company_donations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Player Honors</p>
                  <p className="text-2xl font-bold text-dark-steel">{statistics.player_honor_donations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="one-time">One-Time</option>
              <option value="recurring">Recurring</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                        </div>
                        <div className="text-sm text-gray-500">{donation.donor_email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {donation.company_name || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        donation.donation_type === 'recurring'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {donation.donation_type === 'recurring' ? 'Recurring' : 'One-Time'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {donation.player_name || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        donation.payment_status === 'succeeded'
                          ? 'bg-green-100 text-green-800'
                          : donation.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {donation.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="text-steel-blue hover:text-dark-steel mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {donations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No donations found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-dark-steel">Donation Details</h2>
              <button
                onClick={() => setSelectedDonation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Donor Name</label>
                  <p className="text-gray-900">{selectedDonation.is_anonymous ? 'Anonymous' : selectedDonation.donor_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedDonation.donor_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedDonation.donor_phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-gray-900">{selectedDonation.company_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-gray-900 font-bold">{formatCurrency(selectedDonation.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-gray-900 capitalize">{selectedDonation.donation_type}</p>
                </div>
                {selectedDonation.player_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">In Honor Of</label>
                    <p className="text-gray-900">{selectedDonation.player_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900 capitalize">{selectedDonation.payment_status}</p>
                </div>
              </div>

              {selectedDonation.message && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedDonation.message}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Payment Intent ID</label>
                <p className="text-gray-900 font-mono text-xs">{selectedDonation.stripe_payment_intent_id}</p>
              </div>

              {selectedDonation.stripe_subscription_id && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Subscription ID</label>
                  <p className="text-gray-900 font-mono text-xs">{selectedDonation.stripe_subscription_id}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    window.open(`mailto:${selectedDonation.donor_email}?subject=Thank you for your donation to Wings of Steel`, '_blank');
                  }}
                  className="flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition-colors"
                >
                  <Mail size={18} />
                  Send Email
                </button>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationManagement;



