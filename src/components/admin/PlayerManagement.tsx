import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { Player } from '../../types/database';
import ImageUpload from './ImageUpload';
import LayoutToggle, { type LayoutType } from './LayoutToggle';

const PlayerManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    position: '',
    bio: '',
    image_url: '',
    jersey_number: '',
    tags: ['']
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      console.log('🔄 Fetching players with tags...');
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('jersey_number', { ascending: true });

      if (error) throw error;
      console.log('📊 Fetched players:', data?.length || 0);
      console.log('🏷️ Players with tags:', data?.filter(p => p.tags && p.tags.length > 0).length || 0);
      setPlayers(data || []);
    } catch (error) {
      console.error('❌ Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted', { editingPlayer, formData });
    
    try {
      const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
      const playerData = {
        name: formData.name,
        age: parseInt(formData.age),
        position: formData.position,
        bio: formData.bio,
        image_url: formData.image_url || '',
        jersey_number: parseInt(formData.jersey_number),
        tags: filteredTags
      };

      console.log('🎯 Player data to save:', playerData);
      console.log('🏷️ Filtered tags:', filteredTags);

      if (editingPlayer) {
        console.log('📝 Updating player with ID:', editingPlayer.id);
        const { data, error } = await supabaseAdmin
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id)
          .select();
        
        console.log('✅ Update result:', { data, error });
        if (error) {
          console.error('❌ Update error details:', error);
          throw error;
        }
        console.log('🎉 Player updated successfully:', data);
      } else {
        console.log('📝 Inserting new player');
        const { data, error } = await supabaseAdmin
          .from('players')
          .insert([playerData])
          .select();
        
        console.log('✅ Insert result:', { data, error });
        if (error) throw error;
      }

      console.log('Fetching updated players list');
      await fetchPlayers();
      handleCancel();
      console.log('Player save completed successfully');
    } catch (error) {
      console.error('Error saving player:', error);
      alert(`Error saving player: ${(error as Error).message}`);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      age: player.age.toString(),
      position: player.position,
      bio: player.bio,
      image_url: player.image_url || '',
      jersey_number: player.jersey_number.toString(),
      tags: player.tags && player.tags.length > 0 ? player.tags : ['']
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        const { error } = await supabaseAdmin
          .from('players')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        await fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlayer(null);
    setFormData({
      name: '',
      age: '',
      position: '',
      bio: '',
      image_url: '',
      jersey_number: '',
      tags: ['']
    });
  };

  const addTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, '']
    });
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  if (loading) {
    return <div className="animate-pulse">Loading players...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-xl font-semibold text-gray-900">Team Roster Management</h3>
        <div className="flex items-center gap-4">
          <LayoutToggle currentLayout={layout} onLayoutChange={setLayout} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-steel-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <FaPlus />
            Add Player
          </motion.button>
        </div>
      </div>

      {/* Players Layout */}
      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={player.image_url || `https://ui-avatars.com/api/?name=${player.name}&background=4682B4&color=fff&size=64&bold=true`}
                  alt={player.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-lg">#{player.jersey_number === 0 ? 'TBD' : player.jersey_number}</h4>
                  <p className="text-gray-600">{player.position}</p>
                </div>
              </div>
              
              <h3 className="font-bold text-xl mb-2">{player.name}</h3>
              <p className="text-gray-600 mb-2">Age: {player.age}</p>
              {player.tags && player.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {player.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-steel-blue text-white text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">{player.bio}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(player)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-sm" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(player.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FaTrash className="text-sm" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {layout === 'compact' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
            >
              <img
                src={player.image_url || `https://ui-avatars.com/api/?name=${player.name}&background=4682B4&color=fff&size=64&bold=true`}
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover mx-auto mb-3"
              />
              <h4 className="font-bold text-lg mb-1">#{player.jersey_number === 0 ? 'TBD' : player.jersey_number}</h4>
              <h3 className="font-semibold text-sm mb-1">{player.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{player.position}</p>
              {player.tags && player.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2 justify-center">
                  {player.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-steel-blue text-white text-xs px-1.5 py-0.5 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {player.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{player.tags.length - 2}</span>
                  )}
                </div>
              )}
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(player)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition-colors"
                >
                  <FaEdit className="mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(player.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-xs transition-colors"
                >
                  <FaTrash className="mx-auto" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {layout === 'list' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jersey</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {players.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={player.image_url || `https://ui-avatars.com/api/?name=${player.name}&background=4682B4&color=fff&size=40&bold=true`}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{player.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-steel-blue">#{player.jersey_number === 0 ? 'TBD' : player.jersey_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.age}</td>
                    <td className="px-6 py-4">
                      {player.tags && player.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {player.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-steel-blue text-white text-xs px-2 py-1 rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No tags</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{player.bio}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(player)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    {editingPlayer ? 'Edit Player' : 'Add New Player'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Player Photo
                  </label>
                  <ImageUpload
                    currentImage={formData.image_url}
                    onImageChange={(url) => setFormData({ ...formData, image_url: url })}
                    placeholder={formData.name || 'Player'}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Player Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jersey Number
                    </label>
                    <input
                      type="number"
                      value={formData.jersey_number}
                      onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select Position</option>
                      <option value="Forward">Forward</option>
                      <option value="Defense">Defense</option>
                      <option value="Goalie">Goalie</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Player Tags (Captain, Assistant Captain, etc.)
                    </label>
                    <button
                      type="button"
                      onClick={addTag}
                      className="text-steel-blue hover:text-blue-600 text-sm font-medium"
                    >
                      + Add Tag
                    </button>
                  </div>
                  
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                        placeholder="Enter a tag (e.g., Captain, Assistant Captain)"
                      />
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biography
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="Tell us about this player..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-steel-blue text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    {editingPlayer ? 'Update Player' : 'Add Player'}
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

export default PlayerManagement;