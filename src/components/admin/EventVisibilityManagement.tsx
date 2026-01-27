import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface EventVisibility {
  id: string;
  event_key: string;
  event_name: string;
  is_visible: boolean;
  is_featured: boolean;
  updated_at: string;
}

const EventVisibilityManagement = () => {
  const [events, setEvents] = useState<EventVisibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      // Use admin client for admin operations (bypasses RLS)
      const dbClient = supabaseAdmin || supabase;
      console.log('🔐 Fetching events using:', supabaseAdmin ? 'Admin (service role)' : 'Regular (anon key)');
      console.log('🔐 Admin client available:', !!supabaseAdmin);

      const { data, error: fetchError } = await dbClient
        .from('event_visibility')
        .select('*')
        .order('event_name', { ascending: true });

      if (fetchError) throw fetchError;

      console.log('📊 Fetched events:', data);
      // Ensure is_featured defaults to false if column doesn't exist yet
      setEvents((data || []).map(e => ({ ...e, is_featured: e.is_featured ?? false })));
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load event visibility settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (eventKey: string, currentVisibility: boolean) => {
    setError('');
    setSuccess('');

    const eventName = events.find(e => e.event_key === eventKey)?.event_name || 'Event';
    const newVisibility = !currentVisibility;

    try {
      // Use admin client for admin operations (bypasses RLS)
      const dbClient = supabaseAdmin || supabase;
      console.log('🔐 Updating visibility using:', supabaseAdmin ? 'Admin (service role)' : 'Regular (anon key)');
      console.log('🔄 Updating event:', eventKey, 'from', currentVisibility, 'to', newVisibility);

      // If hiding an event that is featured, unfeature it first
      const event = events.find(e => e.event_key === eventKey);
      if (!newVisibility && event?.is_featured) {
        await dbClient
          .from('event_visibility')
          .update({ is_featured: false })
          .eq('event_key', eventKey);
      }

      // Update and return the updated data to verify the update succeeded
      const { data: updatedData, error: updateError } = await dbClient
        .from('event_visibility')
        .update({ is_visible: newVisibility })
        .eq('event_key', eventKey)
        .select();

      console.log('📝 Update response:', { updatedData, updateError });

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      // Check if any rows were actually updated
      if (!updatedData || updatedData.length === 0) {
        console.error('❌ No rows updated. This usually means RLS blocked the update.');
        throw new Error('No rows were updated. The service role key may not be configured. Please check your .env file has VITE_SUPABASE_SERVICE_ROLE_KEY set.');
      }

      console.log('✅ Update successful:', updatedData);

      // Refetch from database to ensure we have the latest data
      await fetchEvents();

      setSuccess(
        `${eventName} is now ${
          newVisibility ? 'visible' : 'hidden'
        } on the frontend`
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Error updating visibility:', err);
      setError(err.message || 'Failed to update visibility');
      // Revert on error by refetching
      fetchEvents();
    }
  };

  const toggleFeatured = async (eventKey: string, currentFeatured: boolean) => {
    setError('');
    setSuccess('');

    const eventName = events.find(e => e.event_key === eventKey)?.event_name || 'Event';
    const newFeatured = !currentFeatured;

    try {
      const dbClient = supabaseAdmin || supabase;

      if (newFeatured) {
        // Unfeature all others first
        await dbClient
          .from('event_visibility')
          .update({ is_featured: false })
          .neq('event_key', eventKey);
      }

      // Toggle the selected event
      const { data: updatedData, error: updateError } = await dbClient
        .from('event_visibility')
        .update({ is_featured: newFeatured })
        .eq('event_key', eventKey)
        .select();

      if (updateError) throw updateError;
      if (!updatedData || updatedData.length === 0) {
        throw new Error('No rows were updated. Check service role key configuration.');
      }

      await fetchEvents();

      setSuccess(
        newFeatured
          ? `${eventName} is now featured in the navigation bar`
          : `${eventName} is no longer featured`
      );
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Error updating featured:', err);
      setError(err.message || 'Failed to update featured status');
      fetchEvents();
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading event visibility settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark-steel mb-2">Event Visibility Management</h1>
          <p className="text-gray-600">
            Control which events are visible to visitors on the frontend. Hidden events will not appear in navigation or be accessible via direct links.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {events.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p>No events found. Please run the database setup script.</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-dark-steel">
                        {event.event_name}
                      </h3>
                      {event.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star size={12} className="fill-yellow-500" />
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Event Key: <code className="bg-gray-100 px-2 py-1 rounded">{event.event_key}</code>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Last updated: {new Date(event.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Featured toggle */}
                    <button
                      onClick={() => toggleFeatured(event.event_key, event.is_featured)}
                      disabled={!event.is_visible}
                      title={
                        !event.is_visible
                          ? 'Event must be visible to be featured'
                          : event.is_featured
                          ? 'Remove from featured nav CTA'
                          : 'Feature in navigation bar'
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        !event.is_visible
                          ? 'text-gray-300 cursor-not-allowed'
                          : event.is_featured
                          ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                      }`}
                    >
                      <Star
                        size={20}
                        className={event.is_featured ? 'fill-yellow-500' : ''}
                      />
                    </button>

                    {/* Visibility badge */}
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          event.is_visible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {event.is_visible ? (
                          <>
                            <Eye size={16} />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff size={16} />
                            Hidden
                          </>
                        )}
                      </div>
                    </div>

                    {/* Visibility toggle button */}
                    <button
                      onClick={() => toggleVisibility(event.event_key, event.is_visible)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        event.is_visible
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {event.is_visible ? (
                        <span className="flex items-center gap-2">
                          <EyeOff size={18} />
                          Hide
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Eye size={18} />
                          Show
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>When an event is <strong>hidden</strong>, it will not appear in the navigation menu</li>
            <li>Direct links to hidden events will redirect to the home page</li>
            <li>The <strong>featured</strong> event (star icon) gets a highlighted CTA button in the navigation bar</li>
            <li>Only one event can be featured at a time — featuring a new one unfeatures the previous</li>
            <li>An event must be visible before it can be featured</li>
            <li>Admin access to event management is not affected by visibility settings</li>
            <li>Changes take effect immediately on the frontend</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventVisibilityManagement;
