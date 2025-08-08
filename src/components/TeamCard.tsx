import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Mail, Phone, Users, Calendar } from 'lucide-react';
import type { OpponentTeam } from '../types/opponent-team';

interface TeamCardProps {
  team: OpponentTeam;
  onClick: () => void;
}

export default function TeamCard({ team, onClick }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      {/* Color accent bar at top */}
      <div 
        className="h-2 w-full"
        style={{
          background: team.primary_color ? 
            `linear-gradient(90deg, ${team.primary_color} 0%, ${team.secondary_color || team.primary_color} 100%)` : 
            'linear-gradient(90deg, #1e3a8a 0%, #dc2626 100%)'
        }}
      />
      
      <div className="p-6 flex flex-col h-full">
        {/* Header section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3rem]">
              {team.team_name}
            </h3>
            {team.short_name && team.short_name !== team.team_name && (
              <p className="text-sm text-gray-600 mt-1">({team.short_name})</p>
            )}
          </div>
          {team.founded_year && (
            <span className="text-xs text-gray-500 flex items-center gap-1 ml-2">
              <Calendar className="w-3 h-3" />
              {team.founded_year}
            </span>
          )}
        </div>

        {/* Location section */}
        {team.rink_name && (
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-steel-blue mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">{team.rink_name}</p>
              {team.city && team.state && (
                <p className="text-xs text-gray-600">{team.city}, {team.state}</p>
              )}
            </div>
          </div>
        )}

        {/* Program details */}
        <div className="flex-1 space-y-2 mb-4">
          {team.program_type && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-steel-blue" />
              <span className="text-sm text-gray-700 capitalize">
                {team.program_type === 'full' ? 'Full Program' : `${team.program_type} Team`}
                {team.age_range && ` • Ages ${team.age_range}`}
              </span>
            </div>
          )}

          {team.head_coach && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-steel-blue" />
              <span className="text-sm text-gray-700">Coach: {team.head_coach}</span>
            </div>
          )}
        </div>

        {/* Contact icons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            {team.website && (
              <div className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Globe className="w-4 h-4 text-steel-blue" />
              </div>
            )}
            {team.email && (
              <div className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Mail className="w-4 h-4 text-steel-blue" />
              </div>
            )}
            {team.phone && (
              <div className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Phone className="w-4 h-4 text-steel-blue" />
              </div>
            )}
          </div>
          
          {team.sponsor && (
            <p className="text-xs text-gray-500 text-right">
              Sponsored by<br/>{team.sponsor}
            </p>
          )}
        </div>
      </div>

      {/* Free program badge */}
      {team.is_free_program && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          FREE
        </div>
      )}
    </motion.div>
  );
}