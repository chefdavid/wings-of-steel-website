import { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaHome, FaInfoCircle, FaEnvelope, FaCalendar, FaHandHoldingHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { SiteSection } from '../../types/database';
import { formatPhoneDisplay, handlePhoneChange } from '../../utils/phoneUtils';

const SiteSectionsEditorV2 = () => {
  const [sections, setSections] = useState<Record<string, SiteSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('hero');

  const sectionTabs = [
    { key: 'hero', label: 'Hero Section', icon: FaHome, description: 'Main banner and award buttons' },
    { key: 'about', label: 'About Section', icon: FaInfoCircle, description: 'Team information and mission' },
    { key: 'schedule', label: 'Schedule', icon: FaCalendar, description: 'Practice and game schedules' },
    { key: 'get-involved', label: 'Get Involved', icon: FaHandHoldingHeart, description: 'Donation and volunteer info' },
    { key: 'contact', label: 'Contact', icon: FaEnvelope, description: 'Contact information' },
    { key: 'location', label: 'Location', icon: FaMapMarkerAlt, description: 'Rink and facility info' },
  ];

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

  const handleSave = async (sectionKey: string) => {
    setSaving(sectionKey);
    try {
      const content = sections[sectionKey]?.content || {};
      console.log('🚀 Saving site section:', sectionKey, content);
      
      // Use admin client for write operations if available
      const client = supabaseAdmin || supabase;
      console.log('📝 Using client:', supabaseAdmin ? 'Admin (Service Role)' : 'Regular (Anon Key)');
      
      // First update the data
      const { error: updateError } = await client
        .from('site_sections')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('section_key', sectionKey);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }
      
      // Then fetch fresh data to confirm save
      const { data: verifyData, error: verifyError } = await client
        .from('site_sections')
        .select('*')
        .eq('section_key', sectionKey)
        .single();
        
      console.log('✅ Save verified:', { verifyData, verifyError });
      
      if (verifyError) {
        console.error('❌ Verification error:', verifyError);
        throw verifyError;
      }
      
      // Update local state with verified data
      setSections(prev => ({
        ...prev,
        [sectionKey]: verifyData
      }));
      
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('❌ Error saving section:', error);
      alert(`Failed to save changes: ${error.message || 'Unknown error'}`);
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

  const renderSectionEditor = (sectionKey: string) => {
    const section = sections[sectionKey];
    if (!section) return <div className="text-gray-500">Section not found</div>;

    switch (sectionKey) {
      case 'hero':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
              <input
                type="text"
                value={String(section.content.title || '')}
                onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Award Button 1 (Left Trophy Button)
              </label>
              <input
                type="text"
                value={String(section.content.subtitle || '')}
                onChange={(e) => updateSectionContent('hero', 'subtitle', e.target.value)}
                placeholder="e.g., 2023 National Champions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Award Button 2 (Right Trophy Button)
              </label>
              <input
                type="text"
                value={String(section.content.tagline || '')}
                onChange={(e) => updateSectionContent('hero', 'tagline', e.target.value)}
                placeholder="e.g., 2025 USA Sled Hockey Champions 1st Place"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={String(section.content.description || '')}
                onChange={(e) => updateSectionContent('hero', 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Title</label>
              <input
                type="text"
                value={String(section.content.title || '')}
                onChange={(e) => updateSectionContent('about', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Content</label>
              <textarea
                value={String(section.content.content || '')}
                onChange={(e) => updateSectionContent('about', 'content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={String(section.content.email || '')}
                onChange={(e) => updateSectionContent('contact', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={formatPhoneDisplay(String(section.content.phone || ''))}
                onChange={(e) => handlePhoneChange(e, (value) => updateSectionContent('contact', 'phone', value))}
                placeholder="(123) 456-7890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={String(section.content.address || '')}
                onChange={(e) => updateSectionContent('contact', 'address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facility Name</label>
              <input
                type="text"
                value={String(section.content.facility || '')}
                onChange={(e) => updateSectionContent('location', 'facility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rink Address</label>
              <input
                type="text"
                value={String(section.content.address || '')}
                onChange={(e) => updateSectionContent('location', 'address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
              <input
                type="url"
                value={String(section.content.mapUrl || '')}
                onChange={(e) => updateSectionContent('location', 'mapUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <p className="text-gray-500">Editor for {sectionKey} coming soon...</p>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(section.content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6" aria-label="Tabs">
            {sectionTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.key
                    ? 'border-steel-blue text-steel-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="text-lg" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Section Description */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              {sectionTabs.find(t => t.key === activeTab)?.icon && (
                <div className="text-steel-blue text-xl mt-0.5">
                  {sectionTabs.find(t => t.key === activeTab)?.icon && 
                    (() => {
                      const Icon = sectionTabs.find(t => t.key === activeTab)!.icon;
                      return <Icon />;
                    })()
                  }
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {sectionTabs.find(t => t.key === activeTab)?.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {sectionTabs.find(t => t.key === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          {renderSectionEditor(activeTab)}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave(activeTab)}
              disabled={saving === activeTab}
              className="flex items-center gap-2 px-6 py-2 bg-steel-blue text-white rounded-lg hover:bg-steel-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaSave />
              {saving === activeTab ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSectionsEditorV2;