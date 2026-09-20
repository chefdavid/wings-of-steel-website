// The local dev server talks to the same Supabase project as production, so
// flipping an event's `is_visible` flag to preview its page would publish it to
// wingsofsteel.org at the same moment. `?preview=1` reveals hidden-event UI
// locally without touching the flag.
//
// Guarded by import.meta.env.DEV, so this compiles out of production builds and
// the query param does nothing on the live site.
//
// The flag is sticky for the tab: internal links (the home page banner's "Get
// Tickets", for one) are plain <Link>s that carry no query string, so a check
// that only read the URL would redirect on the very first click and make the
// preview look broken.
const STORAGE_KEY = 'wos:dev-preview';

export const isDevPreview = (): boolean => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;

  if (new URLSearchParams(window.location.search).get('preview') === '1') {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Private mode or blocked storage — the URL param still works on its own.
    }
    return true;
  }

  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};
