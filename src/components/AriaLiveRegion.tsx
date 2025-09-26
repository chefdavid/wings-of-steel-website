import { useState, useEffect } from 'react';

interface AriaLiveRegionProps {
  message?: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

/**
 * A component that provides live region announcements for screen readers
 * This component should be placed once at the root level of the application
 */
export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message = '',
  priority = 'polite',
  clearAfter = 5000
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);

      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          setAnnouncement('');
        }, clearAfter);

        return () => clearTimeout(timer);
      }
    }
  }, [message, clearAfter]);

  return (
    <>
      {/* Polite announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {priority === 'polite' && announcement}
      </div>

      {/* Assertive announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {priority === 'assertive' && announcement}
      </div>
    </>
  );
};

// Create a global instance that can be accessed from anywhere
let globalAnnounce: ((message: string, priority?: 'polite' | 'assertive') => void) | null = null;

export const setGlobalAnnouncer = (announcer: (message: string, priority?: 'polite' | 'assertive') => void) => {
  globalAnnounce = announcer;
};

export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (globalAnnounce) {
    globalAnnounce(message, priority);
  } else {
    console.warn('AriaLiveRegion not initialized. Make sure to include <GlobalAriaLive /> in your app root.');
  }
};

/**
 * Global aria-live region that should be included once at the app root
 */
export const GlobalAriaLive: React.FC = () => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  useEffect(() => {
    setGlobalAnnouncer((msg: string, prio: 'polite' | 'assertive' = 'polite') => {
      setMessage(msg);
      setPriority(prio);

      // Clear after announcement
      setTimeout(() => {
        setMessage('');
      }, 100);
    });
  }, []);

  return <AriaLiveRegion message={message} priority={priority} clearAfter={5000} />;
};