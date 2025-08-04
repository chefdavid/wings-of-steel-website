import { useState, useEffect } from 'react';
import { FaSave, FaEdit } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { SiteSection } from '../../types/database';

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
      const { data, error } = await supabaseAdmin
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={String(sections.hero.content.subtitle || '')}
                  onChange={(e) => updateSectionContent('hero', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={String(sections.hero.content.tagline || '')}
                  onChange={(e) => updateSectionContent('hero', 'tagline', e.target.value)}
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
                <span className="text-sm font-medium text-gray-500">Subtitle:</span>
                <p className="text-gray-800">{String(sections.hero.content.subtitle || '')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Tagline:</span>
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
                    onChange={(e) => updateSectionContent('contact', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
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
                <p className="text-gray-800">{String(sections.contact.content.phone || '')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SiteSectionsEditor;