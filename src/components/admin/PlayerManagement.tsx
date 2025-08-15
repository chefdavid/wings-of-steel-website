import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { Player, ContactInfo, EmergencyContact } from '../../types/database';
import ImageUpload from './ImageUpload';
import LayoutToggle, { type LayoutType } from './LayoutToggle';
import { calculateAge, toInputDate, getTenureDisplay } from '../../utils/dateUtils';
import { handlePhoneChange } from '../../utils/phoneUtils';
import { getAvatarUrl } from '../../utils/avatar';

const PlayerManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<'name' | 'jersey_number' | 'position' | 'age' | 'active'>('jersey_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeColumnMissing, setActiveColumnMissing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', // Keep for backwards compatibility
    first_name: '',
    last_name: '',
    birthdate: '',
    start_date: '',
    position: '',
    bio: '',
    image_url: '',
    jersey_number: '',
    tags: [''],
    active: true,
    contacts: [] as ContactInfo[],
    emergency_contact: { name: '', phone: '', relationship: '' } as EmergencyContact,
    player_notes: ''
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
      
      // Check if any player has the active field
      const hasActiveColumn = data && data.length > 0 && data[0].active !== undefined;
      setActiveColumnMissing(!hasActiveColumn);
      
      // Add default active status and calculate age for players
      const playersWithActive = (data || []).map(player => ({
        ...player,
        active: player.active !== undefined ? player.active : true,
        age: player.birthdate ? calculateAge(player.birthdate) : player.age || 15, // fallback to existing age or 15
        contacts: player.contacts || [],
        emergency_contact: player.emergency_contact || { name: '', phone: '', relationship: '' },
        // Handle first_name/last_name compatibility
        first_name: player.first_name || player.name?.split(' ')[0] || '',
        last_name: player.last_name || player.name?.split(' ').slice(1).join(' ') || '',
        start_date: player.start_date || ''
      }));
      
      setPlayers(playersWithActive);
    } catch (error) {
      console.error('❌ Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted', { editingPlayer, formData });
    
    // Use admin client if available, otherwise fall back to regular client
    const dbClient = supabaseAdmin || supabase;
    console.log('🔐 Using client:', supabaseAdmin ? 'Admin (service role)' : 'Regular (anon key)');
    console.log('🔐 Admin client available:', !!supabaseAdmin);
    
    try {
      const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
      const playerData = {
        name: `${formData.first_name} ${formData.last_name}`.trim(), // Backwards compatibility
        first_name: formData.first_name,
        last_name: formData.last_name,
        birthdate: formData.birthdate,
        start_date: formData.start_date,
        position: formData.position,
        bio: formData.bio,
        image_url: formData.image_url || '',
        jersey_number: parseInt(formData.jersey_number),
        tags: filteredTags,
        active: formData.active,
        contacts: formData.contacts,
        emergency_contact: formData.emergency_contact,
        player_notes: formData.player_notes
      };

      console.log('🎯 Player data to save:', playerData);
      console.log('🏷️ Filtered tags:', filteredTags);

      if (editingPlayer) {
        console.log('📝 Updating player with ID:', editingPlayer.id);
        console.log('📦 Update payload:', playerData);
        
        // First, let's verify the player exists
        const { data: existingPlayer, error: fetchError } = await dbClient
          .from('players')
          .select('*')
          .eq('id', editingPlayer.id)
          .single();
        
        console.log('🔍 Existing player before update:', existingPlayer);
        
        if (fetchError) {
          console.error('❌ Error fetching existing player:', fetchError);
          throw fetchError;
        }
        
        const { error } = await dbClient
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id);
        
        console.log('✅ Update result:', { error });
        if (error) {
          // Check if error is due to missing 'active' column
          if (error.message?.includes("active") || error.code === 'PGRST204') {
            console.log('⚠️ Active column not found in database. Updating without active field...');
            const { active, ...playerDataWithoutActive } = playerData;
            const { error: retryError } = await dbClient
              .from('players')
              .update(playerDataWithoutActive)
              .eq('id', editingPlayer.id);
            
            if (retryError) {
              console.error('❌ Retry update error:', retryError);
              throw retryError;
            }
            console.log('🎉 Player updated successfully (without active field)');
            // Don't show alert every time, it's annoying
            // alert('⚠️ Player updated, but Active/Inactive status could not be saved.\\n\\nThe database needs an "active" column. Please contact your administrator to add this column to enable active/inactive functionality.');
          } else {
            console.error('❌ Update error details:', error);
            throw error;
          }
        } else {
          console.log('🎉 Player updated successfully');
          
          // Verify the update actually worked
          const { data: verifyData, error: verifyError } = await dbClient
            .from('players')
            .select('*')
            .eq('id', editingPlayer.id)
            .single();
          
          console.log('✔️ Verification - player after update:', verifyData);
          
          // Compare the changes
          if (verifyData && existingPlayer) {
            const changes = {};
            Object.keys(playerData).forEach(key => {
              if (existingPlayer[key] !== verifyData[key]) {
                changes[key] = {
                  old: existingPlayer[key],
                  new: verifyData[key]
                };
              }
            });
            
            if (Object.keys(changes).length > 0) {
              console.log('📝 Changes detected:', changes);
            } else {
              console.warn('⚠️ No changes detected after update!');
            }
          }
          
          if (verifyError) {
            console.error('❌ Error verifying update:', verifyError);
          }
        }
      } else {
        console.log('📝 Inserting new player');
        const { data, error } = await dbClient
          .from('players')
          .insert([playerData])
          .select();
        
        console.log('✅ Insert result:', { data, error });
        if (error) {
          // Check if error is due to missing 'active' column
          if (error.message?.includes("active") || error.code === 'PGRST204') {
            console.log('⚠️ Active column not found in database. Inserting without active field...');
            const { active, ...playerDataWithoutActive } = playerData;
            const { data: retryData, error: retryError } = await dbClient
              .from('players')
              .insert([playerDataWithoutActive])
              .select();
            
            if (retryError) {
              console.error('❌ Retry insert error:', retryError);
              throw retryError;
            }
            console.log('🎉 Player inserted successfully (without active field):', retryData);
            alert('⚠️ Player added, but Active/Inactive status could not be saved.\\n\\nThe database needs an "active" column. Please contact your administrator to add this column to enable active/inactive functionality.');
          } else {
            throw error;
          }
        }
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
    
    // Handle backwards compatibility for contacts with old address format
    const contacts = (player.contacts || []).map(contact => ({
      ...contact,
      address: typeof contact.address === 'string' 
        ? { street: contact.address, city: '', state: '', zip: '' }
        : contact.address || { street: '', city: '', state: '', zip: '' }
    }));
    
    setFormData({
      name: player.name,
      first_name: player.first_name || player.name?.split(' ')[0] || '',
      last_name: player.last_name || player.name?.split(' ').slice(1).join(' ') || '',
      birthdate: player.birthdate ? toInputDate(player.birthdate) : '',
      start_date: player.start_date ? toInputDate(player.start_date) : '',
      position: player.position,
      bio: player.bio,
      image_url: player.image_url || '',
      jersey_number: player.jersey_number.toString(),
      tags: player.tags && player.tags.length > 0 ? player.tags : [''],
      active: player.active !== undefined ? player.active : true,
      contacts: contacts,
      emergency_contact: player.emergency_contact || { name: '', phone: '', relationship: '' },
      player_notes: player.player_notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        const dbClient = supabaseAdmin || supabase;
        const { error } = await dbClient
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
      first_name: '',
      last_name: '',
      birthdate: '',
      start_date: '',
      position: '',
      bio: '',
      image_url: '',
      jersey_number: '',
      tags: [''],
      active: true,
      contacts: [],
      emergency_contact: { name: '', phone: '', relationship: '' },
      player_notes: ''
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

  // Filter, search, and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players;
    
    // Filter by active status
    if (activeFilter === 'active') {
      filtered = filtered.filter(p => p.active !== false);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(p => p.active === false);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.position.toLowerCase().includes(term) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Sort players
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'jersey_number':
          aValue = a.jersey_number === 0 ? 999 : a.jersey_number; // Put TBD at end
          bValue = b.jersey_number === 0 ? 999 : b.jersey_number;
          break;
        case 'position':
          aValue = a.position.toLowerCase();
          bValue = b.position.toLowerCase();
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'active':
          aValue = a.active === false ? 0 : 1; // Inactive = 0, Active = 1
          bValue = b.active === false ? 0 : 1;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sorted;
  }, [players, activeFilter, searchTerm, sortField, sortDirection]);

  const playerStats = useMemo(() => {
    const total = players.length;
    const active = players.filter(p => p.active !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [players]);

  // Handle sorting
  const handleSort = (field: 'name' | 'jersey_number' | 'position' | 'age' | 'active') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort className="opacity-50" />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Contact management functions
  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, {
        type: 'parent' as const,
        name: '',
        phone: '',
        email: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip: ''
        },
        relationship: '',
        primary: formData.contacts.length === 0 // First contact is primary by default
      }]
    });
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

  if (loading) {
    return <div className="animate-pulse">Loading players...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Active Column Missing Warning */}
      {activeColumnMissing && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-600 mt-0.5">⚠️</div>
            <div>
              <h4 className="text-red-800 font-medium mb-2">Active/Inactive Status Not Available</h4>
              <p className="text-red-700 text-sm mb-3">
                The database is missing the "active" column needed for active/inactive player status. 
                Active/inactive toggles will not save until this is added.
              </p>
              <details className="text-sm">
                <summary className="text-red-800 font-medium cursor-pointer hover:text-red-900">
                  Click to see setup instructions
                </summary>
                <div className="mt-2 p-3 bg-red-100 rounded border text-red-800">
                  <p className="mb-2"><strong>Run this SQL in your Supabase SQL Editor:</strong></p>
                  <code className="block bg-white p-2 rounded text-xs">
                    ALTER TABLE players ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
                  </code>
                  <p className="mt-2 text-xs">
                    Access: Supabase Dashboard → Your Project → SQL Editor
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Team Roster Management</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {playerStats.active} Active
            </span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {playerStats.inactive} Inactive
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {playerStats.total} Total
            </span>
          </div>
        </div>
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

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search players by name, position, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
          >
            <option value="all">All Players</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [typeof sortField, typeof sortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
            >
              <option value="jersey_number-asc">Jersey # (Low to High)</option>
              <option value="jersey_number-desc">Jersey # (High to Low)</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
              <option value="position-asc">Position (A to Z)</option>
              <option value="position-desc">Position (Z to A)</option>
              <option value="age-asc">Age (Young to Old)</option>
              <option value="age-desc">Age (Old to Young)</option>
              <option value="active-desc">Status (Active First)</option>
              <option value="active-asc">Status (Inactive First)</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredAndSortedPlayers.length} of {players.length} players
          </div>
        </div>
      </div>

      {/* Players Layout */}
      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPlayers.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={getAvatarUrl(player.image_url, player.name, '', '#4682B4', 64)}
                    alt={player.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    player.active === false ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">#{player.jersey_number === 0 ? 'TBD' : player.jersey_number}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      player.active === false 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {player.active === false ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                  <p className="text-gray-600">{player.position}</p>
                </div>
              </div>
              
              <h3 className="font-bold text-xl mb-2">{player.first_name} {player.last_name}</h3>
              <p className="text-gray-600 mb-2">Age: {player.birthdate ? calculateAge(player.birthdate) : player.age || 'Unknown'}</p>
              {player.start_date && (
                <p className="text-gray-600 mb-2">{getTenureDisplay(player.start_date)}</p>
              )}
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
                  className="w-full bg-steel-blue hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-sm" />
                  Edit Player
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {layout === 'compact' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAndSortedPlayers.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
            >
              <div className="relative inline-block">
                <img
                  src={player.image_url || `https://ui-avatars.com/api/?name=${player.name}&background=4682B4&color=fff&size=64&bold=true`}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover mx-auto mb-3"
                />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                  player.active === false ? 'bg-red-500' : 'bg-green-500'
                }`} />
              </div>
              <h4 className="font-bold text-lg mb-1">#{player.jersey_number === 0 ? 'TBD' : player.jersey_number}</h4>
              <h3 className="font-semibold text-sm mb-1">{player.first_name} {player.last_name}</h3>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-gray-600">{player.position}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  player.active === false 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {player.active === false ? 'Inactive' : 'Active'}
                </span>
              </div>
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
                  className="w-full bg-steel-blue hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <FaEdit className="text-xs" />
                  <span className="text-xs">Edit</span>
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
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Player
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('jersey_number')}
                  >
                    <div className="flex items-center gap-1">
                      Jersey
                      {getSortIcon('jersey_number')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center gap-1">
                      Position
                      {getSortIcon('position')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center gap-1">
                      Age
                      {getSortIcon('age')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('active')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('active')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedPlayers.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            src={getAvatarUrl(player.image_url, player.name, '', '#4682B4', 40)}
                            alt={player.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                            player.active === false ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{player.first_name} {player.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-steel-blue">#{player.jersey_number === 0 ? 'TBD' : player.jersey_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.birthdate ? calculateAge(player.birthdate) : player.age || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        player.active === false 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {player.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {player.tags && player.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {player.tags.map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
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
                      <button
                        onClick={() => handleEdit(player)}
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
                      Birthdate
                    </label>
                    <input
                      type="date"
                      value={formData.birthdate}
                      onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                      required
                    />
                    {formData.birthdate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Age: {calculateAge(formData.birthdate)} years old
                      </p>
                    )}
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
                      <option value="Offense">Offense</option>
                      <option value="Defense">Defense</option>
                      <option value="Goalie">Goalie</option>
                    </select>
                  </div>
                </div>

                {/* Active Status Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Player Status
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === true}
                        onChange={() => setFormData({ ...formData, active: true })}
                        className="sr-only"
                      />
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.active === true 
                          ? 'border-green-500 bg-green-50 text-green-800' 
                          : 'border-gray-300 bg-white text-gray-600 hover:border-green-300'
                      }`}>
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="font-medium">Active</span>
                      </div>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === false}
                        onChange={() => setFormData({ ...formData, active: false })}
                        className="sr-only"
                      />
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.active === false 
                          ? 'border-red-500 bg-red-50 text-red-800' 
                          : 'border-gray-300 bg-white text-gray-600 hover:border-red-300'
                      }`}>
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="font-medium">Inactive</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Active players appear on the public website, inactive players are kept for historical records.
                  </p>
                  {editingPlayer && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <div className="text-yellow-600 mt-0.5">⚠️</div>
                        <div className="text-sm text-yellow-800">
                          <strong>Tip:</strong> Instead of deleting players, consider marking them as "Inactive" to preserve their historical records while removing them from the public roster.
                        </div>
                      </div>
                    </div>
                  )}
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

                {/* Contact Information */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Parent/Guardian Contacts
                    </label>
                    <button
                      type="button"
                      onClick={addContact}
                      className="text-steel-blue hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                    >
                      <FaPlus className="text-xs" />
                      Add Contact
                    </button>
                  </div>
                  
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
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FaTrash className="text-xs" />
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
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Guardian">Guardian</option>
                            <option value="Grandparent">Grandparent</option>
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
                      <p className="text-xs">Click "Add Contact" to add parent/guardian information</p>
                    </div>
                  )}
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

                {/* Player Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Player Notes
                  </label>
                  <textarea
                    value={formData.player_notes}
                    onChange={(e) => setFormData({ ...formData, player_notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="Special accommodations, disabilities, coaching notes, medical needs, equipment requirements, etc."
                  />
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="font-medium text-blue-800 mb-1">📝 Use this section for:</p>
                    <ul className="text-blue-700 space-y-0.5">
                      <li>• Disability accommodations or equipment needs</li>
                      <li>• Special coaching considerations</li>
                      <li>• Medical conditions affecting play</li>
                      <li>• Communication preferences</li>
                      <li>• Behavioral support strategies</li>
                      <li>• Any other important player-specific information</li>
                    </ul>
                    <p className="text-blue-600 mt-2 text-xs font-medium">
                      ⚠️ This information is confidential and only visible to team administrators.
                    </p>
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
                          placeholder="Relationship to player"
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
                  {editingPlayer && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editingPlayer.active !== false) {
                          alert('⚠️ Consider marking this player as "Inactive" instead of deleting them. This preserves their historical record while removing them from the public roster.\\n\\nTo permanently delete, first set the player to "Inactive" and save, then edit again to delete.');
                          return;
                        }
                        if (window.confirm(`Are you sure you want to permanently delete ${editingPlayer.name}? This action cannot be undone.\\n\\nThis will completely remove the player from the database.`)) {
                          handleDelete(editingPlayer.id);
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

export default PlayerManagement;