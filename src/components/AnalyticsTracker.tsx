import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../utils/analytics';

/**
 * Sends a GA4 page_view on every React Router navigation.
 *
 * Rendered inside the Router but outside <Routes>, so it survives route
 * changes rather than remounting with each page.
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    // Let the route's own effects set document.title first, otherwise every
    // page_view reports the previous page's title.
    const id = window.setTimeout(() => {
      trackPageView(location.pathname + location.search);
    }, 0);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.search]);

  return null;
}
