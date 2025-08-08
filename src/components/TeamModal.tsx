import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Globe, Mail, Phone, Users, Calendar, Facebook, DollarSign, Award } from 'lucide-react';
import type { OpponentTeam } from '../types/opponent-team';

interface TeamModalProps {
  team: OpponentTeam | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamModal({ team, isOpen, onClose }: TeamModalProps) {
  if (!team) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatWebsite = (url: string) => {
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="relative p-6 border-b"
              style={{
                background: team.primary_color ? 
                  `linear-gradient(135deg, ${team.primary_color}20 0%, ${team.secondary_color || team.primary_color}15 100%)` : 
                  'linear-gradient(135deg, #1e3a8a20 0%, #dc262615 100%)'
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-3xl font-bold text-gray-900 pr-10">{team.team_name}</h2>
              {team.short_name && team.short_name !== team.team_name && (
                <p className="text-lg text-gray-600 mt-1">({team.short_name})</p>
              )}
              
              <div className="flex flex-wrap gap-4 mt-4">
                {team.founded_year && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Founded {team.founded_year}
                  </span>
                )}
                {team.is_free_program && (
                  <span className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    <DollarSign className="w-4 h-4" />
                    FREE PROGRAM
                  </span>
                )}
                {team.program_type && (
                  <span className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4" />
                    {team.program_type === 'full' ? 'Full Program' : `${team.program_type} Team`}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-steel-blue" />
                      Location
                    </h3>
                    <div className="text-gray-700 space-y-1">
                      {team.rink_name && <p className="font-medium">{team.rink_name}</p>}
                      {team.address && <p>{team.address}</p>}
                      {(team.city || team.state || team.zip) && (
                        <p>
                          {team.city && `${team.city}, `}
                          {team.state} {team.zip}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-steel-blue" />
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      {team.website && (
                        <a 
                          href={formatWebsite(team.website)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          {team.website}
                        </a>
                      )}
                      {team.email && (
                        <a 
                          href={`mailto:${team.email}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {team.email}
                        </a>
                      )}
                      {team.phone && (
                        <a 
                          href={`tel:${team.phone}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          {team.phone}
                        </a>
                      )}
                      {team.facebook && (
                        <a 
                          href={team.facebook.startsWith('@') ? `https://facebook.com/${team.facebook.slice(1)}` : team.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Facebook className="w-4 h-4" />
                          {team.facebook}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5 text-steel-blue" />
                      Team Leadership
                    </h3>
                    <div className="text-gray-700 space-y-1">
                      {team.head_coach && (
                        <p><span className="font-medium">Head Coach:</span> {team.head_coach}</p>
                      )}
                      {team.assistant_coaches && team.assistant_coaches.length > 0 && (
                        <p>
                          <span className="font-medium">Assistant Coach{team.assistant_coaches.length > 1 ? 'es' : ''}:</span>{' '}
                          {team.assistant_coaches.join(', ')}
                        </p>
                      )}
                      {team.manager && (
                        <p><span className="font-medium">Manager:</span> {team.manager}</p>
                      )}
                      {team.president && (
                        <p><span className="font-medium">President:</span> {team.president}</p>
                      )}
                      {team.founder && (
                        <p><span className="font-medium">Founder:</span> {team.founder}</p>
                      )}
                    </div>
                  </div>

                  {(team.age_range || team.sponsor) && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-steel-blue" />
                        Program Details
                      </h3>
                      <div className="text-gray-700 space-y-1">
                        {team.age_range && (
                          <p><span className="font-medium">Age Range:</span> {team.age_range}</p>
                        )}
                        {team.sponsor && (
                          <p><span className="font-medium">Sponsored by:</span> {team.sponsor}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {team.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Additional Information</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{team.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}