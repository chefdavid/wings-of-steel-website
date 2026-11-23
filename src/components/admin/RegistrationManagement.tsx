import { useState, useEffect } from 'react';
import { Download, Search, Eye, X, RefreshCw, CheckCircle, Clock, XCircle, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { insertAdminPlayer } from '../../services/adminPlayersService';

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

type TeamType = 'youth' | 'adult';

interface RosterForm {
  startDate: string;
  jerseyNumber: string;
  position: string;
  teamType: TeamType;
}

interface RosterNumber {
  first_name: string;
  last_name: string;
  team_type: TeamType;
  team_jersey_number: number | null;
}

// Local calendar date, not UTC: toISOString() rolls over to tomorrow in the evening.
const todayLocal = () => new Date().toLocaleDateString('en-CA');

const emptyRosterForm = (): RosterForm => ({
  startDate: todayLocal(),
  jerseyNumber: '',
  position: '',
  teamType: 'youth',
});

const RegistrationManagement = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmingActive, setConfirmingActive] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rosterForm, setRosterForm] = useState<RosterForm>(emptyRosterForm);
  const [rosterNumbers, setRosterNumbers] = useState<RosterNumber[]>([]);

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

  const addPlayerToRoster = async (reg: Registration, form: RosterForm) => {
    const jerseyNumber = form.jerseyNumber === '' ? 0 : parseInt(form.jerseyNumber, 10);
    const position = form.position || 'TBD';

    // Split player name into first/last
    const nameParts = reg.player_name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Calculate age from DOB
    const birth = new Date(reg.date_of_birth);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;

    const playerPayload = {
      first_name: firstName,
      last_name: lastName,
      name: reg.player_name,
      age,
      birthdate: reg.date_of_birth,
      start_date: form.startDate || todayLocal(),
      position,
      bio: '',
      image_url: '',
      jersey_number: jerseyNumber,
      tags: [],
      active: true,
      contacts: [{
        type: 'parent',
        name: reg.parent_name,
        phone: reg.phone,
        email: reg.email,
        address: {
          street: reg.address,
          city: reg.city,
          state: reg.state,
          zip: reg.zip_code,
        },
        relationship: 'Parent/Guardian',
        primary: true,
      }],
      emergency_contact: {
        name: reg.emergency_contact,
        phone: reg.emergency_phone,
        relationship: 'Emergency Contact',
      },
      player_notes: [
        reg.diagnosis ? `Diagnosis: ${reg.diagnosis}` : '',
        `Experience: ${experienceLabelMap[reg.experience_level] || reg.experience_level}`,
        reg.additional_info ? `Notes: ${reg.additional_info}` : '',
        reg.how_heard ? `How heard: ${reg.how_heard}` : '',
      ].filter(Boolean).join('\n'),
    };

    const { player, warning } = await insertAdminPlayer(playerPayload, {
      jersey_number: jerseyNumber,
      position,
      tags: [],
      team_type: form.teamType,
    });

    if (warning) {
      console.warn('Registration roster warning:', warning);
    }

    return player;
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const reg = registrations.find(r => r.id === id);

    // Already on the roster: clicking Active Player again must not add a second copy.
    if (newStatus === 'active' && reg?.status === 'active') return;

    // If marking as active, collect the roster details first
    if (newStatus === 'active' && reg) {
      setRosterForm(emptyRosterForm());
      setSuccessMessage(null);
      setConfirmingActive(id);
      const { data } = await supabase
        .from('player_team_details')
        .select('first_name,last_name,team_type,team_jersey_number');
      setRosterNumbers((data as RosterNumber[] | null) || []);
      return;
    }

    await performStatusUpdate(id, newStatus);
  };

  const performStatusUpdate = async (id: string, newStatus: string) => {
    const reg = registrations.find(r => r.id === id);
    setUpdating(true);
    setSuccessMessage(null);
    try {
      // If activating, create the player first
      if (newStatus === 'active' && reg) {
        await addPlayerToRoster(reg, rosterForm);
      }

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

      setConfirmingActive(null);

      if (newStatus === 'active') {
        setSuccessMessage(`${reg!.player_name} is on the team roster. Add a photo and bio in Team Roster.`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setSuccessMessage('Failed to update status. ' + (err instanceof Error ? err.message : ''));
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

  // Who already wears the number typed into the roster form, on the chosen team.
  const numberHolder = rosterForm.jerseyNumber === ''
    ? undefined
    : rosterNumbers.find(
        n => n.team_type === rosterForm.teamType &&
          n.team_jersey_number === parseInt(rosterForm.jerseyNumber, 10) &&
          n.team_jersey_number !== 0
      );
  const fieldClass = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none';

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
                      <div className="text-xs text-gray-600">{reg.phone}</div>
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
          onClick={() => { setSelectedRegistration(null); setConfirmingActive(null); setSuccessMessage(null); }}
        >
          <div className="min-h-full flex items-center justify-center">
            <div
              className="bg-white rounded-2xl max-w-2xl w-full my-4 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-steel-blue to-blue-700 p-6 rounded-t-2xl text-white relative">
                <button
                  onClick={() => { setSelectedRegistration(null); setConfirmingActive(null); setSuccessMessage(null); }}
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

                  {/* Roster details for Active Player */}
                  {confirmingActive === selectedRegistration.id && (
                    <form
                      className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                      onSubmit={e => { e.preventDefault(); if (!numberHolder) performStatusUpdate(selectedRegistration.id, 'active'); }}
                    >
                      <p className="text-sm text-green-800 font-medium mb-3">
                        Add {selectedRegistration.player_name} to the team roster
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="roster-start" className="block text-xs font-medium text-gray-700 mb-1">Started with the team</label>
                          <input
                            id="roster-start"
                            type="date"
                            required
                            max={todayLocal()}
                            value={rosterForm.startDate}
                            onChange={e => setRosterForm({ ...rosterForm, startDate: e.target.value })}
                            className={fieldClass}
                          />
                        </div>
                        <div>
                          <label htmlFor="roster-number" className="block text-xs font-medium text-gray-700 mb-1">Player number</label>
                          <input
                            id="roster-number"
                            type="number"
                            min={1}
                            max={99}
                            placeholder="Leave blank if not assigned"
                            value={rosterForm.jerseyNumber}
                            onChange={e => setRosterForm({ ...rosterForm, jerseyNumber: e.target.value })}
                            className={fieldClass}
                          />
                        </div>
                        <div>
                          <label htmlFor="roster-position" className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                          <select
                            id="roster-position"
                            value={rosterForm.position}
                            onChange={e => setRosterForm({ ...rosterForm, position: e.target.value })}
                            className={fieldClass}
                          >
                            <option value="">Not decided yet</option>
                            <option value="Offense">Offense</option>
                            <option value="Defense">Defense</option>
                            <option value="Goalie">Goalie</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="roster-team" className="block text-xs font-medium text-gray-700 mb-1">Team</label>
                          <select
                            id="roster-team"
                            value={rosterForm.teamType}
                            onChange={e => setRosterForm({ ...rosterForm, teamType: e.target.value as TeamType })}
                            className={fieldClass}
                          >
                            <option value="youth">Youth</option>
                            <option value="adult">Adult</option>
                          </select>
                        </div>
                      </div>
                      {numberHolder && (
                        <p className="mt-2 text-xs text-red-700">
                          #{rosterForm.jerseyNumber} is already worn by {numberHolder.first_name} {numberHolder.last_name} on the {rosterForm.teamType} team. Pick another number or leave it blank.
                        </p>
                      )}
                      <p className="mt-2 text-xs text-green-700">
                        Name, birthdate, parent and emergency contacts and notes copy over from this registration.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="submit"
                          disabled={updating || !!numberHolder}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {updating ? 'Adding...' : 'Add to Roster'}
                        </button>
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => setConfirmingActive(null)}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Success/Error message */}
                  {successMessage && (
                    <div className={`mt-3 p-3 rounded-lg text-sm flex items-center justify-between ${
                      successMessage.startsWith('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      <span>{successMessage}</span>
                      <button onClick={() => setSuccessMessage(null)} className="ml-2 text-current opacity-60 hover:opacity-100">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
