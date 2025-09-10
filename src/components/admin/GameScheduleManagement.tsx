import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaHome, FaPlane, FaSort, FaSortUp, FaSortDown, FaCalendar, FaUpload } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import type { Game } from '../../types/database';
import ScheduleBulkImport from './ScheduleBulkImport';

const GameScheduleManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'opponent' | 'location'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    game_date: '',
    game_time: '',
    opponent: '',
    location: '',
    home_away: 'home' as 'home' | 'away',
    notes: '',
    status: 'Scheduled' as Game['status']
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('game_schedules')
        .select('*')
        .order('game_date', { ascending: true })
        .order('game_time', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Extract date and time from the datetime-local input
      const [dateStr, timeStr] = formData.game_date.split('T');
      
      const gameData = {
        game_date: dateStr,
        game_time: timeStr || formData.game_time,
        opponent: formData.opponent,
        location: formData.location,
        home_away: formData.home_away,
        notes: formData.notes || null,
        status: formData.status
      };

      if (editingGame) {
        console.log('🚀 Updating game:', editingGame.id, gameData);
        const { data, error } = await supabase
          .from('game_schedules')
          .update(gameData)
          .eq('id', editingGame.id)
          .select();
        
        console.log('✅ Update result:', { data, error });
        if (error) throw error;
      } else {
        console.log('🚀 Inserting new game:', gameData);
        const { data, error } = await supabase
          .from('game_schedules')
          .insert([gameData])
          .select();
        
        console.log('✅ Insert result:', { data, error });
        if (error) throw error;
      }

      await fetchGames();
      handleCancel();
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    // Combine date and time for the datetime-local input
    const dateTimeStr = game.game_date && game.game_time 
      ? `${game.game_date}T${game.game_time}`
      : game.date 
        ? new Date(game.date).toISOString().slice(0, 16)
        : '';
    
    setFormData({
      game_date: dateTimeStr,
      game_time: game.game_time || '',
      opponent: game.opponent || '',
      location: game.location || '',
      home_away: game.home_away || 'away',
      notes: game.notes || '',
      status: game.status || 'Scheduled'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        const { error } = await supabase
          .from('game_schedules')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        await fetchGames();
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGame(null);
    setFormData({
      game_date: '',
      game_time: '',
      opponent: '',
      location: '',
      home_away: 'home' as 'home' | 'away',
      notes: '',
      status: 'Scheduled' as Game['status']
    });
  };

  const formatDate = (game: Game) => {
    // Handle new format with separate date and time
    if (game.game_date && game.game_time) {
      const date = new Date(game.game_date + 'T' + game.game_time);
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };
    }
    // Fallback for legacy format
    else if (game.date) {
      const date = new Date(game.date);
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };
    }
    return { date: '', time: '' };
  };

  const handleSort = (field: 'date' | 'opponent' | 'location') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortedGames = [...games].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const dateA = a.date || a.game_date || '';
      const dateB = b.date || b.game_date || '';
      comparison = dateA.localeCompare(dateB);
    } else if (sortBy === 'opponent') {
      comparison = (a.opponent || '').localeCompare(b.opponent || '');
    } else if (sortBy === 'location') {
      comparison = (a.location || '').localeCompare(b.location || '');
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return <div className="animate-pulse">Loading schedule...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Game Schedule Management</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaUpload />
            Bulk Import
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-steel-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <FaPlus />
            Add Game
          </motion.button>
        </div>
      </div>

      {/* Bulk Import Section */}
      {showBulkImport && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ScheduleBulkImport />
        </motion.div>
      )}

      {/* Sorting Controls */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm text-gray-600 mr-2">Sort by:</span>
          <button
            onClick={() => handleSort('date')}
            className={`flex items-center gap-1 px-3 py-1 border rounded-lg hover:bg-gray-50 transition-colors text-sm ${
              sortBy === 'date' ? 'border-steel-blue text-steel-blue bg-blue-50' : 'border-gray-300'
            }`}
          >
            <FaCalendar className="text-xs" />
            Date
            {sortBy === 'date' && (
              sortDirection === 'asc' ? <FaSortUp className="text-xs" /> : <FaSortDown className="text-xs" />
            )}
            {sortBy !== 'date' && <FaSort className="text-xs text-gray-400" />}
          </button>
          <button
            onClick={() => handleSort('opponent')}
            className={`flex items-center gap-1 px-3 py-1 border rounded-lg hover:bg-gray-50 transition-colors text-sm ${
              sortBy === 'opponent' ? 'border-steel-blue text-steel-blue bg-blue-50' : 'border-gray-300'
            }`}
          >
            Opponent
            {sortBy === 'opponent' && (
              sortDirection === 'asc' ? <FaSortUp className="text-xs" /> : <FaSortDown className="text-xs" />
            )}
            {sortBy !== 'opponent' && <FaSort className="text-xs text-gray-400" />}
          </button>
          <button
            onClick={() => handleSort('location')}
            className={`flex items-center gap-1 px-3 py-1 border rounded-lg hover:bg-gray-50 transition-colors text-sm ${
              sortBy === 'location' ? 'border-steel-blue text-steel-blue bg-blue-50' : 'border-gray-300'
            }`}
          >
            Location
            {sortBy === 'location' && (
              sortDirection === 'asc' ? <FaSortUp className="text-xs" /> : <FaSortDown className="text-xs" />
            )}
            {sortBy !== 'location' && <FaSort className="text-xs text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedGames.map((game) => {
                const { date, time } = formatDate(game);
                
                return (
                  <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                    {/* Date Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {date}
                      </div>
                    </td>
                    
                    {/* Time Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {time}
                      </div>
                    </td>
                    
                    {/* Opponent Column */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {game.opponent}
                      </div>
                      {game.notes && (
                        <div className="text-xs text-yellow-700 mt-1">
                          {game.notes}
                        </div>
                      )}
                    </td>
                    
                    {/* Location Column */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {game.location}
                      </div>
                    </td>
                    
                    {/* Type Column */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        game.home_away === 'home' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {game.home_away === 'home' ? (
                          <>
                            <FaHome className="text-xs" />
                            HOME
                          </>
                        ) : (
                          <>
                            <FaPlane className="text-xs" />
                            AWAY
                          </>
                        )}
                      </span>
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        game.status === 'Complete' ? 'bg-green-100 text-green-800' :
                        game.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {game.status || 'Scheduled'}
                      </span>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(game)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(game.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sortedGames.length === 0 && (
          <div className="p-8 text-center">
            <FaCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No games scheduled</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">
                    {editingGame ? 'Edit Game' : 'Add New Game'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.game_date}
                      onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opponent
                    </label>
                    <input
                      type="text"
                      value={formData.opponent}
                      onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      placeholder="e.g., Chicago Hornets"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      placeholder="e.g., Wings Arena, Detroit MI"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Game Type
                    </label>
                    <select
                      value={formData.home_away}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        home_away: e.target.value as 'home' | 'away'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    >
                      <option value="home">Home Game</option>
                      <option value="away">Away Game</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Game['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Complete">Complete</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="e.g., Championship game, Special event"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-steel-blue text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    {editingGame ? 'Update Game' : 'Add Game'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameScheduleManagement;