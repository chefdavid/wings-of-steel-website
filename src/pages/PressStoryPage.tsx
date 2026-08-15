import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaNewspaper } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from './NotFound';
import { usePressStories } from '../hooks/usePressStories';
import type { PressStory } from '../types/database';

const formatDate = (date?: string) => {
  if (!date) return '';
  const d = new Date(date + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function PressStoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getStoryBySlug } = usePressStories();
  const [story, setStory] = useState<PressStory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    getStoryBySlug(slug).then((data) => {
      setStory(data);
      setLoading(false);
    });
  }, [slug, getStoryBySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!story || !story.is_published) {
    return <NotFound />;
  }

  // Split body on blank lines into paragraphs; preserve internal newlines.
  const paragraphs = story.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <article className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 text-steel-blue hover:text-dark-steel font-semibold mb-6"
          >
            <FaArrowLeft /> All Stories
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 text-ice-blue text-sm font-bold uppercase tracking-widest mb-3">
              <FaNewspaper /> The Wings Press
            </div>
            <h1 className="text-4xl md:text-5xl font-sport text-dark-steel leading-tight">
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="text-xl text-gray-600 mt-3 leading-snug">{story.subtitle}</p>
            )}
            <div className="text-sm text-gray-500 mt-4">
              {[story.author, formatDate(story.published_at)].filter(Boolean).join(' · ')}
            </div>
          </motion.header>

          {story.cover_photo_url && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl overflow-hidden mb-8 shadow-lg"
            >
              <img
                src={story.cover_photo_url}
                alt={story.title}
                className="w-full max-h-[500px] object-cover"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="prose prose-lg max-w-none text-gray-800"
          >
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p key={i} className="mb-5 text-lg leading-relaxed whitespace-pre-wrap">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">No content yet.</p>
            )}
          </motion.div>

          {story.photos && story.photos.length > 0 && (
            <div className="mt-10 border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-sport text-dark-steel mb-4">Photos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {story.photos.map((photo, i) => (
                  <figure key={`${photo.url}-${i}`} className="rounded-lg overflow-hidden bg-gray-50">
                    <img src={photo.url} alt={photo.caption || ''} className="w-full h-72 object-cover" />
                    {photo.caption && (
                      <figcaption className="text-sm text-gray-600 px-3 py-2">{photo.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
