// Google Analytics 4.
//
// Inert unless VITE_GA_MEASUREMENT_ID is set, so local dev and preview builds
// send nothing and a missing ID is a no-op rather than a crash.
//
// The gtag script is injected on first use rather than sitting in index.html.
// This site has a documented history of fighting FCP and CLS regressions
// (see scripts/prerender.mjs), and a blocking third-party tag in <head> is the
// classic way to undo that work. Loading it async, after mount, keeps it off
// the critical path.

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

// GA is disabled in dev so local clicking around never pollutes the numbers.
const ENABLED = Boolean(MEASUREMENT_ID) && import.meta.env.PROD;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

const gtag = (...args: unknown[]) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
};

/**
 * Inject gtag.js once. Safe to call repeatedly.
 */
export function initAnalytics(): void {
  if (!ENABLED || loaded || typeof document === 'undefined') return;
  loaded = true;

  window.gtag = gtag;
  gtag('js', new Date());

  // Consent Mode v2 defaults. Analytics storage is granted because that is what
  // the site uses GA for; ad storage and personalisation are denied outright,
  // so no advertising profile is built from visitors to a children's charity.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });

  gtag('config', MEASUREMENT_ID, {
    // React Router drives navigation, so GA's automatic page_view would only
    // ever fire once. trackPageView below sends them instead.
    send_page_view: false,
    anonymize_ip: true,
  });

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(s);
}

export function trackPageView(path: string, title?: string): void {
  if (!ENABLED) return;
  gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
  });
}

/**
 * A funnel step. `name` should be a GA4 recommended event where one fits
 * (begin_checkout, purchase) so the standard reports light up.
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!ENABLED) return;
  gtag('event', name, params);
}

/** True when a measurement ID is configured and we are in a production build. */
export const analyticsEnabled = ENABLED;
