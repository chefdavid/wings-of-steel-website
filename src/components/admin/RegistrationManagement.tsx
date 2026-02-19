import { useState, useEffect } from 'react';
import { Download, Search, Eye, X, RefreshCw, CheckCircle, Clock, XCircle, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Registration {
  id: string;
  player_name: string;
  date_of_birth: string;
  parent_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  diagnosis: string | null;
  experience_level: string;
  additional_info: string | null;
  emergency_contact: string;
  emergency_phone: string;
  how_heard: string | null;
  submitted_at: string;
  status: 'pending' | 'contacted' | 'scheduled' | 'active' | 'declined';
}

const experienceLabelMap: Record<string, string> = {
  beginner: 'No Experience / Beginner',
  some: 'Some Experience (1-2 years)',
  experienced: 'Experienced (3+ years)',
  sled: 'Previous Sled Hockey Experience',
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-800', icon: Phone },
  scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  active: { label: 'Active Player', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const RegistrationManagement = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_registrations')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('team_registrations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setRegistrations(prev =>
        prev.map(r => (r.id === id ? { ...r, status: newStatus as Registration['status'] } : r))
      );

      if (selectedRegistration?.id === id) {
        setSelectedRegistration(prev => prev ? { ...prev, status: newStatus as Registration['status'] } : null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch =
      !searchTerm ||
      r.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Submitted', 'Player Name', 'Age', 'Parent Name', 'Email', 'Phone', 'City', 'State', 'Experience', 'Diagnosis', 'Status', 'How Heard'];
    const rows = filteredRegistrations.map(r => [
      new Date(r.submitted_at).toLocaleDateString(),
      r.player_name,
      r.date_of_birth ? calculateAge(r.date_of_birth).toString() : '',
      r.parent_name,
      r.email,
      r.phone,
      r.city,
      r.state,
      experienceLabelMap[r.experience_level] || r.experience_level,
      r.diagnosis || '',
      r.status,
      r.how_heard || '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusCounts = registrations.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-steel-blue"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                filterStatus === key ? 'border-steel-blue shadow-md' : 'border-transparent'
              } bg-white`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">{config.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts[key] || 0}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by player, parent, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchRegistrations}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-white bg-steel-blue rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {registrations.length === 0 ? 'No registrations yet.' : 'No registrations match your filters.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Parent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Experience</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.map(reg => {
                const sc = statusConfig[reg.status] || statusConfig.pending;
                return (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(reg.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{reg.player_name}</div>
                      <div className="text-xs text-gray-500">
                        Age {reg.date_of_birth ? calculateAge(reg.date_of_birth) : '?'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{reg.parent_name}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-sm text-gray-600">{reg.email}</div>
                      <div className="text-xs text-gray-400">{reg.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                      {experienceLabelMap[reg.experience_level] || reg.experience_level}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedRegistration(reg)}
                          className="p-1.5 text-gray-500 hover:text-steel-blue hover:bg-blue-50 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`mailto:${reg.email}`}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Send email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <a
                          href={`tel:${reg.phone}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRegistration && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto"
          onClick={() => setSelectedRegistration(null)}
        >
          <div className="min-h-full flex items-center justify-center">
            <div
              className="bg-white rounded-2xl max-w-2xl w-full my-4 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-steel-blue to-blue-700 p-6 rounded-t-2xl text-white relative">
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">{selectedRegistration.player_name}</h2>
                <p className="text-white/80 mt-1">
                  Age {selectedRegistration.date_of_birth ? calculateAge(selectedRegistration.date_of_birth) : '?'} &bull;
                  Registered {new Date(selectedRegistration.submitted_at).toLocaleDateString()}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <button
                        key={key}
                        disabled={updating}
                        onClick={() => updateStatus(selectedRegistration.id, key)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedRegistration.status === key
                            ? config.color + ' ring-2 ring-offset-1 ring-steel-blue'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parent/Guardian */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Parent / Guardian</h3>
                    <p className="font-medium text-gray-900">{selectedRegistration.parent_name}</p>
                    <a href={`mailto:${selectedRegistration.email}`} className="text-sm text-steel-blue hover:underline flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" /> {selectedRegistration.email}
                    </a>
                    <a href={`tel:${selectedRegistration.phone}`} className="text-sm text-steel-blue hover:underline flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> {selectedRegistration.phone}
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Address</h3>
                    <p className="text-gray-900 flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>
                        {selectedRegistration.address}<br />
                        {selectedRegistration.city}, {selectedRegistration.state} {selectedRegistration.zip_code}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Player Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Experience</h3>
                    <p className="text-gray-900">
                      {experienceLabelMap[selectedRegistration.experience_level] || selectedRegistration.experience_level}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Date of Birth</h3>
                    <p className="text-gray-900">{selectedRegistration.date_of_birth}</p>
                  </div>
                </div>

                {selectedRegistration.diagnosis && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Diagnosis / Disability</h3>
                    <p className="text-gray-900">{selectedRegistration.diagnosis}</p>
                  </div>
                )}

                {/* Emergency Contact */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 uppercase mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Emergency Contact
                  </h3>
                  <p className="font-medium text-gray-900">{selectedRegistration.emergency_contact}</p>
                  <a href={`tel:${selectedRegistration.emergency_phone}`} className="text-sm text-steel-blue hover:underline">
                    {selectedRegistration.emergency_phone}
                  </a>
                </div>

                {/* Additional Info */}
                {(selectedRegistration.how_heard || selectedRegistration.additional_info) && (
                  <div>
                    {selectedRegistration.how_heard && (
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">How They Heard About Us</h3>
                        <p className="text-gray-900">{selectedRegistration.how_heard}</p>
                      </div>
                    )}
                    {selectedRegistration.additional_info && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Additional Notes</h3>
                        <p className="text-gray-900">{selectedRegistration.additional_info}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationManagement;
