// Accessibility utility functions

/**
 * Announces a message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('role', 'status');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  document.body.appendChild(announcement);
  announcement.textContent = message;

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Trap focus within a specific element (useful for modals)
 */
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get descriptive text for images based on context
 */
export const getImageAltText = (imageName: string, context?: string): string => {
  const altTexts: Record<string, string> = {
    'hockey-sticks.webp': 'Crossed sled hockey sticks on ice',
    'wings-logo.webp': 'Wings of Steel team logo featuring wings and hockey sticks',
    'team-celebration.jpg': 'Wings of Steel players celebrating a championship victory on ice',
    'player-action.jpg': 'Sled hockey player in action during game play',
    'practice-session.jpg': 'Team practice session at Flyers Skate Zone',
    'coaches.jpg': 'Wings of Steel coaching staff on the bench',
    'rink-overview.jpg': 'Overview of the Flyers Skate Zone ice rink in Voorhees, NJ'
  };

  return altTexts[imageName] || `${context || 'Wings of Steel'} related image`;
};