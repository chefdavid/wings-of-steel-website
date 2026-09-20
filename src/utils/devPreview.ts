// The local dev server talks to the same Supabase project as production, so
// flipping an event's `is_visible` flag to preview its page would publish it to
// wingsofsteel.org at the same time. `?preview=1` reveals hidden-event UI
// locally without touching the flag.
//
// Guarded by import.meta.env.DEV, so the check compiles out of production
// builds and the query param does nothing on the live site.
export const isDevPreview = (): boolean =>
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('preview') === '1';
