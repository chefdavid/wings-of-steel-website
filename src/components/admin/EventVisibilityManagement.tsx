import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface EventVisibility {
  id: string;
  event_key: string;
  event_name: string;
  is_visible: boolean;
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
      const { data, error: fetchError } = await supabase
        .from('event_visibility')
        .select('*')
        .order('event_name', { ascending: true });

      if (fetchError) throw fetchError;

      setEvents(data || []);
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
    
    try {
      const { error: updateError } = await supabase
        .from('event_visibility')
        .update({ is_visible: !currentVisibility })
        .eq('event_key', eventKey);

      if (updateError) throw updateError;

      // Update local state immediately
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.event_key === eventKey
            ? { ...event, is_visible: !currentVisibility }
            : event
        )
      );

      setSuccess(
        `${events.find(e => e.event_key === eventKey)?.event_name} is now ${
          !currentVisibility ? 'visible' : 'hidden'
        } on the frontend`
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating visibility:', err);
      setError(err.message || 'Failed to update visibility');
      // Revert on error
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
                    <h3 className="text-lg font-semibold text-dark-steel mb-1">
                      {event.event_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Event Key: <code className="bg-gray-100 px-2 py-1 rounded">{event.event_key}</code>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Last updated: {new Date(event.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
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
            <li>Admin access to event management is not affected by visibility settings</li>
            <li>Changes take effect immediately on the frontend</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventVisibilityManagement;

