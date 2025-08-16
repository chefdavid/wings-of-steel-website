import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, XCircle, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface Feedback {
  id: string;
  text: string;
  url: string;
  selector: string;
  position_x: number;
  position_y: number;
  viewport_width: number;
  viewport_height: number;
  created_at: string;
  resolved: boolean;
  notes: string;
}

const FeedbackAdmin: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      let query = supabase.from('feedback').select('*').order('created_at', { ascending: false });
      
      if (filter === 'pending') {
        query = query.eq('resolved', false);
      } else if (filter === 'resolved') {
        query = query.eq('resolved', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  const toggleResolved = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ resolved: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchFeedback();
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Website Feedback Dashboard</h1>
            <button
              onClick={fetchFeedback}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              All ({feedbacks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded ${filter === 'resolved' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              Resolved
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading feedback...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No feedback found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {feedback.resolved ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle size={16} /> Resolved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600 text-sm">
                          <XCircle size={16} /> Pending
                        </span>
                      )}
                      <span className="text-gray-500 text-sm">
                        {new Date(feedback.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-lg font-medium text-gray-800 mb-3">{feedback.text}</p>
                    
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-600">Page:</span>
                          <a href={feedback.url} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-500 hover:underline ml-1 inline-flex items-center gap-1">
                            {feedback.url.replace(window.location.origin, '')}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-600">Element:</span>
                          <span className="ml-1">{feedback.selector || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Position:</span>
                          <span className="ml-1">x: {feedback.position_x}, y: {feedback.position_y}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Viewport:</span>
                          <span className="ml-1">{feedback.viewport_width}x{feedback.viewport_height}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleResolved(feedback.id, feedback.resolved)}
                      className={`px-3 py-1 rounded text-sm ${
                        feedback.resolved 
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {feedback.resolved ? 'Reopen' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => deleteFeedback(feedback.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackAdmin;