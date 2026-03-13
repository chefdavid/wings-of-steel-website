import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { URLTeamProvider } from '../contexts/URLTeamContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Team {
  name: string;
  location: string;
  isOurTeam?: boolean;
}

interface Region {
  name: string;
  teams: Team[];
}

const regions: Region[] = [
  {
    name: 'Northeast',
    teams: [
      { name: 'Wings of Steel', location: 'Voorhees, NJ', isOurTeam: true },
      { name: 'Philadelphia Flyers Sled Hockey', location: 'Philadelphia, PA' },
      { name: 'New York Rangers Sled Hockey', location: 'New York, NY' },
      { name: 'Northeast Passage Wildcats', location: 'Durham, NH' },
      { name: 'Boston Sled Hockey', location: 'Boston, MA' },
      { name: 'Connecticut Wolfpack Sled Hockey', location: 'CT' },
      { name: 'New Jersey Devils Sled Hockey', location: 'NJ' },
      { name: 'Pittsburgh Mighty Penguins', location: 'Pittsburgh, PA' },
    ],
  },
  {
    name: 'Southeast',
    teams: [
      { name: 'Tampa Bay Lightning Sled Hockey', location: 'Tampa, FL' },
      { name: 'Carolina Hurricanes Sled Hockey', location: 'Raleigh, NC' },
      { name: 'Nashville Sled Preds', location: 'Nashville, TN' },
    ],
  },
  {
    name: 'Midwest',
    teams: [
      { name: 'Chicago Blackhawks Sled Hockey', location: 'Chicago, IL' },
      { name: 'Minnesota Wild Sled Hockey', location: 'St. Paul, MN' },
      { name: 'Detroit Sled Wings', location: 'Detroit, MI' },
      { name: 'St. Louis Blues Sled Hockey', location: 'St. Louis, MO' },
      { name: 'Columbus Blue Jackets Sled Hockey', location: 'Columbus, OH' },
    ],
  },
  {
    name: 'West',
    teams: [
      { name: 'San Jose Sharks Sled Hockey', location: 'San Jose, CA' },
      { name: 'Colorado Avalanche Sled Hockey', location: 'Denver, CO' },
      { name: 'Arizona Coyotes Sled Hockey', location: 'Scottsdale, AZ' },
      { name: 'Utah Sled Hockey', location: 'Salt Lake City, UT' },
    ],
  },
];

const TeamCard = ({ team, index }: { team: Team; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className={`rounded-xl p-6 bg-steel-gray/30 border-2 ${
      team.isOurTeam
        ? 'border-yellow-400 shadow-lg shadow-yellow-400/10'
        : 'border-steel-blue/40'
    } hover:shadow-lg transition-all`}
  >
    <h3 className={`font-sport text-xl mb-1 ${team.isOurTeam ? 'text-yellow-400' : 'text-white'}`}>
      {team.name}
    </h3>
    <p className="text-ice-blue text-sm mb-3">{team.location}</p>
    {team.isOurTeam && (
      <div className="mt-2">
        <span className="inline-block bg-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
          Our Team
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          <Link
            to="/join-team"
            className="inline-block bg-yellow-400 text-dark-steel text-sm font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
          >
            Join Our Team
          </Link>
          <Link
            to="/sled-hockey-nj"
            className="inline-block bg-steel-blue text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-steel-blue/80 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    )}
  </motion.div>
);

const SledHockeyTeams = () => {
  useEffect(() => {
    document.title = 'Sled Hockey Teams in the USA | Complete Directory';
    const metaDescription = document.querySelector('meta[name="description"]');
    const content =
      'Complete directory of sled hockey teams in the USA. Find sled hockey teams near you including NHL-sponsored programs. Browse teams by region across the Northeast, Southeast, Midwest, and West.';
    if (metaDescription) {
      metaDescription.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
    return () => {
      document.title = 'Wings of Steel Youth Sled Hockey';
    };
  }, []);

  return (
    <URLTeamProvider>
      <div className="min-h-screen bg-dark-steel">
        <Navigation />
        <main className="pt-20">
          {/* Hero / Intro Section */}
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-sport text-white mb-6">
                  Sled Hockey Teams in the USA
                </h1>
                <p className="text-ice-blue text-lg md:text-xl max-w-3xl mx-auto mb-6">
                  Sled hockey (also called sledge hockey) is one of the fastest-growing adaptive
                  sports in the United States. USA Hockey oversees sled hockey programs nationwide,
                  and many NHL franchises sponsor local sled hockey teams to make the sport
                  accessible in their communities.
                </p>
                <p className="text-ice-blue text-lg max-w-3xl mx-auto mb-8">
                  Whether you are looking for a sled hockey team near you or exploring the sport
                  for the first time, this directory will help you find a program in your region.
                  Many teams welcome players of all ages and experience levels, and most provide
                  equipment at no cost.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/what-is-sled-hockey"
                    className="bg-steel-blue text-white font-bold px-6 py-3 rounded-lg hover:bg-steel-blue/80 transition-colors"
                  >
                    What Is Sled Hockey?
                  </Link>
                  <Link
                    to="/join-team"
                    className="bg-yellow-400 text-dark-steel font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
                  >
                    Join Wings of Steel
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Teams by Region */}
          {regions.map((region, regionIndex) => (
            <section key={region.name} className="py-12 px-4">
              <div className="max-w-6xl mx-auto">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: regionIndex * 0.1 }}
                  className="text-3xl md:text-4xl font-sport text-steel-blue mb-8 border-b border-steel-blue/30 pb-3"
                >
                  {region.name}
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {region.teams.map((team, index) => (
                    <TeamCard key={team.name} team={team} index={index} />
                  ))}
                </div>
              </div>
            </section>
          ))}

          {/* CTA / Info Section */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-steel-gray/30 rounded-2xl p-8 md:p-12 border border-steel-blue/30 text-center"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  Don't See a Team Near You?
                </h2>
                <p className="text-ice-blue text-lg mb-6 max-w-2xl mx-auto">
                  New sled hockey programs are forming all the time. USA Hockey's disabled hockey
                  section can help you find or start a team in your area. If you are in the
                  New Jersey, Pennsylvania, or Delaware region, Wings of Steel welcomes you —
                  and no child ever pays to play.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/join-team"
                    className="bg-yellow-400 text-dark-steel font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
                  >
                    Join Wings of Steel
                  </Link>
                  <Link
                    to="/donate"
                    className="bg-steel-blue text-white font-bold px-6 py-3 rounded-lg hover:bg-steel-blue/80 transition-colors"
                  >
                    Support Our Mission
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </URLTeamProvider>
  );
};

export default SledHockeyTeams;
