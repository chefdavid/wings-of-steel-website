import { useState, useEffect } from 'react';
import { FaSave, FaEye, FaEyeSlash, FaTrophy, FaUsers, FaHeart, FaHockeyPuck } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { SiteSection } from '../../types/database';
import { motion } from 'framer-motion';

// Define the exact structure of hero content
interface HeroContent {
  // Main headings
  heading1?: string;  // White text: "BREAKING BARRIERS &"
  heading2?: string;  // Yellow text: "BUILDING CHAMPIONS"
  
  // Team name
  title?: string;     // Blue text: "Wings of Steel"
  
  // Trophy buttons
  award1?: string;    // Left trophy button
  award2?: string;    // Right trophy button
  
  // Description
  description?: string; // Gray paragraph text
  
  // CTA buttons (not editable for now, hardcoded)
  
  // Mission statement
  mission?: string;   // Yellow text at bottom: "NO CHILD PAYS TO PLAY"
}

const HeroSectionEditor = () => {
  const [heroSection, setHeroSection] = useState<SiteSection | null>(null);
  const [content, setContent] = useState<HeroContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    fetchHeroSection();
  }, []);

  const fetchHeroSection = async () => {
    try {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .eq('section_key', 'hero')
        .single();

      if (error) throw error;

      if (data) {
        setHeroSection(data);
        // Map the existing content, handling both old and new field names
        const existingContent = data.content || {};
        setContent({
          heading1: existingContent.heading1 || 'BREAKING BARRIERS &',
          heading2: existingContent.heading2 || 'BUILDING CHAMPIONS',
          title: existingContent.title || 'Wings of Steel',
          award1: existingContent.subtitle || existingContent.award1 || '2023 National Champions',
          award2: existingContent.tagline || existingContent.award2 || '2025 USA Sled Hockey Champions 1st Place',
          description: existingContent.description || "New Jersey's premier youth sled hockey team, building champions on and off the ice",
          mission: existingContent.mission || 'NO CHILD PAYS TO PLAY'
        });
        console.log('Loaded hero content:', existingContent);
      }
    } catch (error) {
      console.error('Error fetching hero section:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Map our clean content structure to the database format
      // We'll keep backward compatibility with subtitle/tagline fields
      const dbContent = {
        heading1: content.heading1,
        heading2: content.heading2,
        title: content.title,
        subtitle: content.award1,  // Map award1 to subtitle for backward compatibility
        tagline: content.award2,   // Map award2 to tagline for backward compatibility
        award1: content.award1,    // Also store in new field names
        award2: content.award2,
        description: content.description,
        mission: content.mission
      };

      console.log('Saving hero content:', dbContent);
      
      const client = supabaseAdmin || supabase;
      
      const { error: updateError } = await client
        .from('site_sections')
        .update({ 
          content: dbContent,
          updated_at: new Date().toISOString()
        })
        .eq('section_key', 'hero');

      if (updateError) throw updateError;
      
      // Verify the save
      const { data: verifyData, error: verifyError } = await client
        .from('site_sections')
        .select('*')
        .eq('section_key', 'hero')
        .single();
        
      if (verifyError) throw verifyError;
      
      console.log('Save verified:', verifyData?.content);
      alert('Hero section updated successfully!');
      
    } catch (error) {
      console.error('Error saving hero section:', error);
      alert(`Failed to save changes: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof HeroContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderPreview = () => {
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
                {content.heading1}
              </h1>
              <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">
                {content.heading2}
              </h1>
            </div>

            {/* Team Name */}
            <p className="text-lg text-ice-blue">
              {content.title}
            </p>

            {/* Award Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-stretch">
              <div className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-3 rounded-lg font-medium text-sm min-h-[50px]">
                <FaTrophy className="text-black flex-shrink-0" />
                <span className="text-center">{content.award1}</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black px-3 py-3 rounded-lg font-medium text-sm min-h-[50px]">
                <FaTrophy className="text-black flex-shrink-0" />
                <span className="text-center">{content.award2}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed">
              {content.description}
            </p>

            {/* CTA Buttons (Static for preview) */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 flex items-center justify-center gap-2">
                <FaHeart className="text-red-500" />
                NO CHILD PAYS TO PLAY
              </button>
              <button className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-2">
                <FaUsers />
                JOIN THE TEAM
              </button>
            </div>
          </div>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hero Section Editor</h2>
          <p className="text-sm text-gray-600 mt-1">Edit the main homepage banner content</p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {showPreview ? <FaEyeSlash /> : <FaEye />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Main Content */}
      <div className={showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
        {/* Editor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Edit Content</h3>
          
          <div className="space-y-4">
            {/* Headings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Top Heading (White)
                </label>
                <input
                  type="text"
                  value={content.heading1}
                  onChange={(e) => updateField('heading1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
                />
                <p className="text-xs text-gray-500 mt-1">Displays in white at the top</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bottom Heading (Yellow)
                </label>
                <input
                  type="text"
                  value={content.heading2}
                  onChange={(e) => updateField('heading2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
                />
                <p className="text-xs text-gray-500 mt-1">Displays in yellow below the first heading</p>
              </div>
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
              <p className="text-xs text-gray-500 mt-1">Displays in blue below the headings</p>
            </div>

            {/* Award Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Left Trophy Button
                </label>
                <input
                  type="text"
                  value={content.award1}
                  onChange={(e) => updateField('award1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
                />
                <p className="text-xs text-gray-500 mt-1">First award/achievement</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Right Trophy Button
                </label>
                <input
                  type="text"
                  value={content.award2}
                  onChange={(e) => updateField('award2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
                />
                <p className="text-xs text-gray-500 mt-1">Second award/achievement</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={content.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
              <p className="text-xs text-gray-500 mt-1">Brief description of the team</p>
            </div>

            {/* Mission Statement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mission Statement
              </label>
              <input
                type="text"
                value={content.mission}
                onChange={(e) => updateField('mission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue"
              />
              <p className="text-xs text-gray-500 mt-1">Displays in yellow at the very bottom</p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-steel-blue text-white rounded-lg hover:bg-steel-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaSave />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div className="sticky top-4">
              {renderPreview()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSectionEditor;