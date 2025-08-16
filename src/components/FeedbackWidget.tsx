import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface StickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  url: string;
  selector: string;
  timestamp: string;
}

// Initialize Supabase client
const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
  : null;

const FeedbackWidget: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showNotes, setShowNotes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem('feedback-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('feedback-notes', JSON.stringify(notes));
  }, [notes]);

  const getElementSelector = (element: Element): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c).join('.');
      if (classes) return `.${classes}`;
    }
    return element.tagName.toLowerCase();
  };

  const handleDocumentClick = useCallback((e: MouseEvent) => {
    if (!isPlacing) return;
    
    const target = e.target as Element;
    if (target.closest('.feedback-widget')) return;

    e.preventDefault();
    e.stopPropagation();

    const newNote: StickyNote = {
      id: Date.now().toString(),
      x: e.pageX,
      y: e.pageY,
      text: '',
      url: window.location.href,
      selector: getElementSelector(target),
      timestamp: new Date().toISOString()
    };

    setNotes(prev => [...prev, newNote]);
    setActiveNote(newNote.id);
    setIsPlacing(false);
  }, [isPlacing]);

  useEffect(() => {
    if (isPlacing) {
      document.addEventListener('click', handleDocumentClick, true);
      document.body.style.cursor = 'crosshair';
    } else {
      document.removeEventListener('click', handleDocumentClick, true);
      document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      document.body.style.cursor = 'default';
    };
  }, [isPlacing, handleDocumentClick]);

  const submitFeedback = async (note: StickyNote) => {
    setIsSubmitting(true);
    
    try {
      if (supabase) {
        // Send to Supabase
        const { error } = await supabase
          .from('feedback')
          .insert({
            text: note.text,
            url: note.url,
            selector: note.selector,
            position_x: note.x,
            position_y: note.y,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            user_agent: navigator.userAgent
          });

        if (error) {
          console.error('Failed to submit feedback:', error);
          alert('Sorry, there was an error sending your feedback. Please try again.');
        } else {
          // Success!
          setSubmitSuccess(true);
          setNotes(prev => prev.filter(n => n.id !== note.id));
          setActiveNote(null);
          
          // Show success message briefly
          setTimeout(() => {
            setSubmitSuccess(false);
          }, 3000);
        }
      } else {
        // Fallback: Log to console if Supabase not configured
        console.log('=== FEEDBACK (Supabase not configured) ===');
        console.log('Text:', note.text);
        console.log('URL:', note.url);
        console.log('Element:', note.selector);
        console.log('Position:', `x: ${note.x}, y: ${note.y}`);
        console.log('=========================================');
        
        alert('Feedback system not fully configured. Your feedback has been logged to the console.');
        setNotes(prev => prev.filter(n => n.id !== note.id));
        setActiveNote(null);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Sorry, there was an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Widget is controlled by VITE_ENABLE_FEEDBACK env variable in App.tsx
  // Can also be enabled with ?feedback=true in URL
  if (!import.meta.env.VITE_ENABLE_FEEDBACK && !window.location.search.includes('feedback=true')) {
    return null;
  }

  return (
    <>
      <div className="feedback-widget fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500 transition-colors"
          title="Toggle sticky notes visibility"
        >
          {showNotes ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
        
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`${
            isEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white p-3 rounded-full shadow-lg transition-colors`}
          title={isEnabled ? 'Close feedback mode' : 'Open feedback mode'}
        >
          {isEnabled ? <X size={20} /> : <MessageSquare size={20} />}
        </button>
        
        {isEnabled && (
          <div className="bg-white rounded-lg shadow-xl p-4 w-72">
            <h3 className="font-bold text-sm mb-1">🐛 Feedback Mode</h3>
            <p className="text-xs text-gray-600 mb-3">
              Help improve the site by reporting issues!
            </p>
            
            <button
              onClick={() => setIsPlacing(true)}
              disabled={isPlacing}
              className={`w-full py-2 px-4 rounded font-medium ${
                isPlacing 
                  ? 'bg-yellow-400 text-black cursor-not-allowed animate-pulse' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isPlacing ? '👆 Now click the problem area!' : '📌 Add Sticky Note'}
            </button>
            
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
              <p className="font-semibold mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Add Sticky Note"</li>
                <li>Click on the problem area</li>
                <li>Describe the issue</li>
                <li>Click send - Done!</li>
              </ol>
            </div>
            
            <div className="mt-3 pt-2 border-t text-xs text-gray-600">
              <p>Active notes: {notes.length}</p>
              {notes.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Remove all sticky notes?')) {
                      setNotes([]);
                      setActiveNote(null);
                    }
                  }}
                  className="text-red-500 hover:underline mt-1"
                >
                  Clear All Notes
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showNotes && notes.map(note => (
        <div
          key={note.id}
          className="feedback-widget fixed z-40"
          style={{ left: note.x - 15, top: note.y - 15 }}
        >
          <div className="relative">
            <div 
              className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
              onClick={() => setActiveNote(activeNote === note.id ? null : note.id)}
            >
              <span className="text-xs font-bold">{notes.indexOf(note) + 1}</span>
            </div>
            
            {activeNote === note.id && (
              <div className="absolute top-10 left-0 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 w-72 shadow-xl">
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  📝 Leave feedback about this spot:
                </div>
                <textarea
                  value={note.text || noteText}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setNoteText(newText);
                    setNotes(prev => prev.map(n => 
                      n.id === note.id ? { ...n, text: newText } : n
                    ));
                  }}
                  placeholder="What's wrong here? Be specific..."
                  className="w-full h-20 p-2 border rounded text-sm resize-none"
                  autoFocus
                />
                
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => submitFeedback(note)}
                    disabled={!note.text || isSubmitting}
                    className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <><Send size={14} /> Send Feedback</>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setNotes(prev => prev.filter(n => n.id !== note.id));
                      setActiveNote(null);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                  <p className="italic">Your feedback will be sent directly to the developer.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {isPlacing && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Click anywhere on the page to place a sticky note
          </div>
        </div>
      )}
      
      {submitSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle size={20} />
            <span className="font-medium">Feedback sent successfully! Thank you!</span>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;