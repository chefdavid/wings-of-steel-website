import { useState, useEffect } from 'react';
import { FaSave, FaEdit } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import type { SiteSection } from '../../types/database';
import { formatPhoneDisplay, handlePhoneChange } from '../../utils/phoneUtils';

const SiteSectionsEditor = () => {
  const [sections, setSections] = useState<Record<string, SiteSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*');

      if (error) throw error;

      if (data) {
        const sectionsMap = data.reduce((acc, section) => {
          acc[section.section_key] = section;
          return acc;
        }, {} as Record<string, SiteSection>);
        setSections(sectionsMap);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionKey: string, content: Record<string, unknown>) => {
    setSaving(sectionKey);
    try {
      console.log('🚀 Saving site section:', sectionKey, content);
      const { data, error } = await supabase
        .from('site_sections')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('section_key', sectionKey)
        .select();

      console.log('✅ Save result:', { data, error });
      if (error) throw error;
      
      await fetchSections();
      setEditingSection(null);
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setSaving(null);
    }
  };

  const updateSectionContent = (sectionKey: string, field: string, value: string) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        content: {
          ...prev[sectionKey].content,
          [field]: value
        }
      }
    }));
  };

  const handleLocationPhoneChange = (value: string) => {
    handlePhoneChange(value, (formatted) => updateSectionContent('location', 'phone', formatted));
  };

  const handleContactPhoneChange = (value: string) => {
    handlePhoneChange(value, (formatted) => updateSectionContent('contact', 'phone', formatted));
  };

  if (loading) {
    return <div className="animate-pulse">Loading site sections...</div>;
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Site Content Management</h3>

      {/* Hero Section */}
      {sections.hero && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Hero Section</h4>
            <button
              onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              {editingSection === 'hero' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingSection === 'hero' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={String(sections.hero.content.title || '')}
                  onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Award Button 1 (Left Trophy Button)</label>
                <input
                  type="text"
                  value={String(sections.hero.content.subtitle || '')}
                  onChange={(e) => updateSectionContent('hero', 'subtitle', e.target.value)}
                  placeholder="e.g., 2023 National Champions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Award Button 2 (Right Trophy Button)</label>
                <input
                  type="text"
                  value={String(sections.hero.content.tagline || '')}
                  onChange={(e) => updateSectionContent('hero', 'tagline', e.target.value)}
                  placeholder="e.g., 2025 USA Sled Hockey Champions 1st Place"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={String(sections.hero.content.description || '')}
                  onChange={(e) => updateSectionContent('hero', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={() => handleSave('hero', sections.hero.content)}
                disabled={saving === 'hero'}
                className="bg-steel-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave />
                {saving === 'hero' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Title:</span>
                <p className="text-gray-800">{String(sections.hero.content.title || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Award Button 1:</span>
                <p className="text-gray-800">{String(sections.hero.content.subtitle || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Award Button 2:</span>
                <p className="text-gray-800">{String(sections.hero.content.tagline || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <p className="text-gray-800">{String(sections.hero.content.description || '')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* About Section */}
      {sections.about && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">About Section</h4>
            <button
              onClick={() => setEditingSection(editingSection === 'about' ? null : 'about')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              {editingSection === 'about' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingSection === 'about' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement</label>
                <textarea
                  value={String(sections.about.content.mission || '')}
                  onChange={(e) => updateSectionContent('about', 'mission', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={String(sections.about.content.description || '')}
                  onChange={(e) => updateSectionContent('about', 'description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={() => handleSave('about', sections.about.content)}
                disabled={saving === 'about'}
                className="bg-steel-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave />
                {saving === 'about' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Mission:</span>
                <p className="text-gray-800">{String(sections.about.content.mission || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <p className="text-gray-800">{String(sections.about.content.description || '')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Location Section */}
      {sections.location && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Find Us on the Ice</h4>
            <button
              onClick={() => setEditingSection(editingSection === 'location' ? null : 'location')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              {editingSection === 'location' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingSection === 'location' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={String(sections.location.content.title || '')}
                  onChange={(e) => updateSectionContent('location', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={String(sections.location.content.description || '')}
                  onChange={(e) => updateSectionContent('location', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rink Name</label>
                  <input
                    type="text"
                    value={String(sections.location.content.rink_name || '')}
                    onChange={(e) => updateSectionContent('location', 'rink_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={String(sections.location.content.phone || '')}
                    onChange={(e) => handleLocationPhoneChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={String(sections.location.content.address || '')}
                  onChange={(e) => updateSectionContent('location', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input
                  type="url"
                  value={String(sections.location.content.website || '')}
                  onChange={(e) => updateSectionContent('location', 'website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Embed URL</label>
                <input
                  type="url"
                  value={String(sections.location.content.google_maps_url || '')}
                  onChange={(e) => updateSectionContent('location', 'google_maps_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={() => handleSave('location', sections.location.content)}
                disabled={saving === 'location'}
                className="bg-steel-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave />
                {saving === 'location' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Title:</span>
                <p className="text-gray-800">{String(sections.location.content.title || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <p className="text-gray-800">{String(sections.location.content.description || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Rink:</span>
                <p className="text-gray-800">{String(sections.location.content.rink_name || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Address:</span>
                <p className="text-gray-800">{String(sections.location.content.address || '')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Get Involved Section */}
      {sections.get_involved && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Get Involved</h4>
            <button
              onClick={() => setEditingSection(editingSection === 'get_involved' ? null : 'get_involved')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              {editingSection === 'get_involved' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingSection === 'get_involved' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={String(sections.get_involved.content.title || '')}
                  onChange={(e) => updateSectionContent('get_involved', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={String(sections.get_involved.content.description || '')}
                  onChange={(e) => updateSectionContent('get_involved', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={() => handleSave('get_involved', sections.get_involved.content)}
                disabled={saving === 'get_involved'}
                className="bg-steel-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave />
                {saving === 'get_involved' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Title:</span>
                <p className="text-gray-800">{String(sections.get_involved.content.title || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <p className="text-gray-800">{String(sections.get_involved.content.description || '')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact Section */}
      {sections.contact && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Contact Information</h4>
            <button
              onClick={() => setEditingSection(editingSection === 'contact' ? null : 'contact')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              {editingSection === 'contact' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingSection === 'contact' ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={String(sections.contact.content.email || '')}
                    onChange={(e) => updateSectionContent('contact', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={String(sections.contact.content.phone || '')}
                    onChange={(e) => handleContactPhoneChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSave('contact', sections.contact.content)}
                disabled={saving === 'contact'}
                className="bg-steel-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave />
                {saving === 'contact' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-800">{String(sections.contact.content.email || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Phone:</span>
                <p className="text-gray-800">{formatPhoneDisplay(String(sections.contact.content.phone || ''))}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SiteSectionsEditor;