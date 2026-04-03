import { useState, useEffect } from 'react';
import { useGameSchedule, useGameHighlights, useTournaments } from '../../hooks';
import type { Game, GameHighlight, GamePhoto, KeyMoment, PlayerHighlight, Tournament } from '../../types/database';
import { compressMultipleImages, formatFileSize, isValidImage, isValidFileSize } from '../../utils/imageCompression';
import { supabase } from '../../lib/supabaseClient';

type SidebarMode = 'browse' | 'create-tournament' | 'create-standalone';

interface StandaloneFields {
  opponent: string;
  game_date: string;
  game_time: string;
  game_location: string;
  home_away: 'home' | 'away' | '';
  game_type: string;
  tournament_id: string;
}

const emptyStandaloneFields: StandaloneFields = {
  opponent: '',
  game_date: '',
  game_time: '',
  game_location: '',
  home_away: '',
  game_type: '',
  tournament_id: '',
};

export default function GameHighlightsManagement() {
  const { games, loading: gamesLoading } = useGameSchedule();
  const {
    highlights,
    loading: highlightsLoading,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    uploadPhoto,
    deletePhoto,
    getHighlightByGameId,
  } = useGameHighlights();
  const {
    tournaments,
    loading: tournamentsLoading,
    createTournament,
    updateTournament,
    deleteTournament,
  } = useTournaments();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<GameHighlight | null>(null);
  const [currentHighlight, setCurrentHighlight] = useState<Partial<GameHighlight> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Sidebar state
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('browse');
  const [expandedTournaments, setExpandedTournaments] = useState<Set<string>>(new Set());
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  // Tournament form
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    location: '',
    description: '',
    season: '',
  });

  // Standalone game fields
  const [standaloneFields, setStandaloneFields] = useState<StandaloneFields>(emptyStandaloneFields);

  // Form fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [finalScore, setFinalScore] = useState('');
  const [gameResult, setGameResult] = useState<'W' | 'L' | 'T' | ''>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [photos, setPhotos] = useState<GamePhoto[]>([]);
  const [featuredPhotoUrl, setFeaturedPhotoUrl] = useState<string>('');
  const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([]);
  const [playerHighlights, setPlayerHighlights] = useState<PlayerHighlight[]>([]);

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [compressionStats, setCompressionStats] = useState<string>('');

  // Temporary form fields for adding moments and highlights
  const [newMomentTime, setNewMomentTime] = useState('');
  const [newMomentDesc, setNewMomentDesc] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAchievement, setNewPlayerAchievement] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (selectedGame) {
      loadHighlightForGame(selectedGame.id);
    }
  }, [selectedGame]);

  const loadHighlightForGame = async (gameId: string) => {
    const highlight = await getHighlightByGameId(gameId);
    if (highlight) {
      populateForm(highlight);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }

    if (selectedGame?.result) {
      const resultPrefix = selectedGame.result.charAt(0).toUpperCase();
      if (resultPrefix === 'W' || resultPrefix === 'L' || resultPrefix === 'T') {
        setGameResult(resultPrefix as 'W' | 'L' | 'T');
      }
    }
  };

  const loadStandaloneHighlight = (highlight: GameHighlight) => {
    setSelectedGame(null);
    setSelectedHighlight(highlight);
    setIsStandalone(true);
    populateForm(highlight);
    setStandaloneFields({
      opponent: highlight.opponent || '',
      game_date: highlight.game_date || '',
      game_time: highlight.game_time || '',
      game_location: highlight.game_location || '',
      home_away: (highlight.home_away as 'home' | 'away' | '') || '',
      game_type: highlight.game_type || '',
      tournament_id: highlight.tournament_id || '',
    });
    setIsEditing(true);
  };

  const populateForm = (highlight: GameHighlight) => {
    setCurrentHighlight(highlight);
    setTitle(highlight.title || '');
    setSummary(highlight.summary || '');
    setFinalScore(highlight.final_score || '');
    setVideoUrl(highlight.video_url || '');
    setIsPublished(highlight.is_published);
    setIsFeatured(highlight.is_featured || false);
    setPhotos(highlight.photos || []);
    setFeaturedPhotoUrl(highlight.featured_photo_url || '');
    setKeyMoments(highlight.key_moments || []);
    setPlayerHighlights(highlight.player_highlights || []);
  };

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setFinalScore('');
    setGameResult('');
    setVideoUrl('');
    setIsPublished(false);
    setIsFeatured(false);
    setPhotos([]);
    setFeaturedPhotoUrl('');
    setKeyMoments([]);
    setPlayerHighlights([]);
    setCurrentHighlight(null);
    setSelectedHighlight(null);
    setIsEditing(false);
    setIsStandalone(false);
    setStandaloneFields(emptyStandaloneFields);
  };

  const startCreateStandalone = (tournamentId?: string) => {
    resetForm();
    setSelectedGame(null);
    setIsStandalone(true);
    setIsEditing(false);
    if (tournamentId) {
      setStandaloneFields({ ...emptyStandaloneFields, tournament_id: tournamentId, game_type: 'tournament' });
    }
    setSidebarMode('browse');
  };

  // Photo handling
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const uploadId = selectedGame?.id || currentHighlight?.id || 'new-' + Date.now();
    const files = Array.from(e.target.files);

    const invalidFiles = files.filter(f => !isValidImage(f));
    if (invalidFiles.length > 0) {
      setMessage({ type: 'error', text: 'Some files are not valid images' });
      return;
    }

    const oversizedFiles = files.filter(f => !isValidFileSize(f, 50));
    if (oversizedFiles.length > 0) {
      setMessage({ type: 'error', text: 'Some files are too large (max 50MB)' });
      return;
    }

    setUploadingPhoto(true);
    setUploadProgress({ current: 0, total: files.length });
    setCompressionStats('');

    try {
      setMessage({ type: 'success', text: 'Compressing images...' });
      const compressedResults = await compressMultipleImages(
        files,
        { maxWidth: 1920, maxHeight: 1920, quality: 0.85 },
        (current, total) => {
          setCompressionStats(`Compressing ${current}/${total} images...`);
        }
      );

      const totalOriginal = compressedResults.reduce((sum, r) => sum + r.originalSize, 0);
      const totalCompressed = compressedResults.reduce((sum, r) => sum + r.compressedSize, 0);
      const avgCompression = Math.round((1 - totalCompressed / totalOriginal) * 100);
      const filesActuallyCompressed = compressedResults.filter(r => r.compressionRatio > 0).length;

      if (filesActuallyCompressed === 0) {
        setCompressionStats(`Images already optimized: ${formatFileSize(totalOriginal)} (no compression needed)`);
      } else {
        setCompressionStats(
          `Optimized ${filesActuallyCompressed}/${files.length} image(s): ${formatFileSize(totalOriginal)} → ${formatFileSize(totalCompressed)} (${avgCompression}% reduction)`
        );
      }

      const newPhotos: GamePhoto[] = [];
      for (let i = 0; i < compressedResults.length; i++) {
        setUploadProgress({ current: i + 1, total: compressedResults.length });
        setMessage({ type: 'success', text: `Uploading image ${i + 1}/${compressedResults.length}...` });

        const photoUrl = await uploadPhoto(compressedResults[i].file, uploadId);
        newPhotos.push({
          url: photoUrl,
          caption: i === 0 ? photoCaption : '',
          order: photos.length + i,
        });
      }

      setPhotos([...photos, ...newPhotos]);
      setPhotoCaption('');
      setMessage({ type: 'success', text: `Successfully uploaded ${newPhotos.length} photo(s)!` });
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload photos' });
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(null);
      setTimeout(() => setCompressionStats(''), 5000);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    const photo = photos[index];
    try {
      await deletePhoto(photo.url);
      setPhotos(photos.filter((_, i) => i !== index));
      setMessage({ type: 'success', text: 'Photo deleted successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete photo' });
    }
  };

  const addKeyMoment = () => {
    if (!newMomentTime || !newMomentDesc) return;
    setKeyMoments([...keyMoments, { time: newMomentTime, description: newMomentDesc }]);
    setNewMomentTime('');
    setNewMomentDesc('');
  };

  const removeKeyMoment = (index: number) => {
    setKeyMoments(keyMoments.filter((_, i) => i !== index));
  };

  const addPlayerHighlight = () => {
    if (!newPlayerName || !newPlayerAchievement) return;
    setPlayerHighlights([...playerHighlights, { player_name: newPlayerName, achievement: newPlayerAchievement }]);
    setNewPlayerName('');
    setNewPlayerAchievement('');
  };

  const removePlayerHighlight = (index: number) => {
    setPlayerHighlights(playerHighlights.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedGame && !isStandalone) return;

    setSaving(true);
    try {
      const highlightData: Partial<Omit<GameHighlight, 'id' | 'created_at' | 'updated_at'>> = {
        title,
        summary,
        final_score: finalScore,
        video_url: videoUrl,
        is_published: isPublished,
        is_featured: isFeatured,
        photos,
        featured_photo_url: featuredPhotoUrl || null,
        key_moments: keyMoments,
        player_highlights: playerHighlights,
      };

      if (isStandalone) {
        highlightData.game_id = null;
        highlightData.opponent = standaloneFields.opponent;
        highlightData.game_date = standaloneFields.game_date || null;
        highlightData.game_time = standaloneFields.game_time || null;
        highlightData.game_location = standaloneFields.game_location || null;
        highlightData.home_away = (standaloneFields.home_away as 'home' | 'away') || undefined;
        highlightData.game_type = standaloneFields.game_type || null;
        highlightData.tournament_id = standaloneFields.tournament_id || null;
      } else if (selectedGame) {
        highlightData.game_id = selectedGame.id;
      }

      if (isEditing && currentHighlight?.id) {
        await updateHighlight(currentHighlight.id, highlightData);
        setMessage({ type: 'success', text: 'Highlight updated successfully' });
      } else {
        await createHighlight(highlightData);
        setMessage({ type: 'success', text: 'Highlight created successfully' });
      }

      // Update game result in game_schedules if this is a scheduled game
      if (selectedGame && gameResult && finalScore) {
        const resultString = `${gameResult} ${finalScore}`;
        const { error: gameUpdateError } = await supabase
          .from('game_schedules')
          .update({ result: resultString })
          .eq('id', selectedGame.id);

        if (gameUpdateError) {
          console.error('Error updating game result:', gameUpdateError);
          setMessage({ type: 'error', text: 'Highlight saved but failed to update game result' });
        } else {
          setMessage({ type: 'success', text: 'Highlight and game result saved successfully!' });
        }
      }

      if (selectedGame) {
        await loadHighlightForGame(selectedGame.id);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save highlight' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentHighlight?.id) return;
    if (!confirm('Are you sure you want to delete this highlight?')) return;

    try {
      await deleteHighlight(currentHighlight.id);
      setMessage({ type: 'success', text: 'Highlight deleted successfully' });
      resetForm();
      setSelectedGame(null);
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete highlight' });
    }
  };

  // Tournament CRUD
  const handleSaveTournament = async () => {
    try {
      if (editingTournament) {
        await updateTournament(editingTournament.id, tournamentForm);
        setMessage({ type: 'success', text: 'Tournament updated' });
      } else {
        await createTournament(tournamentForm);
        setMessage({ type: 'success', text: 'Tournament created' });
      }
      setTournamentForm({ name: '', start_date: '', end_date: '', location: '', description: '', season: '' });
      setEditingTournament(null);
      setSidebarMode('browse');
    } catch {
      setMessage({ type: 'error', text: 'Failed to save tournament' });
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm('Delete this tournament? Game highlights under it will be unlinked but not deleted.')) return;
    try {
      await deleteTournament(id);
      setMessage({ type: 'success', text: 'Tournament deleted' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete tournament' });
    }
  };

  const toggleTournamentExpanded = (id: string) => {
    setExpandedTournaments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Derived data
  const standaloneHighlights = highlights.filter(h => !h.game_id && !h.tournament_id);
  const getHighlightsForTournament = (tournamentId: string) =>
    highlights.filter(h => h.tournament_id === tournamentId);

  if (gamesLoading || highlightsLoading || tournamentsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const showEditor = selectedGame || isStandalone;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Game Highlights Management</h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => startCreateStandalone()}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
              >
                + New Game
              </button>
              <button
                onClick={() => {
                  setTournamentForm({ name: '', start_date: '', end_date: '', location: '', description: '', season: '' });
                  setEditingTournament(null);
                  setSidebarMode('create-tournament');
                }}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
              >
                + Tournament
              </button>
            </div>

            {/* Tournament Create/Edit Form */}
            {sidebarMode === 'create-tournament' && (
              <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                <h3 className="font-bold text-purple-900 mb-3">
                  {editingTournament ? 'Edit Tournament' : 'New Tournament'}
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tournamentForm.name}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                    placeholder="Tournament Name *"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={tournamentForm.start_date}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="date"
                      value={tournamentForm.end_date}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    value={tournamentForm.location}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, location: e.target.value })}
                    placeholder="Location"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={tournamentForm.season}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, season: e.target.value })}
                    placeholder="Season (e.g. 2025-2026)"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <textarea
                    value={tournamentForm.description}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveTournament}
                      disabled={!tournamentForm.name}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50"
                    >
                      {editingTournament ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={() => { setSidebarMode('browse'); setEditingTournament(null); }}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Tournaments Section */}
              {tournaments.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-2">Tournaments</h3>
                  <div className="space-y-1">
                    {tournaments.map((tournament) => {
                      const tournamentHighlights = getHighlightsForTournament(tournament.id);
                      const isExpanded = expandedTournaments.has(tournament.id);

                      return (
                        <div key={tournament.id} className="border border-purple-200 rounded-lg overflow-hidden">
                          <div className="flex items-center gap-1 bg-purple-50 p-2">
                            <button
                              onClick={() => toggleTournamentExpanded(tournament.id)}
                              className="flex-1 text-left flex items-center gap-2"
                            >
                              <span className="text-purple-600 text-xs">{isExpanded ? '▼' : '▶'}</span>
                              <div>
                                <div className="font-semibold text-sm text-purple-900">{tournament.name}</div>
                                <div className="text-xs text-purple-600">
                                  {tournament.location && `${tournament.location} · `}
                                  {tournamentHighlights.length} game(s)
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => startCreateStandalone(tournament.id)}
                              className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                              title="Add game to tournament"
                            >
                              +
                            </button>
                            <button
                              onClick={() => {
                                setEditingTournament(tournament);
                                setTournamentForm({
                                  name: tournament.name,
                                  start_date: tournament.start_date || '',
                                  end_date: tournament.end_date || '',
                                  location: tournament.location || '',
                                  description: tournament.description || '',
                                  season: tournament.season || '',
                                });
                                setSidebarMode('create-tournament');
                              }}
                              className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                              title="Edit tournament"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDeleteTournament(tournament.id)}
                              className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                              title="Delete tournament"
                            >
                              ✕
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="p-1 space-y-1">
                              {tournamentHighlights.length === 0 ? (
                                <div className="text-xs text-gray-400 p-2 text-center">No games yet</div>
                              ) : (
                                tournamentHighlights.map((h) => (
                                  <button
                                    key={h.id}
                                    onClick={() => loadStandaloneHighlight(h)}
                                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                      currentHighlight?.id === h.id
                                        ? 'bg-steel-blue text-white'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                  >
                                    <div className="font-semibold">
                                      vs {h.opponent || 'TBD'}
                                      {h.is_featured && <span className="ml-1 text-yellow-400">★</span>}
                                    </div>
                                    <div className="text-xs opacity-80">
                                      {h.game_date && new Date(h.game_date + 'T00:00:00').toLocaleDateString()}
                                      {h.final_score && ` · ${h.final_score}`}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Standalone Games Section */}
              {standaloneHighlights.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2">Standalone Games</h3>
                  <div className="space-y-1">
                    {standaloneHighlights.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => loadStandaloneHighlight(h)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentHighlight?.id === h.id
                            ? 'bg-steel-blue text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">
                              vs {h.opponent || 'Unknown'}
                              {h.is_featured && <span className="ml-1 text-yellow-400">★</span>}
                            </div>
                            <div className="text-sm opacity-80">
                              {h.game_date && new Date(h.game_date + 'T00:00:00').toLocaleDateString()}
                              {h.game_type && ` · ${h.game_type}`}
                            </div>
                          </div>
                          {h.is_published && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Published</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Games Section */}
              <div>
                <h3 className="text-sm font-bold text-steel-blue uppercase tracking-wide mb-2">Scheduled Games</h3>
                <div className="space-y-1">
                  {games.map((game) => {
                    const hasHighlight = highlights.some((h) => h.game_id === game.id);
                    const dateString = game.game_date || game.date || '';
                    const gameDate = new Date(dateString + 'T00:00:00');
                    const isPastGame = gameDate < new Date();
                    const formattedDate = `${gameDate.getMonth() + 1}/${gameDate.getDate()}/${gameDate.getFullYear()}`;

                    return (
                      <button
                        key={game.id}
                        onClick={() => {
                          setSelectedGame(game);
                          setIsStandalone(false);
                          setSelectedHighlight(null);
                          setStandaloneFields(emptyStandaloneFields);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedGame?.id === game.id
                            ? 'bg-steel-blue text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">vs {game.opponent}</div>
                            <div className="text-sm opacity-80">{formattedDate}</div>
                            {game.result && <div className="text-sm opacity-80">Score: {game.result}</div>}
                          </div>
                          {hasHighlight && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Has Highlight</span>
                          )}
                        </div>
                        {!isPastGame && (
                          <div className="text-xs mt-1 opacity-70">Upcoming Game</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Editor */}
        <div className="md:col-span-2">
          {showEditor ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Highlight' : 'Create Highlight'}
                </h2>
                {isEditing && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Highlight
                  </button>
                )}
              </div>

              {/* Game Info Banner */}
              {selectedGame && !isStandalone && (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <h3 className="font-semibold">Game: Wings of Steel vs {selectedGame.opponent}</h3>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const dateString = selectedGame.game_date || selectedGame.date || '';
                      const gameDate = new Date(dateString + 'T00:00:00');
                      return `${gameDate.getMonth() + 1}/${gameDate.getDate()}/${gameDate.getFullYear()}`;
                    })()} at {selectedGame.location}
                  </p>
                </div>
              )}

              {/* Standalone Game Fields */}
              {isStandalone && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-3">Game Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opponent *</label>
                      <input
                        type="text"
                        value={standaloneFields.opponent}
                        onChange={(e) => setStandaloneFields({ ...standaloneFields, opponent: e.target.value })}
                        placeholder="e.g., Hammerheads"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Game Date</label>
                      <input
                        type="date"
                        value={standaloneFields.game_date}
                        onChange={(e) => setStandaloneFields({ ...standaloneFields, game_date: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Game Time</label>
                      <input
                        type="time"
                        value={standaloneFields.game_time}
                        onChange={(e) => setStandaloneFields({ ...standaloneFields, game_time: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={standaloneFields.game_location}
                        onChange={(e) => setStandaloneFields({ ...standaloneFields, game_location: e.target.value })}
                        placeholder="e.g., Amelia Park Arena"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Home / Away</label>
                      <select
                        value={standaloneFields.home_away}
                        onChange={(e) => setStandaloneFields({ ...standaloneFields, home_away: e.target.value as '' | 'home' | 'away' })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">-- Select --</option>
                        <option value="home">Home</option>
                        <option value="away">Away</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
                      <select
                        value={standaloneFields.game_type}
                        onChange={(e) => setStandaloneFields({ ...standaloneFields, game_type: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">-- Select --</option>
                        <option value="tournament">Tournament</option>
                        <option value="exhibition">Exhibition</option>
                        <option value="scrimmage">Scrimmage</option>
                        <option value="regular">Regular Season</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tournament</label>
                      <select
                        value={standaloneFields.tournament_id}
                        onChange={(e) => setStandaloneFields({ ...standaloneFields, tournament_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">None</option>
                        {tournaments.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Dominant Victory Over Hammerheads"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Final Score */}
                <div>
                  <label className="block font-semibold mb-2">Final Score</label>
                  <input
                    type="text"
                    value={finalScore}
                    onChange={(e) => setFinalScore(e.target.value)}
                    placeholder="e.g., 5-2"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Game Result */}
                <div>
                  <label className="block font-semibold mb-2">Game Result</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gameResult" value="W" checked={gameResult === 'W'}
                        onChange={(e) => setGameResult(e.target.value as 'W')} className="w-5 h-5" />
                      <span className="font-medium text-green-700">Win</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gameResult" value="L" checked={gameResult === 'L'}
                        onChange={(e) => setGameResult(e.target.value as 'L')} className="w-5 h-5" />
                      <span className="font-medium text-red-700">Loss</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gameResult" value="T" checked={gameResult === 'T'}
                        onChange={(e) => setGameResult(e.target.value as 'T')} className="w-5 h-5" />
                      <span className="font-medium text-gray-700">Tie</span>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block font-semibold mb-2">Game Summary</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write a summary of the game..."
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block font-semibold mb-2">Video URL (Optional)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Key Moments */}
                <div>
                  <label className="block font-semibold mb-2">Key Moments</label>
                  <div className="space-y-2">
                    {keyMoments.map((moment, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                        <span className="font-semibold">{moment.time}:</span>
                        <span className="flex-1">{moment.description}</span>
                        <button onClick={() => removeKeyMoment(index)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newMomentTime} onChange={(e) => setNewMomentTime(e.target.value)}
                      placeholder="Time (e.g., 1st Period 5:23)" className="px-4 py-2 border rounded-lg" />
                    <input type="text" value={newMomentDesc} onChange={(e) => setNewMomentDesc(e.target.value)}
                      placeholder="Description" className="flex-1 px-4 py-2 border rounded-lg" />
                    <button onClick={addKeyMoment}
                      className="px-4 py-2 bg-steel-blue text-white rounded-lg hover:bg-blue-700">Add</button>
                  </div>
                </div>

                {/* Player Highlights */}
                <div>
                  <label className="block font-semibold mb-2">Player Highlights</label>
                  <div className="space-y-2">
                    {playerHighlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                        <span className="font-semibold">{highlight.player_name}:</span>
                        <span className="flex-1">{highlight.achievement}</span>
                        <button onClick={() => removePlayerHighlight(index)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Player Name" className="px-4 py-2 border rounded-lg" />
                    <input type="text" value={newPlayerAchievement} onChange={(e) => setNewPlayerAchievement(e.target.value)}
                      placeholder="Achievement (e.g., 2 goals, 1 assist)" className="flex-1 px-4 py-2 border rounded-lg" />
                    <button onClick={addPlayerHighlight}
                      className="px-4 py-2 bg-steel-blue text-white rounded-lg hover:bg-blue-700">Add</button>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className="block font-semibold mb-2">Photos</label>

                  {featuredPhotoUrl && (
                    <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <img src={featuredPhotoUrl} alt="Featured"
                            className="w-32 h-24 object-cover rounded-lg ring-2 ring-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">★</span>
                            <h3 className="font-bold text-lg text-yellow-900">Featured Photo for Card</h3>
                          </div>
                          <p className="text-sm text-yellow-800">This photo will appear on the game highlight card in the gallery.</p>
                          <button onClick={() => setFeaturedPhotoUrl('')}
                            className="mt-2 text-sm text-yellow-900 underline hover:text-yellow-700">
                            Clear featured photo (use first photo instead)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadProgress && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-900">
                          {compressionStats || `Uploading ${uploadProgress.current}/${uploadProgress.total}...`}
                        </span>
                        <span className="text-sm text-blue-700">
                          {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img src={photo.url} alt={photo.caption || `Photo ${index + 1}`}
                          className={`w-full h-40 object-cover rounded-lg ${
                            featuredPhotoUrl === photo.url ? 'ring-4 ring-yellow-400' : ''}`} />
                        <button onClick={() => handleDeletePhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Delete
                        </button>
                        <button onClick={() => setFeaturedPhotoUrl(photo.url)}
                          className={`absolute bottom-2 left-2 px-2 py-1 rounded text-sm transition-all ${
                            featuredPhotoUrl === photo.url
                              ? 'bg-yellow-400 text-black font-bold'
                              : 'bg-black/70 text-white opacity-0 group-hover:opacity-100'}`}>
                          {featuredPhotoUrl === photo.url ? '★ Featured' : 'Set as Featured'}
                        </button>
                        {photo.caption && <div className="text-xs text-gray-600 mt-1">{photo.caption}</div>}
                      </div>
                    ))}
                  </div>

                  {photos.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Featured Photo:</span> Click "Set as Featured" on any photo to use it for the game highlight card.
                        {featuredPhotoUrl ? ' Current featured photo has a yellow border.' : ' First photo will be used by default if none selected.'}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="text" value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="Caption for first photo (optional)" className="flex-1 px-4 py-2 border rounded-lg" />
                      <label className="px-4 py-2 bg-steel-blue text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                        {uploadingPhoto ? 'Processing...' : 'Upload Photos'}
                        <input type="file" accept="image/*" multiple onChange={handlePhotoUpload}
                          disabled={uploadingPhoto} className="hidden" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      Select multiple photos at once. Large images will be automatically resized and compressed. Max 50MB per file.
                    </p>
                  </div>
                </div>

                {/* Published + Featured Status */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="published" checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)} className="w-5 h-5" />
                    <label htmlFor="published" className="font-semibold">
                      Publish (make visible to public)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="featured" checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-yellow-500" />
                    <label htmlFor="featured" className="font-semibold text-yellow-700">
                      ★ Featured (show on homepage)
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-4 pt-4">
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50">
                    {saving ? 'Saving...' : isEditing ? 'Update Highlight' : 'Create Highlight'}
                  </button>
                  <button onClick={() => { resetForm(); setSelectedGame(null); }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
              <p className="text-lg">Select a game from the sidebar or create a new one to manage highlights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
