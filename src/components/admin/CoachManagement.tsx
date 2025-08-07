import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import type { Coach, ContactInfo, EmergencyContact } from '../../types/database';
import ImageUpload from './ImageUpload';
import LayoutToggle, { type LayoutType } from './LayoutToggle';
import { getTenureDisplay } from '../../utils/dateUtils';
import { handlePhoneChange } from '../../utils/phoneUtils';

const CoachManagement = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'role' | 'start_date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    name: '', // Keep for backwards compatibility
    first_name: '',
    last_name: '',
    role: '',
    description: '',
    experience: '',
    achievements: [''],
    image_url: '',
    start_date: '',
    contacts: [] as ContactInfo[],
    emergency_contact: { name: '', phone: '', relationship: '' } as EmergencyContact,
    coach_notes: ''
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
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('📊 Fetched coaches:', data?.length || 0);
      
      // Handle first_name/last_name compatibility and add defaults
      const coachesWithDefaults = (data || []).map(coach => ({
        ...coach,
        first_name: coach.first_name || coach.name?.split(' ')[0] || '',
        last_name: coach.last_name || coach.name?.split(' ').slice(1).join(' ') || '',
        start_date: coach.start_date || '',
        contacts: coach.contacts || [],
        emergency_contact: coach.emergency_contact || { name: '', phone: '', relationship: '' },
        achievements: coach.achievements || []
      }));
      
      setCoaches(coachesWithDefaults);
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
      const filteredAchievements = formData.achievements.filter(achievement => achievement.trim() !== '');
      const coachData = {
        name: `${formData.first_name} ${formData.last_name}`.trim(), // Backwards compatibility
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        description: formData.description,
        experience: formData.experience || '',
        achievements: filteredAchievements,
        image_url: formData.image_url || '',
        start_date: formData.start_date,
        contacts: formData.contacts,
        emergency_contact: formData.emergency_contact,
        coach_notes: formData.coach_notes
      };

      console.log('🎯 Coach data to save:', coachData);

      if (editingCoach) {
        const { error } = await supabase
          .from('coaches')
          .update(coachData)
          .eq('id', editingCoach.id);
        
        if (error) throw error;
        console.log('✅ Coach updated successfully');
      } else {
        const { error } = await supabase
          .from('coaches')
          .insert([coachData]);
        
        if (error) throw error;
        console.log('✅ Coach added successfully');
      }

      console.log('Fetching updated coaches list');
      await fetchCoaches();
      handleCancel();
      console.log('Coach save completed successfully');
    } catch (error) {
      console.error('Error saving coach:', error);
      alert(`Error saving coach: ${(error as Error).message}`);
    }
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    
    // Handle backwards compatibility for contacts with old address format
    const contacts = (coach.contacts || []).map(contact => ({
      ...contact,
      address: typeof contact.address === 'string' 
        ? { street: contact.address, city: '', state: '', zip: '' }
        : contact.address || { street: '', city: '', state: '', zip: '' }
    }));
    
    setFormData({
      name: coach.name,
      first_name: coach.first_name || coach.name?.split(' ')[0] || '',
      last_name: coach.last_name || coach.name?.split(' ').slice(1).join(' ') || '',
      role: coach.role,
      description: coach.description,
      experience: coach.experience || '',
      achievements: coach.achievements && coach.achievements.length > 0 ? coach.achievements : [''],
      image_url: coach.image_url || '',
      start_date: coach.start_date || '',
      contacts: contacts,
      emergency_contact: coach.emergency_contact || { name: '', phone: '', relationship: '' },
      coach_notes: coach.coach_notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coach?')) {
      try {
        const { error } = await supabase
          .from('coaches')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        await fetchCoaches();
      } catch (error) {
        console.error('Error deleting coach:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCoach(null);
    setFormData({
      name: '',
      first_name: '',
      last_name: '',
      role: '',
      description: '',
      experience: '',
      achievements: [''],
      image_url: '',
      start_date: '',
      contacts: [],
      emergency_contact: { name: '', phone: '', relationship: '' },
      coach_notes: ''
    });
  };

  const addAchievement = () => {
    setFormData({ ...formData, achievements: [...formData.achievements, ''] });
  };

  const removeAchievement = (index: number) => {
    const newAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: newAchievements });
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  // Contact management functions (same as PlayerManagement)
  const addContact = () => {
    const newContact: ContactInfo = {
      type: 'other',
      name: '',
      phone: '',
      email: '',
      address: { street: '', city: '', state: '', zip: '' },
      relationship: '',
      primary: formData.contacts.length === 0 // First contact is primary by default
    };
    setFormData({ ...formData, contacts: [...formData.contacts, newContact] });
  };

  const removeContact = (index: number) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    // If we removed the primary contact, make the first remaining contact primary
    if (formData.contacts[index]?.primary && newContacts.length > 0) {
      newContacts[0].primary = true;
    }
    setFormData({ ...formData, contacts: newContacts });
  };

  const updateContact = (index: number, field: keyof ContactInfo, value: string | boolean) => {
    const newContacts = [...formData.contacts];
    if (field === 'primary' && value === true) {
      // Only one contact can be primary
      newContacts.forEach((contact, i) => {
        contact.primary = i === index;
      });
    } else {
      (newContacts[index] as any)[field] = value;
    }
    setFormData({ ...formData, contacts: newContacts });
  };

  const handleContactPhoneChange = (index: number, value: string) => {
    handlePhoneChange(value, (formatted) => updateContact(index, 'phone', formatted));
  };

  const handleEmergencyContactPhoneChange = (value: string) => {
    handlePhoneChange(value, (formatted) => {
      setFormData({ 
        ...formData, 
        emergency_contact: { 
          ...formData.emergency_contact, 
          phone: formatted 
        } 
      });
    });
  };

  const updateContactAddress = (index: number, addressField: keyof ContactInfo['address'], value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index].address[addressField] = value;
    setFormData({ ...formData, contacts: newContacts });
  };

  // Search and sort functionality
  const filteredAndSortedCoaches = useMemo(() => {
    let filtered = coaches.filter(coach =>
      `${coach.first_name} ${coach.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'start_date':
          aValue = a.start_date || '9999-12-31';
          bValue = b.start_date || '9999-12-31';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [coaches, searchTerm, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: typeof sortField) => {
    if (field !== sortField) {
      return <FaSort className="text-gray-400" />;
    }
    return sortDirection === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
  };

  if (loading) {
    return <div className="animate-pulse">Loading coaches...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coach Management</h2>
          <p className="text-gray-600">Manage team coaches and their information</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-steel-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 w-fit"
        >
          <FaPlus />
          Add New Coach
        </button>
      </div>

      {/* Search and Layout Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coaches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
          />
        </div>
        <LayoutToggle currentLayout={layout} onLayoutChange={setLayout} />
      </div>

      {/* Coach Grid */}
      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCoaches.map((coach, index) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={coach.image_url || `https://ui-avatars.com/api/?name=${coach.first_name} ${coach.last_name}&background=4682B4&color=fff&size=64&bold=true`}
                  alt={`${coach.first_name} ${coach.last_name}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-xl">{coach.first_name} {coach.last_name}</h3>
                  <p className="text-steel-blue font-medium">{coach.role}</p>
                  {coach.start_date && (
                    <p className="text-gray-600 text-sm">{getTenureDisplay(coach.start_date)}</p>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{coach.description}</p>
              
              {coach.achievements && coach.achievements.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Key Achievements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {coach.achievements.slice(0, 3).map((achievement, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-steel-blue mr-2">•</span>
                        <span className="line-clamp-1">{achievement}</span>
                      </li>
                    ))}
                    {coach.achievements.length > 3 && (
                      <li className="text-xs text-gray-500">+{coach.achievements.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(coach)}
                  className="flex-1 bg-steel-blue hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-sm" />
                  Edit Coach
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Coach List */}
      {layout === 'list' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Coach
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1">
                      Role
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('start_date')}
                  >
                    <div className="flex items-center gap-1">
                      Tenure
                      {getSortIcon('start_date')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedCoaches.map((coach, index) => (
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
                          src={coach.image_url || `https://ui-avatars.com/api/?name=${coach.first_name} ${coach.last_name}&background=4682B4&color=fff&size=40&bold=true`}
                          alt={`${coach.first_name} ${coach.last_name}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{coach.first_name} {coach.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-steel-blue">{coach.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coach.start_date ? getTenureDisplay(coach.start_date) : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{coach.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(coach)}
                        className="bg-steel-blue hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors flex items-center gap-2"
                      >
                        <FaEdit className="text-sm" />
                        Edit
                      </button>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coach Photo
                  </label>
                  <ImageUpload
                    currentImage={formData.image_url}
                    onImageChange={(url) => setFormData({ ...formData, image_url: url })}
                    placeholder={`${formData.first_name} ${formData.last_name}` || 'Coach'}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select role</option>
                      <option value="Head Coach">Head Coach</option>
                      <option value="Assistant Coach">Assistant Coach</option>
                      <option value="Goalie Coach">Goalie Coach</option>
                      <option value="Skills Coach">Skills Coach</option>
                      <option value="Team Manager">Team Manager</option>
                      <option value="Equipment Manager">Equipment Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date with Team
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    />
                    {formData.start_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getTenureDisplay(formData.start_date)}
                      </p>
                    )}
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
                    placeholder="Coach's role, expertise, and responsibilities..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Optional)
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="Previous coaching experience, certifications, background..."
                  />
                </div>

                {/* Achievements Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Achievements & Certifications
                    </label>
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <FaPlus className="text-xs" />
                      Add Achievement
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.achievements.map((achievement, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => updateAchievement(index, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                          placeholder="Achievement, certification, or accomplishment..."
                        />
                        {formData.achievements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAchievement(index)}
                            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Information
                    </label>
                    <button
                      type="button"
                      onClick={addContact}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <FaPlus className="text-xs" />
                      Add Contact
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-800">Contact {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={contact.primary}
                                onChange={(e) => updateContact(index, 'primary', e.target.checked)}
                                className="rounded"
                              />
                              <span className={contact.primary ? 'text-steel-blue font-medium' : 'text-gray-600'}>
                                Primary Contact
                              </span>
                            </label>
                            {formData.contacts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeContact(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => updateContact(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                              placeholder="Full name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                            <select
                              value={contact.relationship}
                              onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                            >
                              <option value="">Select relationship</option>
                              <option value="Self">Self</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Partner">Partner</option>
                              <option value="Parent">Parent</option>
                              <option value="Sibling">Sibling</option>
                              <option value="Emergency Contact">Emergency Contact</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => handleContactPhoneChange(index, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => updateContact(index, 'email', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Address</label>
                          <div className="space-y-3">
                            <div>
                              <input
                                type="text"
                                value={contact.address.street}
                                onChange={(e) => updateContactAddress(index, 'street', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                                placeholder="Street Address"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <input
                                  type="text"
                                  value={contact.address.city}
                                  onChange={(e) => updateContactAddress(index, 'city', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                                  placeholder="City"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={contact.address.state}
                                  onChange={(e) => updateContactAddress(index, 'state', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                                  placeholder="State"
                                  maxLength={2}
                                />
                              </div>
                            </div>
                            <div className="w-32">
                              <input
                                type="text"
                                value={contact.address.zip}
                                onChange={(e) => updateContactAddress(index, 'zip', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                                placeholder="ZIP Code"
                                maxLength={10}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {formData.contacts.length === 0 && (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-sm">No contacts added yet</p>
                        <p className="text-xs">Click "Add Contact" to add coach contact information</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Emergency Contact
                  </label>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={formData.emergency_contact.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergency_contact: {
                              ...formData.emergency_contact,
                              name: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                        <input
                          type="text"
                          value={formData.emergency_contact.relationship}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergency_contact: {
                              ...formData.emergency_contact,
                              relationship: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                          placeholder="Relationship to coach"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Emergency Phone</label>
                      <input
                        type="tel"
                        value={formData.emergency_contact.phone}
                        onChange={(e) => handleEmergencyContactPhoneChange(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="text-xs text-red-600 bg-red-100 p-2 rounded border border-red-300">
                      <p className="font-medium">🚨 Emergency Contact Information</p>
                      <p className="mt-1">This contact will be called in case of medical emergencies or urgent situations during team activities.</p>
                    </div>
                  </div>
                </div>

                {/* Coach Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coach Notes
                  </label>
                  <textarea
                    value={formData.coach_notes}
                    onChange={(e) => setFormData({ ...formData, coach_notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="Certifications, specialties, additional information about the coach..."
                  />
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="font-medium text-blue-800 mb-1">📝 Use this section for:</p>
                    <ul className="text-blue-700 space-y-0.5">
                      <li>• Coaching certifications and licenses</li>
                      <li>• Special skills or expertise areas</li>
                      <li>• Preferred coaching methods or philosophy</li>
                      <li>• Any other important coach-specific information</li>
                    </ul>
                    <p className="text-blue-600 mt-2 text-xs font-medium">
                      ⚠️ This information is confidential and only visible to team administrators.
                    </p>
                  </div>
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
                  {editingCoach && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete ${editingCoach.first_name} ${editingCoach.last_name}? This action cannot be undone.`)) {
                          handleDelete(editingCoach.id);
                        }
                      }}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  )}
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