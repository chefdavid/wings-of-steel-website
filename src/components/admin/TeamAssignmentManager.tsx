import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaMinus, FaStar, FaUserTie } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { getAvatarUrl } from '../../utils/avatar';
import { 
  addPlayerToTeam, 
  removePlayerFromTeam, 
  addCoachToTeam, 
  removeCoachFromTeam,
  getPlayerTeamAssignments,
  getCoachTeamAssignments
} from '../../utils/teamQueries';
import type { Player, Coach, PlayerTeamAssignment, CoachTeamAssignment } from '../../types/database';
import type { TeamType } from '../../types/team';

interface TeamAssignmentManagerProps {
  type: 'player' | 'coach';
}

const TeamAssignmentManager: React.FC<TeamAssignmentManagerProps> = ({ type }) => {
  const [people, setPeople] = useState<(Player | Coach)[]>([]);
  const [assignments, setAssignments] = useState<Record<string, (PlayerTeamAssignment | CoachTeamAssignment)[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all players or coaches
      const { data, error } = await supabase
        .from(type === 'player' ? 'players' : 'coaches')
        .select('*')
        .eq(type === 'player' ? 'active' : 'id', type === 'player' ? true : supabase.from('coaches').select('id'))
        .order('first_name', { ascending: true });

      if (error) throw error;
      setPeople(data || []);

      // Fetch team assignments for each person
      const assignmentPromises = (data || []).map(async (person) => {
        const assignments = type === 'player' 
          ? await getPlayerTeamAssignments(person.id)
          : await getCoachTeamAssignments(person.id);
        return { id: person.id, assignments };
      });

      const assignmentResults = await Promise.all(assignmentPromises);
      const assignmentMap = assignmentResults.reduce((acc, result) => {
        acc[result.id] = result.assignments;
        return acc;
      }, {} as Record<string, (PlayerTeamAssignment | CoachTeamAssignment)[]>);

      setAssignments(assignmentMap);
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTeam = async (personId: string, teamType: TeamType) => {
    try {
      if (type === 'player') {
        await addPlayerToTeam(personId, teamType, {
          jersey_number: undefined, // Will be set later
          position: undefined,
          is_captain: false
        });
      } else {
        await addCoachToTeam(personId, teamType, {
          role: undefined, // Will be set later
          is_head_coach: false
        });
      }
      
      // Refresh assignments
      fetchData();
    } catch (error) {
      console.error(`Error adding ${type} to team:`, error);
    }
  };

  const handleRemoveFromTeam = async (personId: string, teamType: TeamType) => {
    try {
      if (type === 'player') {
        await removePlayerFromTeam(personId, teamType);
      } else {
        await removeCoachFromTeam(personId, teamType);
      }
      
      // Refresh assignments
      fetchData();
    } catch (error) {
      console.error(`Error removing ${type} from team:`, error);
    }
  };

  const isOnTeam = (personId: string, teamType: TeamType) => {
    return assignments[personId]?.some(assignment => assignment.team_type === teamType) || false;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading {type} assignments...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          {type === 'player' ? <FaStar /> : <FaUserTie />}
          {type === 'player' ? 'Player' : 'Coach'} Team Assignments
        </h2>
        <p className="text-gray-600">
          Manage which teams each {type} is assigned to. {type === 'player' ? 'Players' : 'Coaches'} can be on both youth and adult teams.
        </p>
      </div>

      <div className="space-y-4">
        {people.map((person) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={getAvatarUrl(person.image_url, person.first_name || person.name || '', person.last_name || '', '#4682B4', 64)}
                  alt={`${person.first_name || person.name} ${person.last_name || ''}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    {person.first_name || person.name} {person.last_name}
                  </h3>
                  {type === 'player' && (
                    <p className="text-sm text-gray-600">
                      #{(person as Player).jersey_number} • {(person as Player).position}
                    </p>
                  )}
                  {type === 'coach' && (
                    <p className="text-sm text-gray-600">
                      {(person as Coach).role}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Youth Team */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">Youth</span>
                  {isOnTeam(person.id, 'youth') ? (
                    <button
                      onClick={() => handleRemoveFromTeam(person.id, 'youth')}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      title="Remove from Youth team"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToTeam(person.id, 'youth')}
                      className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                      title="Add to Youth team"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Adult Team */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-orange-600">Adult</span>
                  {isOnTeam(person.id, 'adult') ? (
                    <button
                      onClick={() => handleRemoveFromTeam(person.id, 'adult')}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      title="Remove from Adult team"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToTeam(person.id, 'adult')}
                      className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors"
                      title="Add to Adult team"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Show current team assignments */}
            {assignments[person.id] && assignments[person.id].length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {assignments[person.id].map((assignment, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assignment.team_type === 'youth'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {assignment.team_type === 'youth' ? 'Wings of Steel Youth Team' : 'Wings of Steel Adult Team'}
                      {type === 'player' && 'jersey_number' in assignment && assignment.jersey_number && 
                        ` #${assignment.jersey_number}`
                      }
                      {type === 'coach' && 'is_head_coach' in assignment && assignment.is_head_coach && 
                        ' (Head Coach)'
                      }
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamAssignmentManager;