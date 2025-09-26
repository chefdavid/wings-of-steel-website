import { useEffect, useRef } from 'react';
import { announceToScreenReader } from '../utils/accessibility';

/**
 * Custom hook for making screen reader announcements
 */
export const useAnnouncement = () => {
  return {
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      announceToScreenReader(message, priority);
    }
  };
};

/**
 * Hook to announce route changes to screen readers
 */
export const useRouteAnnouncement = (pageName: string) => {
  const previousPage = useRef<string>('');

  useEffect(() => {
    if (previousPage.current !== pageName) {
      announceToScreenReader(`Navigated to ${pageName}`, 'polite');
      previousPage.current = pageName;
    }
  }, [pageName]);
};

/**
 * Hook to announce loading states
 */
export const useLoadingAnnouncement = (isLoading: boolean, loadingMessage = 'Loading content', completedMessage = 'Content loaded') => {
  const wasLoading = useRef(false);

  useEffect(() => {
    if (isLoading && !wasLoading.current) {
      announceToScreenReader(loadingMessage, 'polite');
      wasLoading.current = true;
    } else if (!isLoading && wasLoading.current) {
      announceToScreenReader(completedMessage, 'polite');
      wasLoading.current = false;
    }
  }, [isLoading, loadingMessage, completedMessage]);
};

/**
 * Hook to announce form validation errors
 */
export const useErrorAnnouncement = (errors: string[]) => {
  const previousErrors = useRef<string[]>([]);

  useEffect(() => {
    const newErrors = errors.filter(e => !previousErrors.current.includes(e));

    if (newErrors.length > 0) {
      const message = newErrors.length === 1
        ? `Error: ${newErrors[0]}`
        : `${newErrors.length} errors: ${newErrors.join('. ')}`;

      announceToScreenReader(message, 'assertive');
    }

    previousErrors.current = errors;
  }, [errors]);
};

/**
 * Hook to announce successful form submissions
 */
export const useSuccessAnnouncement = (isSuccess: boolean, message: string) => {
  const announced = useRef(false);

  useEffect(() => {
    if (isSuccess && !announced.current) {
      announceToScreenReader(message, 'polite');
      announced.current = true;
    } else if (!isSuccess) {
      announced.current = false;
    }
  }, [isSuccess, message]);
};