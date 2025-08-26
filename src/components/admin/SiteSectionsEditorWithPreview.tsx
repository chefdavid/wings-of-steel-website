import { useState, useEffect } from 'react';
import { FaSave, FaEye, FaEyeSlash, FaTrophy, FaUsers, FaHeart, FaHockeyPuck } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { SiteSection } from '../../types/database';
import { motion } from 'framer-motion';

const SiteSectionsEditorWithPreview = () => {
  const [sections, setSections] = useState<Record<string, SiteSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('hero');

  const sectionTabs = [
    { key: 'hero', label: 'Hero / Homepage Banner', description: 'Main banner with headings, award buttons, and call-to-action' },
    { key: 'about', label: 'About Us', description: 'Team information and mission statement' },
    { key: 'schedule', label: 'Schedule', description: 'Practice and game schedules' },
    { key: 'get-involved', label: 'Get Involved', description: 'Donation and volunteer information' },
    { key: 'contact', label: 'Contact', description: 'Contact details and location' },
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
        console.log('Fetched sections from DB:', sectionsMap);
        console.log('Hero section specifically:', sectionsMap.hero?.content);
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
      console.log('🚀 Saving content for', sectionKey, ':', content);
      console.log('Specifically - tagline:', content.tagline);
      console.log('Specifically - mission:', content.mission);
      const client = supabaseAdmin || supabase;
      
      const { error: updateError } = await client
        .from('site_sections')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('section_key', sectionKey);

      if (updateError) throw updateError;
      
      const { data: verifyData, error: verifyError } = await client
        .from('site_sections')
        .select('*')
        .eq('section_key', sectionKey)
        .single();
        
      if (verifyError) throw verifyError;
      
      setSections(prev => ({
        ...prev,
        [sectionKey]: verifyData
      }));
      
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving section:', error);
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

  const renderHeroPreview = () => {
    const heroData = sections.hero?.content || {};
    console.log('Hero data in preview:', heroData);
    
    return (
      <div className="bg-gradient-to-b from-dark-steel to-black rounded-lg overflow-hidden">
        <div className="relative min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-2xl">
            {/* Hockey Puck Icon */}
            <div className="flex justify-center">
              <FaHockeyPuck className="text-4xl text-ice-blue animate-pulse" />
            </div>

            {/* Main Headings */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {heroData.heading1 || 'BREAKING BARRIERS &'}
              </h1>
              <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">
                {heroData.heading2 || 'BUILDING CHAMPIONS'}
              </h1>
            </div>

            {/* Title */}
            <p className="text-lg text-ice-blue">
              {heroData.title || 'Wings of Steel'}
            </p>

            {/* Award Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-stretch">
              <div className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-3 rounded-lg font-medium text-sm min-h-[50px]">
                <FaTrophy className="text-black flex-shrink-0" />
                <span className="text-center">{heroData.subtitle || '2023 National Champions'}</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-3 rounded-lg font-medium text-sm min-h-[50px]">
                <FaTrophy className="text-black flex-shrink-0" />
                <span className="text-center">{heroData.tagline || '2025 USA Sled Hockey Champions 1st Place'}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed">
              {heroData.description || 'Championship youth sled hockey team'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 flex items-center justify-center gap-2">
                <FaUsers />
                {heroData.ctaButton1 || 'JOIN THE TEAM'}
              </button>
              <button className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-2">
                <FaHeart className="text-yellow-500" />
                {heroData.ctaButton2 || 'DONATE NOW'}
              </button>
            </div>

            {/* Mission Statement */}
            <p className="text-sm font-bold text-yellow-400">
              {heroData.mission || 'NO CHILD PAYS TO PLAY'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderHeroEditor = () => {
    const section = sections.hero;
    if (!section) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Headings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading Line 1 (White)</label>
            <input
              type="text"
              value={String(section.content.heading1 || '')}
              onChange={(e) => updateSectionContent('hero', 'heading1', e.target.value)}
              placeholder="BREAKING BARRIERS &"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading Line 2 (Yellow)</label>
            <input
              type="text"
              value={String(section.content.heading2 || '')}
              onChange={(e) => updateSectionContent('hero', 'heading2', e.target.value)}
              placeholder="BUILDING CHAMPIONS"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name/Title</label>
            <input
              type="text"
              value={String(section.content.title || '')}
              onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
              placeholder="Wings of Steel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
            />
          </div>

          {/* Mission Statement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement (Bottom)</label>
            <input
              type="text"
              value={String(section.content.mission || '')}
              onChange={(e) => updateSectionContent('hero', 'mission', e.target.value)}
              placeholder="NO CHILD PAYS TO PLAY"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
            />
          </div>

          {/* Award Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Award Button 1 (Left Trophy)</label>
            <input
              type="text"
              value={String(section.content.subtitle || '')}
              onChange={(e) => updateSectionContent('hero', 'subtitle', e.target.value)}
              placeholder="2023 National Champions"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Award Button 2 (Right Trophy)</label>
            <input
              type="text"
              value={String(section.content.tagline || '')}
              onChange={(e) => updateSectionContent('hero', 'tagline', e.target.value)}
              placeholder="2025 USA Sled Hockey Champions 1st Place"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
            />
          </div>

          {/* CTA Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Call-to-Action Button 1</label>
            <input
              type="text"
              value={String(section.content.ctaButton1 || '')}
              onChange={(e) => updateSectionContent('hero', 'ctaButton1', e.target.value)}
              placeholder="JOIN THE TEAM"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Call-to-Action Button 2</label>
            <input
              type="text"
              value={String(section.content.ctaButton2 || '')}
              onChange={(e) => updateSectionContent('hero', 'ctaButton2', e.target.value)}
              placeholder="DONATE NOW"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description Text</label>
          <textarea
            value={String(section.content.description || '')}
            onChange={(e) => updateSectionContent('hero', 'description', e.target.value)}
            rows={2}
            placeholder="Championship youth sled hockey team description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue text-sm"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Preview Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Site Content Editor</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {showPreview ? <FaEyeSlash /> : <FaEye />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6" aria-label="Tabs">
            {sectionTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-4 py-3 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.key
                    ? 'border-steel-blue text-steel-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Section Description */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              {sectionTabs.find(t => t.key === activeTab)?.description}
            </p>
          </div>

          {/* Main Content Area */}
          <div className={showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
            {/* Editor Column */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Edit Content</h3>
              {activeTab === 'hero' && renderHeroEditor()}
              {activeTab !== 'hero' && (
                <div className="text-gray-500 text-sm">
                  Editor for {activeTab} section coming soon...
                </div>
              )}
              
              {/* Save Button */}
              <div className="mt-6">
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

            {/* Preview Column */}
            {showPreview && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {activeTab === 'hero' && renderHeroPreview()}
                  {activeTab !== 'hero' && (
                    <div className="p-8 text-center text-gray-400">
                      Preview for {activeTab} section coming soon...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSectionsEditorWithPreview;