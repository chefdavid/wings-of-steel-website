import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaNewspaper, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePressStories } from '../hooks/usePressStories';
import type { PressStory } from '../types/database';

const formatDate = (date?: string) => {
  if (!date) return '';
  const d = new Date(date + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function WingsPressPage() {
  const { fetchPublishedStories } = usePressStories();
  const [stories, setStories] = useState<PressStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedStories().then((data) => {
      setStories(data);
      setLoading(false);
    });
  }, [fetchPublishedStories]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-br from-steel-blue via-dark-steel to-steel-blue text-white pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <FaNewspaper className="text-5xl text-ice-blue" />
              <h1 className="text-5xl md:text-6xl font-sport">The Wings Press</h1>
            </div>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Stories, milestones, and the moments off the scoresheet that make Wings of Steel who we are.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No stories yet</h2>
            <p className="text-gray-500">Check back soon — we're working on the first one.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, i) => (
              <motion.article
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100"
              >
                <Link to={`/stories/${story.slug}`} className="group block h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {story.cover_photo_url ? (
                      <img
                        src={story.cover_photo_url}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-steel-blue to-dark-steel flex items-center justify-center">
                        <FaNewspaper className="text-white/30 text-5xl" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-dark-steel leading-tight group-hover:text-steel-blue transition-colors">
                      {story.title}
                    </h2>
                    {story.subtitle && (
                      <p className="text-gray-600 mt-2 line-clamp-3">{story.subtitle}</p>
                    )}
                    <div className="text-sm text-gray-500 mt-3">
                      {[story.author, formatDate(story.published_at)].filter(Boolean).join(' · ')}
                    </div>
                    <div className="mt-auto pt-4">
                      <span className="text-steel-blue font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read story <FaArrowRight className="text-xs" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
