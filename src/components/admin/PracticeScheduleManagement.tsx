import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Clock, MapPin, Calendar, X, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { PracticeSchedule } from '../../types/practice-schedule';
import { DAYS_OF_WEEK, TEAM_TYPES } from '../../types/practice-schedule';

const PracticeScheduleManagement = () => {
  const [schedules, setSchedules] = useState<PracticeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PracticeSchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'team' | 'location'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<Partial<PracticeSchedule>>({
    practice_date: new Date().toISOString().split('T')[0],
    day_of_week: 'Monday',
    day_order: 1,
    start_time: '18:00',
    end_time: '19:00',
    team_type: 'youth',
    location: 'Flyers Skate Zone',
    rink: 'Main Rink',
    description: '',
    is_active: true,
    season: 'Spring 2025',
    notes: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_schedules')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Sort data in JavaScript
      const sortedData = (data || []).sort((a, b) => {
        // First sort by date (practice_date or effective_from)
        const dateA = a.practice_date || a.effective_from || '';
        const dateB = b.practice_date || b.effective_from || '';
        if (dateA && dateB) {
          const dateCompare = dateA.localeCompare(dateB);
          if (dateCompare !== 0) return dateCompare;
        }
        // Then by day_order
        const dayCompare = (a.day_order || 0) - (b.day_order || 0);
        if (dayCompare !== 0) return dayCompare;
        // Finally by start_time
        return (a.start_time || '').localeCompare(b.start_time || '');
      });
      
      setSchedules(sortedData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      alert('Failed to load practice schedules. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule: PracticeSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      ...schedule,
      start_time: schedule.start_time.substring(0, 5), // Convert HH:MM:SS to HH:MM
      end_time: schedule.end_time.substring(0, 5)
    });
    setShowModal(true);
  };

  const handleDuplicate = (schedule: PracticeSchedule) => {
    const { id, created_at, updated_at, ...scheduleData } = schedule;
    setEditingSchedule(null);
    setFormData({
      ...scheduleData,
      practice_date: new Date().toISOString().split('T')[0], // Set today's date for duplicate
      start_time: schedule.start_time.substring(0, 5),
      end_time: schedule.end_time.substring(0, 5),
      description: `${schedule.description} (Copy)`
    });
    setShowModal(true);
    
    // Show copied feedback
    setCopiedId(schedule.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this practice session?')) return;

    try {
      const { error } = await supabase
        .from('practice_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete practice session');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...formData,
        start_time: `${formData.start_time}:00`, // Convert HH:MM to HH:MM:SS
        end_time: `${formData.end_time}:00`,
        day_order: DAYS_OF_WEEK.find(d => d.name === formData.day_of_week)?.order || 1,
        updated_at: new Date().toISOString()
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('practice_schedules')
          .update(dataToSave)
          .eq('id', editingSchedule.id);

        if (error) throw error;
        alert('Practice session updated successfully!');
      } else {
        const { error } = await supabase
          .from('practice_schedules')
          .insert([dataToSave]);

        if (error) throw error;
        alert('Practice session added successfully!');
      }

      setShowModal(false);
      setEditingSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      alert(`Failed to save practice session: ${error.message || 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      practice_date: new Date().toISOString().split('T')[0],
      day_of_week: 'Monday',
      day_order: 1,
      start_time: '18:00',
      end_time: '19:00',
      team_type: 'youth',
      location: 'Flyers Skate Zone',
      rink: 'Main Rink',
      description: '',
      is_active: true,
      season: 'Spring 2025',
      notes: ''
    });
  };

  const handleSort = (field: 'date' | 'time' | 'team' | 'location') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const dateA = a.practice_date || a.effective_from || '';
      const dateB = b.practice_date || b.effective_from || '';
      comparison = dateA.localeCompare(dateB) || a.start_time.localeCompare(b.start_time);
    } else if (sortBy === 'time') {
      comparison = a.start_time.localeCompare(b.start_time);
    } else if (sortBy === 'team') {
      comparison = (a.team_type || '').localeCompare(b.team_type || '');
    } else if (sortBy === 'location') {
      comparison = (a.location || '').localeCompare(b.location || '') || (a.rink || '').localeCompare(b.rink || '');
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const filteredSchedules = selectedDay === 'all' 
    ? sortedSchedules 
    : sortedSchedules.filter(s => s.day_of_week === selectedDay);

  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week]) {
      acc[schedule.day_of_week] = [];
    }
    acc[schedule.day_of_week].push(schedule);
    return acc;
  }, {} as Record<string, PracticeSchedule[]>);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Practice Schedule Management</h2>
        <p className="text-gray-600">Manage weekly practice sessions for all teams and divisions</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
              >
                <option value="all">All Days</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.name} value={day.name}>{day.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setEditingSchedule(null);
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Practice Session
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-steel-blue to-dark-steel text-white p-4">
            <h3 className="text-lg font-bold">Practice Sessions ({filteredSchedules.length})</h3>
          </div>
          
          {/* Table-like structure */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortBy === 'date' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'date' && <ArrowUpDown className="w-3 h-3 text-gray-400" />}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('time')}
                  >
                    <div className="flex items-center gap-1">
                      Time
                      {sortBy === 'time' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'time' && <ArrowUpDown className="w-3 h-3 text-gray-400" />}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('team')}
                  >
                    <div className="flex items-center gap-1">
                      Team/Division
                      {sortBy === 'team' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'team' && <ArrowUpDown className="w-3 h-3 text-gray-400" />}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-1">
                      Location
                      {sortBy === 'location' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'location' && <ArrowUpDown className="w-3 h-3 text-gray-400" />}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr 
                    key={schedule.id} 
                    className={`hover:bg-gray-50 transition-colors ${!schedule.is_active ? 'opacity-50' : ''}`}
                  >
                    {/* Date Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.practice_date ? formatDate(schedule.practice_date) : 
                           schedule.effective_from ? formatDate(schedule.effective_from) :
                           (
                            <span className="text-yellow-600 italic">Click edit to set date</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{schedule.day_of_week}</div>
                      </div>
                    </td>
                    
                    {/* Time Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </div>
                    </td>
                    
                    {/* Team/Division Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {schedule.team_type && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {TEAM_TYPES.find(t => t.value === schedule.team_type)?.label || schedule.team_type}
                          </span>
                        )}
                        {!schedule.is_active && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Location Column */}
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm text-gray-900">{schedule.location}</div>
                        <div className="text-xs text-gray-500">{schedule.rink}</div>
                      </div>
                    </td>
                    
                    {/* Details Column */}
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {schedule.description && (
                          <p className="text-gray-700">{schedule.description}</p>
                        )}
                        {schedule.season && (
                          <p className="text-xs text-gray-500 mt-1">Season: {schedule.season}</p>
                        )}
                        {schedule.notes && (
                          <p className="text-xs text-gray-500 italic mt-1">{schedule.notes}</p>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleDuplicate(schedule)}
                          className={`text-green-600 hover:text-green-800 transition-colors ${
                            copiedId === schedule.id ? 'text-green-800' : ''
                          }`}
                          title="Duplicate"
                        >
                          {copiedId === schedule.id ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSchedules.length === 0 && (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No practice sessions scheduled</p>
              <button
                onClick={() => {
                  setEditingSchedule(null);
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-4 text-steel-blue hover:text-dark-steel font-medium"
              >
                Add your first practice session
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {editingSchedule ? 'Edit Practice Session' : 'Add Practice Session'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Practice Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.practice_date || ''}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value + 'T00:00:00');
                      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
                      const dayOrder = dayOfWeek === 'Sunday' ? 7 : selectedDate.getDay();
                      setFormData({ 
                        ...formData, 
                        practice_date: e.target.value,
                        day_of_week: dayOfWeek,
                        day_order: dayOrder
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team/Division *
                  </label>
                  <select
                    required
                    value={formData.team_type}
                    onChange={(e) => setFormData({ ...formData, team_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                  >
                    {TEAM_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                    placeholder="e.g., Flyers Skate Zone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rink
                  </label>
                  <input
                    type="text"
                    value={formData.rink || ''}
                    onChange={(e) => setFormData({ ...formData, rink: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                    placeholder="e.g., Main Rink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Season
                  </label>
                  <input
                    type="text"
                    value={formData.season || ''}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                    placeholder="e.g., Spring 2025"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active Session
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                    placeholder="e.g., Skills Development, Game Strategies, Scrimmage"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue"
                    placeholder="Any additional information..."
                  />
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
                  {editingSchedule ? 'Update Session' : 'Add Session'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PracticeScheduleManagement;