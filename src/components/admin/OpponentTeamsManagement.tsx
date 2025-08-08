import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Globe, Mail, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { OpponentTeam } from '../../types/opponent-team';

const OpponentTeamsManagement = () => {
  const [teams, setTeams] = useState<OpponentTeam[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<OpponentTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<OpponentTeam | null>(null);
  const [formData, setFormData] = useState<Partial<OpponentTeam>>({
    team_name: '',
    short_name: '',
    rink_name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    email: '',
    phone: '',
    facebook: '',
    head_coach: '',
    assistant_coaches: [],
    manager: '',
    president: '',
    founder: '',
    founded_year: undefined,
    age_range: '',
    program_type: 'youth',
    notes: '',
    is_free_program: false,
    sponsor: '',
    primary_color: '#1E3A8A',
    secondary_color: '#DC2626'
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const filtered = teams.filter(team =>
      team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.state?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(filtered);
  }, [teams, searchTerm]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('opponent_teams')
        .select('*')
        .order('team_name');

      if (error) throw error;
      setTeams(data || []);
      setFilteredTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: OpponentTeam) => {
    setEditingTeam(team);
    setFormData({
      ...team,
      assistant_coaches: team.assistant_coaches || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const { error } = await supabase
        .from('opponent_teams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...formData,
        founded_year: formData.founded_year ? parseInt(formData.founded_year.toString()) : null,
        assistant_coaches: formData.assistant_coaches || [],
        updated_at: new Date().toISOString()
      };

      console.log('Saving team data:', dataToSave);

      if (editingTeam) {
        const { data, error } = await supabase
          .from('opponent_teams')
          .update(dataToSave)
          .eq('id', editingTeam.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Team updated successfully:', data);
        alert('Team updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('opponent_teams')
          .insert([dataToSave])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Team added successfully:', data);
        alert('Team added successfully!');
      }

      setShowModal(false);
      setEditingTeam(null);
      setFormData({
        team_name: '',
        short_name: '',
        rink_name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        website: '',
        email: '',
        phone: '',
        facebook: '',
        head_coach: '',
        assistant_coaches: [],
        manager: '',
        president: '',
        founder: '',
        founded_year: undefined,
        age_range: '',
        program_type: 'youth',
        notes: '',
        is_free_program: false,
        sponsor: '',
        primary_color: '#1E3A8A',
        secondary_color: '#DC2626'
      });
      
      // Refresh the teams list
      await fetchTeams();
    } catch (error: any) {
      console.error('Error saving team:', error);
      alert(`Failed to save team: ${error.message || 'Unknown error'}`);
    }
  };

  const handleAddAssistantCoach = () => {
    const coach = prompt('Enter assistant coach name:');
    if (coach) {
      setFormData({
        ...formData,
        assistant_coaches: [...(formData.assistant_coaches || []), coach]
      });
    }
  };

  const handleRemoveAssistantCoach = (index: number) => {
    const coaches = [...(formData.assistant_coaches || [])];
    coaches.splice(index, 1);
    setFormData({
      ...formData,
      assistant_coaches: coaches
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Opponent Teams Management</h2>
        <p className="text-gray-600">Manage teams that compete against Wings of Steel</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setEditingTeam(null);
              setFormData({
                team_name: '',
                short_name: '',
                rink_name: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                website: '',
                email: '',
                phone: '',
                facebook: '',
                head_coach: '',
                assistant_coaches: [],
                manager: '',
                president: '',
                founder: '',
                founded_year: undefined,
                age_range: '',
                program_type: 'youth',
                notes: '',
                is_free_program: false,
                sponsor: '',
                primary_color: '#1E3A8A',
                secondary_color: '#DC2626'
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Team
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{team.team_name}</div>
                        {team.short_name && (
                          <div className="text-sm text-gray-500">{team.short_name}</div>
                        )}
                        {team.is_free_program && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                            FREE PROGRAM
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {team.rink_name && (
                          <div className="text-gray-900">{team.rink_name}</div>
                        )}
                        {team.city && team.state && (
                          <div className="text-gray-500">{team.city}, {team.state}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="capitalize">{team.program_type || 'N/A'}</span>
                        {team.age_range && (
                          <div className="text-gray-500">Ages {team.age_range}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {team.website && (
                          <a href={team.website.startsWith('http') ? team.website : `https://${team.website}`} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-steel-blue hover:text-dark-steel">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        {team.email && (
                          <a href={`mailto:${team.email}`} 
                             className="text-steel-blue hover:text-dark-steel">
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {team.phone && (
                          <a href={`tel:${team.phone}`} 
                             className="text-steel-blue hover:text-dark-steel">
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(team)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(team.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {editingTeam ? 'Edit Team' : 'Add New Team'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Basic Information</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.team_name}
                        onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Short Name
                      </label>
                      <input
                        type="text"
                        value={formData.short_name || ''}
                        onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Program Type
                      </label>
                      <select
                        value={formData.program_type || 'youth'}
                        onChange={(e) => setFormData({ ...formData, program_type: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      >
                        <option value="youth">Youth</option>
                        <option value="adult">Adult</option>
                        <option value="full">Full Program</option>
                        <option value="special">Special</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 5-18"
                        value={formData.age_range || ''}
                        onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Founded Year
                      </label>
                      <input
                        type="number"
                        value={formData.founded_year || ''}
                        onChange={(e) => setFormData({ ...formData, founded_year: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_free_program"
                        checked={formData.is_free_program || false}
                        onChange={(e) => setFormData({ ...formData, is_free_program: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="is_free_program" className="text-sm font-medium text-gray-700">
                        Free Program
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sponsor
                      </label>
                      <input
                        type="text"
                        value={formData.sponsor || ''}
                        onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Location & Contact</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rink Name
                      </label>
                      <input
                        type="text"
                        value={formData.rink_name || ''}
                        onChange={(e) => setFormData({ ...formData, rink_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          value={formData.state || ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="text"
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={formData.facebook || ''}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Leadership</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Head Coach
                      </label>
                      <input
                        type="text"
                        value={formData.head_coach || ''}
                        onChange={(e) => setFormData({ ...formData, head_coach: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assistant Coaches
                      </label>
                      <div className="space-y-2">
                        {(formData.assistant_coaches || []).map((coach, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={coach}
                              readOnly
                              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAssistantCoach(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddAssistantCoach}
                          className="text-steel-blue hover:text-dark-steel text-sm"
                        >
                          + Add Assistant Coach
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manager
                      </label>
                      <input
                        type="text"
                        value={formData.manager || ''}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        President
                      </label>
                      <input
                        type="text"
                        value={formData.president || ''}
                        onChange={(e) => setFormData({ ...formData, president: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Founder
                      </label>
                      <input
                        type="text"
                        value={formData.founder || ''}
                        onChange={(e) => setFormData({ ...formData, founder: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Appearance</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={formData.primary_color || '#1E3A8A'}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="w-full h-10 px-1 py-1 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color
                      </label>
                      <input
                        type="color"
                        value={formData.secondary_color || '#DC2626'}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        className="w-full h-10 px-1 py-1 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-steel-blue text-white rounded-lg hover:bg-dark-steel"
                >
                  {editingTeam ? 'Update Team' : 'Add Team'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OpponentTeamsManagement;