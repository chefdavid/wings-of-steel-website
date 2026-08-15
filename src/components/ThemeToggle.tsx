import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';

/**
 * Dark / light switch.
 *
 * Labelled, not icon-only-to-a-screen-reader: `aria-pressed` carries state and
 * the accessible name says which theme the button switches TO, which is the
 * thing a non-sighted user actually needs.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === 'light'}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-pill border border-subtle text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors ${className}`}
    >
      {theme === 'dark' ? (
        <FaSun className="text-sm" aria-hidden="true" />
      ) : (
        <FaMoon className="text-sm" aria-hidden="true" />
      )}
    </button>
  );
}
