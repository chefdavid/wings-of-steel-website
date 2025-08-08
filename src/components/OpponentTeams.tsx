import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import TeamCard from './TeamCard';
import TeamModal from './TeamModal';
import Navigation from './Navigation';
import type { OpponentTeam } from '../types/opponent-team';

export default function OpponentTeams() {
  const [teams, setTeams] = useState<OpponentTeam[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<OpponentTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<OpponentTeam | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedProgramType, setSelectedProgramType] = useState<string>('all');

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const filterTeams = () => {
      let filtered = [...teams];

      if (searchTerm) {
        filtered = filtered.filter(team => 
          team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.rink_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedState !== 'all') {
        filtered = filtered.filter(team => team.state === selectedState);
      }

      if (selectedProgramType !== 'all') {
        filtered = filtered.filter(team => team.program_type === selectedProgramType);
      }

      setFilteredTeams(filtered);
    };
    
    filterTeams();
  }, [teams, searchTerm, selectedState, selectedProgramType]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('opponent_teams')
        .select('*')
        .order('team_name');

      if (error) throw error;
      setTeams(data || []);
      setFilteredTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleTeamClick = (team: OpponentTeam) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const states = ['all', ...Array.from(new Set(teams.map(t => t.state).filter(Boolean)))];
  const programTypes = ['all', 'youth', 'adult', 'full', 'special'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-ice-blue via-white to-steel-gray/10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-steel-blue mb-4">
            Our Opponents
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Meet the incredible teams we compete against in the sled hockey community.
            Together, we're growing the sport and creating opportunities for all athletes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent appearance-none"
              >
                {states.map(state => (
                  <option key={state} value={state}>
                    {state === 'all' ? 'All States' : state}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedProgramType}
                onChange={(e) => setSelectedProgramType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent appearance-none"
              >
                {programTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Programs' : 
                     type === 'full' ? 'Full Program' : 
                     `${type.charAt(0).toUpperCase() + type.slice(1)} Teams`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Found {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}</span>
            {(searchTerm || selectedState !== 'all' || selectedProgramType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedState('all');
                  setSelectedProgramType('all');
                }}
                className="text-steel-blue hover:text-steel-blue/80 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue"></div>
            <p className="mt-4 text-gray-600">Loading teams...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTeams.map((team) => (
              <motion.div key={team.id} variants={itemVariants}>
                <TeamCard team={team} onClick={() => handleTeamClick(team)} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No teams found matching your criteria.</p>
          </div>
        )}

        <TeamModal 
          team={selectedTeam} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
        </div>
      </div>
    </>
  );
}