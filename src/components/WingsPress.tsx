import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaNewspaper, FaArrowRight, FaTrophy, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { usePressStories } from '../hooks/usePressStories';
import { useGameHighlights, useGameSchedule } from '../hooks';
import { storageImageUrl } from '../utils/avatar';
import type { PressStory, GameHighlight } from '../types/database';

// Story / highlight cards paint into a ~382px-wide, h-52 box. 800 covers that
// at 2x without pulling the full-resolution original.
const CARD_RENDER_WIDTH = 800;

const formatDate = (date?: string) => {
  if (!date) return '';
  const d = new Date(date + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function StoryCard({ story, index }: { story: PressStory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link to={`/stories/${story.slug}`} className="group block h-full">
        <article className="h-full rounded-xl overflow-hidden bg-steel-gray/30 border border-steel-blue/20 hover:border-ice-blue/60 transition-all duration-300 hover:shadow-xl hover:shadow-ice-blue/10 flex flex-col">
          <div className="relative h-52 overflow-hidden bg-dark-steel">
            {story.cover_photo_url ? (
              // Cards render ~382px wide; ask Storage for 2x that rather than
              // the full-size original (a 1178x670 JPEG at 209 KB). These sit
              // below the fold, so let them load lazily too.
              <img
                src={storageImageUrl(story.cover_photo_url, CARD_RENDER_WIDTH)}
                alt={story.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-steel-blue to-dark-steel flex items-center justify-center">
                <FaNewspaper className="text-white/20 text-6xl" />
              </div>
            )}
            <div className="absolute top-3 left-3 bg-ice-blue text-dark-steel text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              Story
            </div>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{story.title}</h3>
            {story.subtitle && (
              <p className="text-ice-blue text-sm mt-1 line-clamp-2">{story.subtitle}</p>
            )}
            <div className="text-gray-400 text-xs mt-2">
              {[story.author, formatDate(story.published_at)].filter(Boolean).join(' · ')}
            </div>
            <div className="mt-auto pt-3">
              <span className="text-ice-blue text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Read story <FaArrowRight className="text-xs" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function HighlightCard({
  highlight,
  index,
  opponent,
  date,
  linkId,
}: {
  highlight: GameHighlight;
  index: number;
  opponent: string;
  date: string;
  linkId: string;
}) {
  const photoUrl = highlight.featured_photo_url || highlight.photos?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link to={`/game/${linkId}`} className="group block h-full">
        <article className="h-full rounded-xl overflow-hidden bg-steel-gray/30 border border-steel-blue/20 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10 flex flex-col">
          <div className="relative h-52 overflow-hidden bg-dark-steel">
            {photoUrl ? (
              <img
                src={storageImageUrl(photoUrl, CARD_RENDER_WIDTH)}
                alt={highlight.title || `vs ${opponent}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-steel-blue to-dark-steel flex items-center justify-center">
                <FaTrophy className="text-white/20 text-6xl" />
              </div>
            )}
            <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
              <FaStar className="text-xs" /> Recap
            </div>
            {highlight.final_score && (
              <div className="absolute top-3 right-3 bg-white/90 text-dark-steel font-bold px-3 py-1 rounded text-sm">
                {highlight.final_score}
              </div>
            )}
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
              {highlight.title || `Wings of Steel vs ${opponent}`}
            </h3>
            <p className="text-ice-blue text-xs mt-1">
              {opponent && `vs ${opponent}`}
              {date && ` · ${formatDate(date)}`}
            </p>
            {highlight.summary && (
              <p className="text-gray-300 text-xs mt-2 line-clamp-2">{highlight.summary}</p>
            )}
            <div className="mt-auto pt-3">
              <span className="text-yellow-400 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                View recap <FaArrowRight className="text-xs" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function gridCols(count: number): string {
  if (count === 1) return 'grid-cols-1 max-w-lg mx-auto';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
}

export default function WingsPress() {
  const { fetchFeaturedStories } = usePressStories();
  const { fetchFeaturedHighlights } = useGameHighlights();
  const { games } = useGameSchedule();

  const [stories, setStories] = useState<PressStory[]>([]);
  const [highlights, setHighlights] = useState<GameHighlight[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([fetchFeaturedStories(3), fetchFeaturedHighlights()]).then(([s, h]) => {
      setStories(s);
      setHighlights(h);
      setLoaded(true);
    });
  }, [fetchFeaturedStories, fetchFeaturedHighlights]);

  if (!loaded) return null;
  if (stories.length === 0 && highlights.length === 0) return null;

  const getGameInfo = (highlight: GameHighlight) => {
    if (highlight.game_id) {
      const game = games.find((g) => g.id === highlight.game_id);
      if (game) {
        return {
          opponent: game.opponent,
          date: game.game_date || game.date || '',
          linkId: game.id,
        };
      }
    }
    return {
      opponent: highlight.opponent || 'Opponent',
      date: highlight.game_date || '',
      linkId: highlight.id,
    };
  };

  return (
    <section className="py-12 bg-gradient-to-b from-black to-dark-steel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <FaNewspaper className="text-ice-blue text-2xl" />
            <h2 className="font-sport text-display-md md:text-display-lg text-white">The Wings Press</h2>
          </div>
          <p className="text-ice-blue text-sm">Stories, recaps, and milestones from the team</p>
        </motion.div>

        {/* Stories subsection */}
        {stories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-end justify-between mb-5 border-b border-steel-blue/20 pb-2">
              <h3 className="text-xl md:text-2xl font-sport text-white tracking-wider flex items-center gap-2">
                <FaNewspaper className="text-ice-blue" /> Stories
              </h3>
              <Link
                to="/stories"
                className="text-ice-blue hover:text-yellow-400 transition-colors text-sm font-semibold inline-flex items-center gap-1"
              >
                All stories <FaArrowRight className="text-xs" />
              </Link>
            </div>
            <div className={`grid gap-6 ${gridCols(stories.length)}`}>
              {stories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Game Recaps subsection */}
        {highlights.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-5 border-b border-steel-blue/20 pb-2">
              <h3 className="text-xl md:text-2xl font-sport text-white tracking-wider flex items-center gap-2">
                <FaTrophy className="text-yellow-400" /> Game Recaps
              </h3>
              <Link
                to="/game-highlights"
                className="text-ice-blue hover:text-yellow-400 transition-colors text-sm font-semibold inline-flex items-center gap-1"
              >
                All recaps <FaArrowRight className="text-xs" />
              </Link>
            </div>
            <div className={`grid gap-6 ${gridCols(highlights.length)}`}>
              {highlights.map((highlight, i) => {
                const info = getGameInfo(highlight);
                return (
                  <HighlightCard
                    key={highlight.id}
                    highlight={highlight}
                    index={i}
                    opponent={info.opponent}
                    date={info.date}
                    linkId={info.linkId}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
