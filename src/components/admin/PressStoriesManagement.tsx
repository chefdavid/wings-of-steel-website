import { useEffect, useMemo, useState } from 'react';
import { FaStar, FaPlus, FaTrash, FaImage, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { usePressStories, slugify } from '../../hooks/usePressStories';
import { compressImage, isValidImage, isValidFileSize } from '../../utils/imageCompression';
import type { PressStory, GamePhoto } from '../../types/database';

const todayISO = () => new Date().toISOString().slice(0, 10);

interface FormState {
  id: string | null;
  title: string;
  subtitle: string;
  slug: string;
  author: string;
  published_at: string;
  body: string;
  cover_photo_url: string;
  photos: GamePhoto[];
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
}

const emptyForm: FormState = {
  id: null,
  title: '',
  subtitle: '',
  slug: '',
  author: '',
  published_at: todayISO(),
  body: '',
  cover_photo_url: '',
  photos: [],
  is_published: false,
  is_featured: false,
  display_order: 0,
};

export default function PressStoriesManagement() {
  const {
    stories,
    loading,
    fetchStories,
    createStory,
    updateStory,
    deleteStory,
    uploadStoryPhoto,
    deleteStoryPhoto,
  } = usePressStories();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const isEditing = form.id !== null;

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  // Auto-derive slug from title until the user edits it directly
  useEffect(() => {
    if (slugTouched || isEditing) return;
    setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, slugTouched, isEditing]);

  const sortedStories = useMemo(
    () =>
      [...stories].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        const aDate = a.published_at || a.created_at;
        const bDate = b.published_at || b.created_at;
        return bDate.localeCompare(aDate);
      }),
    [stories]
  );

  const loadStory = (s: PressStory) => {
    setForm({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle || '',
      slug: s.slug,
      author: s.author || '',
      published_at: s.published_at || '',
      body: s.body || '',
      cover_photo_url: s.cover_photo_url || '',
      photos: s.photos || [],
      is_published: s.is_published,
      is_featured: s.is_featured,
      display_order: s.display_order,
    });
    setSlugTouched(true);
  };

  const startNew = () => {
    setForm({ ...emptyForm });
    setSlugTouched(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!isValidImage(file) || !isValidFileSize(file, 50)) {
      setMessage({ type: 'error', text: 'Choose an image under 50MB.' });
      return;
    }
    try {
      setUploading(true);
      const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
      const storyId = form.id || `draft-${Date.now()}`;
      const url = await uploadStoryPhoto(compressed.file, storyId);
      setForm((f) => ({ ...f, cover_photo_url: url }));
      setMessage({ type: 'success', text: 'Cover photo uploaded.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    const invalid = files.find((f) => !isValidImage(f) || !isValidFileSize(f, 50));
    if (invalid) {
      setMessage({ type: 'error', text: 'All files must be images under 50MB.' });
      return;
    }
    try {
      setUploading(true);
      const storyId = form.id || `draft-${Date.now()}`;
      const newPhotos: GamePhoto[] = [];
      for (const file of files) {
        const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
        const url = await uploadStoryPhoto(compressed.file, storyId);
        newPhotos.push({ url, caption: '', order: form.photos.length + newPhotos.length });
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...newPhotos] }));
      setMessage({ type: 'success', text: `Added ${newPhotos.length} photo${newPhotos.length === 1 ? '' : 's'}.` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (index: number) => {
    const photo = form.photos[index];
    if (photo?.url) {
      await deleteStoryPhoto(photo.url);
    }
    setForm((f) => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i })),
    }));
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    setForm((f) => ({
      ...f,
      photos: f.photos.map((p, i) => (i === index ? { ...p, caption } : p)),
    }));
  };

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        slug: form.slug.trim() || form.title.trim(),
        author: form.author.trim(),
        published_at: form.published_at || null,
        body: form.body,
        cover_photo_url: form.cover_photo_url,
        photos: form.photos,
        is_published: publish !== undefined ? publish : form.is_published,
        is_featured: form.is_featured,
        display_order: form.display_order,
      };
      if (isEditing && form.id) {
        const updated = await updateStory(form.id, payload);
        loadStory(updated);
        setMessage({ type: 'success', text: 'Story saved.' });
      } else {
        const created = await createStory(payload);
        loadStory(created);
        setMessage({ type: 'success', text: 'Story created.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    try {
      await deleteStory(form.id);
      startNew();
      setMessage({ type: 'success', text: 'Story deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar list */}
      <aside className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Stories</h3>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-1 text-sm bg-steel-blue text-white px-3 py-1.5 rounded hover:bg-dark-steel transition"
          >
            <FaPlus /> New
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : sortedStories.length === 0 ? (
          <p className="text-sm text-gray-500">No stories yet. Click <strong>New</strong> to write one.</p>
        ) : (
          <ul className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {sortedStories.map((s) => {
              const active = form.id === s.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => loadStory(s)}
                    className={`w-full text-left rounded p-2 transition border ${
                      active ? 'bg-steel-blue/10 border-steel-blue' : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{s.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {s.published_at || s.created_at.slice(0, 10)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs">
                        {s.is_featured && <FaStar className="text-yellow-500" title="Featured on home" />}
                        {s.is_published ? (
                          <span className="text-green-600 font-semibold">Live</span>
                        ) : (
                          <span className="text-gray-400">Draft</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* Editor */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Story' : 'New Story'}
          </h3>
          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-sm bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded hover:bg-red-100"
              >
                <FaTrash /> Delete
              </button>
            )}
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200"
            >
              <FaTimes /> Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="USA Hockey Nationals — 1st Place 2026"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Three years running. A recap of the road to gold."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">URL slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm({ ...form, slug: slugify(e.target.value) });
              }}
              placeholder="nationals-2026-champions"
              className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-steel-blue focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Story will live at <code>/stories/{form.slug || 'your-slug'}</code></p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Published date</label>
            <input
              type="date"
              value={form.published_at || ''}
              onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Author / Byline</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Coach Dave"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Display order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value, 10) || 0 })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers show first.</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cover photo</label>
          <div className="flex items-start gap-4">
            <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
              {form.cover_photo_url ? (
                <img src={form.cover_photo_url} alt="cover" className="w-full h-full object-cover" />
              ) : (
                <FaImage className="text-gray-300 text-3xl" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="inline-flex items-center gap-2 text-sm bg-steel-blue text-white px-3 py-2 rounded cursor-pointer hover:bg-dark-steel">
                <FaImage /> {form.cover_photo_url ? 'Replace cover' : 'Upload cover'}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
              </label>
              {form.cover_photo_url && (
                <button
                  onClick={() => setForm({ ...form, cover_photo_url: '' })}
                  className="block text-sm text-red-600 hover:underline"
                >
                  Remove cover
                </button>
              )}
              <input
                type="text"
                value={form.cover_photo_url}
                onChange={(e) => setForm({ ...form, cover_photo_url: e.target.value })}
                placeholder="…or paste an image URL"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-steel-blue focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Story body</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={14}
            placeholder={`Write the story here.\n\nLeave a blank line between paragraphs.\n\nReaders will see this on the story page.`}
            className="w-full border border-gray-300 rounded px-3 py-2 font-serif text-base leading-relaxed focus:ring-2 focus:ring-steel-blue focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Plain text. Separate paragraphs with a blank line. Photos below will appear after the body.
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Photo gallery</label>
          <label className="inline-flex items-center gap-2 text-sm bg-steel-blue text-white px-3 py-2 rounded cursor-pointer hover:bg-dark-steel mb-2">
            <FaPlus /> Add photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploading} />
          </label>
          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {form.photos.map((photo, i) => (
                <div key={`${photo.url}-${i}`} className="relative bg-gray-50 rounded overflow-hidden border border-gray-200">
                  <img src={photo.url} alt="" className="w-full h-32 object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700"
                    title="Remove photo"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={(e) => updatePhotoCaption(i, e.target.value)}
                    placeholder="Caption (optional)"
                    className="w-full border-t border-gray-200 px-2 py-1 text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            />
            <FaStar className="text-yellow-500" /> Feature on home page
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            {form.is_published ? <FaEye className="text-green-600" /> : <FaEyeSlash className="text-gray-400" />}
            Published
          </label>

          <div className="flex-1" />

          <button
            onClick={() => handleSave(false)}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            <FaSave /> Save draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded hover:bg-dark-steel disabled:opacity-50"
          >
            <FaEye /> Save &amp; publish
          </button>
        </div>

        {(saving || uploading) && (
          <p className="text-sm text-gray-500 mt-2">
            {uploading ? 'Uploading photos…' : 'Saving…'}
          </p>
        )}

        <div className="mt-4 text-xs text-gray-400">
          Tip: After saving and publishing, refresh the home page to see the story under <strong>The Wings Press</strong>.
        </div>

        <button
          onClick={fetchStories}
          className="hidden"
          aria-hidden="true"
        />
      </section>
    </div>
  );
}
