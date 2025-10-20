import { useState, useEffect } from 'react';
import { useGameSchedule, useGameHighlights } from '../../hooks';
import type { Game, GameHighlight, GamePhoto, KeyMoment, PlayerHighlight } from '../../types/database';
import { compressMultipleImages, formatFileSize, isValidImage, isValidFileSize } from '../../utils/imageCompression';
import { supabase } from '../../lib/supabaseClient';

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

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentHighlight, setCurrentHighlight] = useState<Partial<GameHighlight> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [finalScore, setFinalScore] = useState('');
  const [gameResult, setGameResult] = useState<'W' | 'L' | 'T' | ''>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
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
      setCurrentHighlight(highlight);
      setTitle(highlight.title || '');
      setSummary(highlight.summary || '');
      setFinalScore(highlight.final_score || '');
      setVideoUrl(highlight.video_url || '');
      setIsPublished(highlight.is_published);
      setPhotos(highlight.photos || []);
      setFeaturedPhotoUrl(highlight.featured_photo_url || '');
      setKeyMoments(highlight.key_moments || []);
      setPlayerHighlights(highlight.player_highlights || []);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }

    // Load game result from the selected game
    if (selectedGame?.result) {
      const resultPrefix = selectedGame.result.charAt(0).toUpperCase();
      if (resultPrefix === 'W' || resultPrefix === 'L' || resultPrefix === 'T') {
        setGameResult(resultPrefix as 'W' | 'L' | 'T');
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setFinalScore('');
    setGameResult('');
    setVideoUrl('');
    setIsPublished(false);
    setPhotos([]);
    setFeaturedPhotoUrl('');
    setKeyMoments([]);
    setPlayerHighlights([]);
    setCurrentHighlight(null);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedGame) return;

    const files = Array.from(e.target.files);

    // Validate files
    const invalidFiles = files.filter(f => !isValidImage(f));
    if (invalidFiles.length > 0) {
      setMessage({ type: 'error', text: 'Some files are not valid images' });
      return;
    }

    const oversizedFiles = files.filter(f => !isValidFileSize(f, 50)); // Max 50MB before compression
    if (oversizedFiles.length > 0) {
      setMessage({ type: 'error', text: 'Some files are too large (max 50MB)' });
      return;
    }

    setUploadingPhoto(true);
    setUploadProgress({ current: 0, total: files.length });
    setCompressionStats('');

    try {
      // Compress all images first
      setMessage({ type: 'success', text: 'Compressing images...' });
      const compressedResults = await compressMultipleImages(
        files,
        {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
        },
        (current, total) => {
          setCompressionStats(`Compressing ${current}/${total} images...`);
        }
      );

      // Calculate total compression stats
      const totalOriginal = compressedResults.reduce((sum, r) => sum + r.originalSize, 0);
      const totalCompressed = compressedResults.reduce((sum, r) => sum + r.compressedSize, 0);
      const avgCompression = Math.round((1 - totalCompressed / totalOriginal) * 100);
      const filesActuallyCompressed = compressedResults.filter(r => r.compressionRatio > 0).length;

      if (filesActuallyCompressed === 0) {
        setCompressionStats(
          `Images already optimized: ${formatFileSize(totalOriginal)} (no compression needed)`
        );
      } else {
        setCompressionStats(
          `Optimized ${filesActuallyCompressed}/${files.length} image(s): ${formatFileSize(totalOriginal)} → ${formatFileSize(totalCompressed)} (${avgCompression}% reduction)`
        );
      }

      // Upload compressed images
      const newPhotos: GamePhoto[] = [];
      for (let i = 0; i < compressedResults.length; i++) {
        setUploadProgress({ current: i + 1, total: compressedResults.length });
        setMessage({ type: 'success', text: `Uploading image ${i + 1}/${compressedResults.length}...` });

        const photoUrl = await uploadPhoto(compressedResults[i].file, selectedGame.id);
        newPhotos.push({
          url: photoUrl,
          caption: i === 0 ? photoCaption : '', // Only first photo gets the caption
          order: photos.length + i,
        });
      }

      setPhotos([...photos, ...newPhotos]);
      setPhotoCaption('');
      setMessage({
        type: 'success',
        text: `Successfully uploaded ${newPhotos.length} photo(s)! ${compressionStats}`
      });

      // Clear the file input
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
    } catch (error) {
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
    if (!selectedGame) return;

    setSaving(true);
    try {
      const highlightData = {
        title,
        summary,
        final_score: finalScore,
        video_url: videoUrl,
        is_published: isPublished,
        photos,
        featured_photo_url: featuredPhotoUrl || null,
        key_moments: keyMoments,
        player_highlights: playerHighlights,
      };

      if (isEditing && currentHighlight?.id) {
        await updateHighlight(currentHighlight.id, highlightData);
        setMessage({ type: 'success', text: 'Highlight updated successfully' });
      } else {
        await createHighlight(selectedGame.id, highlightData);
        setMessage({ type: 'success', text: 'Highlight created successfully' });
      }

      // Update game result in game_schedules if provided
      if (gameResult && finalScore) {
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

      await loadHighlightForGame(selectedGame.id);
    } catch (error) {
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
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete highlight' });
    }
  };

  if (gamesLoading || highlightsLoading) {
    return <div className="p-6">Loading...</div>;
  }

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
        {/* Game Selection Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-bold mb-4">Select Game</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {games.map((game) => {
                const hasHighlight = highlights.some((h) => h.game_id === game.id);
                const dateString = game.game_date || game.date || '';
                const gameDate = new Date(dateString + 'T00:00:00');
                const isPastGame = gameDate < new Date();

                // Format date properly to avoid timezone issues
                const formattedDate = `${gameDate.getMonth() + 1}/${gameDate.getDate()}/${gameDate.getFullYear()}`;

                return (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedGame?.id === game.id
                        ? 'bg-steel-blue text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">vs {game.opponent}</div>
                        <div className="text-sm opacity-80">
                          {formattedDate}
                        </div>
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

        {/* Highlight Editor */}
        <div className="md:col-span-2">
          {selectedGame ? (
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

              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold">Game: Wings of Steel vs {selectedGame.opponent}</h3>
                <p className="text-sm text-gray-600">
                  {(() => {
                    const dateString = selectedGame.game_date || selectedGame.date || '';
                    const gameDate = new Date(dateString + 'T00:00:00');
                    return `${gameDate.getMonth() + 1}/${gameDate.getDate()}/${gameDate.getFullYear()}`;
                  })()} at{' '}
                  {selectedGame.location}
                </p>
              </div>

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
                      <input
                        type="radio"
                        name="gameResult"
                        value="W"
                        checked={gameResult === 'W'}
                        onChange={(e) => setGameResult(e.target.value as 'W')}
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-green-700">Win</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gameResult"
                        value="L"
                        checked={gameResult === 'L'}
                        onChange={(e) => setGameResult(e.target.value as 'L')}
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-red-700">Loss</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gameResult"
                        value="T"
                        checked={gameResult === 'T'}
                        onChange={(e) => setGameResult(e.target.value as 'T')}
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-gray-700">Tie</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    This will update the victories counter on the schedule page. Result format: "{gameResult || 'W'} {finalScore || '5-2'}"
                  </p>
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
                        <button
                          onClick={() => removeKeyMoment(index)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newMomentTime}
                      onChange={(e) => setNewMomentTime(e.target.value)}
                      placeholder="Time (e.g., 1st Period 5:23)"
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={newMomentDesc}
                      onChange={(e) => setNewMomentDesc(e.target.value)}
                      placeholder="Description"
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={addKeyMoment}
                      className="px-4 py-2 bg-steel-blue text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
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
                        <button
                          onClick={() => removePlayerHighlight(index)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Player Name"
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={newPlayerAchievement}
                      onChange={(e) => setNewPlayerAchievement(e.target.value)}
                      placeholder="Achievement (e.g., 2 goals, 1 assist)"
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={addPlayerHighlight}
                      className="px-4 py-2 bg-steel-blue text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className="block font-semibold mb-2">Photos</label>

                  {/* Featured Photo Preview */}
                  {featuredPhotoUrl && (
                    <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={featuredPhotoUrl}
                            alt="Featured"
                            className="w-32 h-24 object-cover rounded-lg ring-2 ring-yellow-400"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">★</span>
                            <h3 className="font-bold text-lg text-yellow-900">Featured Photo for Card</h3>
                          </div>
                          <p className="text-sm text-yellow-800">
                            This photo will appear on the game highlight card in the gallery.
                          </p>
                          <button
                            onClick={() => setFeaturedPhotoUrl('')}
                            className="mt-2 text-sm text-yellow-900 underline hover:text-yellow-700"
                          >
                            Clear featured photo (use first photo instead)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
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
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Photo Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Photo ${index + 1}`}
                          className={`w-full h-40 object-cover rounded-lg ${
                            featuredPhotoUrl === photo.url ? 'ring-4 ring-yellow-400' : ''
                          }`}
                        />
                        <button
                          onClick={() => handleDeletePhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setFeaturedPhotoUrl(photo.url)}
                          className={`absolute bottom-2 left-2 px-2 py-1 rounded text-sm transition-all ${
                            featuredPhotoUrl === photo.url
                              ? 'bg-yellow-400 text-black font-bold'
                              : 'bg-black/70 text-white opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {featuredPhotoUrl === photo.url ? '★ Featured' : 'Set as Featured'}
                        </button>
                        {photo.caption && (
                          <div className="text-xs text-gray-600 mt-1">{photo.caption}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {photos.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">📌 Featured Photo:</span> Click "Set as Featured" on any photo to use it for the game highlight card.
                        {featuredPhotoUrl ? ' Current featured photo has a yellow border.' : ' First photo will be used by default if none selected.'}
                      </p>
                    </div>
                  )}

                  {/* Upload Controls */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="Caption for first photo (optional)"
                        className="flex-1 px-4 py-2 border rounded-lg"
                      />
                      <label className="px-4 py-2 bg-steel-blue text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                        {uploadingPhoto ? 'Processing...' : 'Upload Photos'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      📸 Select multiple photos at once. Large images will be automatically resized and compressed (small optimized images remain unchanged). Max 50MB per file.
                    </p>
                  </div>
                </div>

                {/* Published Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label htmlFor="published" className="font-semibold">
                    Publish (make visible to public)
                  </label>
                </div>

                {/* Save Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : isEditing ? 'Update Highlight' : 'Create Highlight'}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setSelectedGame(null);
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
              <p className="text-lg">Select a game from the sidebar to manage its highlights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
