import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaHome, FaPlane } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { Game } from '../../types/database';

const GameScheduleManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    opponent: '',
    location: '',
    home_game: true,
    notes: '',
    status: 'Scheduled' as Game['status']
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('game_schedule')
        .select('*')
        .order('date', { ascending: true });

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
      const gameData = {
        date: formData.date,
        opponent: formData.opponent,
        location: formData.location,
        home_game: formData.home_game,
        notes: formData.notes || null,
        status: formData.status
      };

      if (editingGame) {
        console.log('🚀 Updating game:', editingGame.id, gameData);
        const { data, error } = await supabaseAdmin
          .from('game_schedule')
          .update(gameData)
          .eq('id', editingGame.id)
          .select();
        
        console.log('✅ Update result:', { data, error });
        if (error) throw error;
      } else {
        console.log('🚀 Inserting new game:', gameData);
        const { data, error } = await supabaseAdmin
          .from('game_schedule')
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
    setFormData({
      date: game.date ? new Date(game.date).toISOString().slice(0, 16) : '',
      opponent: game.opponent || '',
      location: game.location || '',
      home_game: game.home_game || false,
      notes: game.notes || '',
      status: game.status || 'Scheduled'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        const { error } = await supabaseAdmin
          .from('game_schedule')
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
      date: '',
      opponent: '',
      location: '',
      home_game: true,
      notes: '',
      status: 'Scheduled' as Game['status']
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
  };

  if (loading) {
    return <div className="animate-pulse">Loading schedule...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Game Schedule Management</h3>
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

      {/* Games List */}
      <div className="space-y-4">
        {games.map((game) => {
          const { date, time } = formatDate(game.date || '');
          const isUpcoming = game.date ? new Date(game.date) > new Date() : false;
          
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isUpcoming ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {game.home_game ? (
                      <FaHome className={`text-xl ${isUpcoming ? 'text-green-600' : 'text-gray-600'}`} />
                    ) : (
                      <FaPlane className={`text-xl ${isUpcoming ? 'text-blue-600' : 'text-gray-600'}`} />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      Wings of Steel vs {game.opponent}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{date} at {time}</span>
                      <span>•</span>
                      <span>{game.location}</span>
                      <span>•</span>
                      <span className={`font-medium ${
                        game.home_game ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {game.home_game ? 'HOME' : 'AWAY'}
                      </span>
                    </div>
                    {game.notes && (
                      <p className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-2 inline-block">
                        {game.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    game.status === 'Complete' ? 'bg-green-100 text-green-800' :
                    game.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {game.status}
                  </span>
                  
                  <button
                    onClick={() => handleEdit(game)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <FaEdit />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
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
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                      value={formData.home_game ? 'home' : 'away'}
                      onChange={(e) => setFormData({ ...formData, home_game: e.target.value === 'home' })}
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