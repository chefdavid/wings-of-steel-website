import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import ImageUpload from './ImageUpload';
import LayoutToggle, { type LayoutType } from './LayoutToggle';

interface Coach {
  id: string;
  name: string;
  role: string;
  description: string;
  experience?: string;
  achievements?: string[];
  image_url?: string;
}

const CoachManagement = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    experience: '',
    achievements: [''],
    image_url: ''
  });

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      console.log('🔄 Fetching coaches...');
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('name');

      if (error) throw error;
      console.log('✅ Fetched coaches:', data?.length || 0);
      setCoaches(data || []);
    } catch (error) {
      console.error('❌ Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted', { editingCoach, formData });
    try {
      const coachData = {
        name: formData.name,
        role: formData.role,
        description: formData.description,
        experience: formData.experience || null,
        achievements: formData.achievements.filter(a => a.trim() !== ''),
        image_url: formData.image_url || ''
      };

      console.log('🎯 Coach data to save:', coachData);

      if (editingCoach) {
        console.log('📝 Updating coach with ID:', editingCoach.id);
        const { data, error } = await supabaseAdmin
          .from('coaches')
          .update(coachData)
          .eq('id', editingCoach.id)
          .select();
        
        console.log('✅ Update result:', { data, error });
        if (error) throw error;
      } else {
        console.log('📝 Inserting new coach');
        const { data, error } = await supabaseAdmin
          .from('coaches')
          .insert([coachData])
          .select();
        
        console.log('✅ Insert result:', { data, error });
        if (error) throw error;
      }

      await fetchCoaches();
      handleCancel();
    } catch (error) {
      console.error('❌ Error saving coach:', error);
      alert(`Error saving coach: ${error.message}`);
    }
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      role: coach.role,
      description: coach.description,
      experience: coach.experience || '',
      achievements: coach.achievements && coach.achievements.length > 0 ? coach.achievements : [''],
      image_url: coach.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coach?')) {
      try {
        const { error } = await supabaseAdmin
          .from('coaches')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        await fetchCoaches();
      } catch (error) {
        console.error('❌ Error deleting coach:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingCoach(null);
    setShowForm(false);
    setFormData({
      name: '',
      role: '',
      description: '',
      experience: '',
      achievements: [''],
      image_url: ''
    });
  };

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, '']
    });
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({
      ...formData,
      achievements: newAchievements
    });
  };

  if (loading) {
    return <div className="animate-pulse">Loading coaches...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-xl font-semibold text-gray-900">Coaching Staff Management</h3>
        <div className="flex items-center gap-4">
          <LayoutToggle currentLayout={layout} onLayoutChange={setLayout} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-steel-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <FaPlus />
            Add Coach
          </motion.button>
        </div>
      </div>

      {/* Coaches Layout */}
      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={coach.image_url || `https://ui-avatars.com/api/?name=${coach.name}&background=2C3E50&color=fff&size=64`}
                  alt={coach.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-xl">{coach.name}</h3>
                  <p className="text-steel-blue font-semibold">{coach.role}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{coach.description}</p>
              
              {coach.experience && (
                <p className="text-sm text-steel-blue font-medium mb-3">{coach.experience}</p>
              )}
              
              {coach.achievements && coach.achievements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Achievements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {coach.achievements.slice(0, 3).map((achievement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-steel-blue rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(coach)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-sm" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coach.id)}
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
          {coaches.map((coach) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
            >
              <img
                src={coach.image_url || `https://ui-avatars.com/api/?name=${coach.name}&background=2C3E50&color=fff&size=64`}
                alt={coach.name}
                className="w-12 h-12 rounded-full object-cover mx-auto mb-3"
              />
              <h3 className="font-bold text-lg mb-1">{coach.name}</h3>
              <p className="text-steel-blue font-semibold text-sm mb-1">{coach.role}</p>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{coach.description}</p>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(coach)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition-colors"
                >
                  <FaEdit className="mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(coach.id)}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coaches.map((coach, index) => (
                  <motion.tr
                    key={coach.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={coach.image_url || `https://ui-avatars.com/api/?name=${coach.name}&background=2C3E50&color=fff&size=40`}
                          alt={coach.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{coach.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-steel-blue">{coach.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{coach.experience || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{coach.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(coach)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(coach.id)}
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
                    {editingCoach ? 'Edit Coach' : 'Add New Coach'}
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
                    Coach Photo
                  </label>
                  <ImageUpload
                    currentImage={formData.image_url}
                    onImageChange={(url) => setFormData({ ...formData, image_url: url })}
                    placeholder={formData.name || 'Coach'}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coach Name
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
                      Role/Position
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      placeholder="e.g., Head Coach, Assistant Coach"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="Brief description of the coach's role and expertise..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="e.g., 10+ years coaching experience"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Achievements & Qualifications
                    </label>
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="text-steel-blue hover:text-blue-600 text-sm font-medium"
                    >
                      + Add Achievement
                    </button>
                  </div>
                  
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateAchievement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                        placeholder="Enter an achievement or qualification"
                      />
                      {formData.achievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAchievement(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-steel-blue text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    {editingCoach ? 'Update Coach' : 'Add Coach'}
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

export default CoachManagement;