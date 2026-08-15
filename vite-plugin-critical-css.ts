import type { Plugin } from 'vite';
// @ts-expect-error - plain JS token module, intentionally untyped
import { colors, spacing } from './src/design/tokens.js';

/**
 * Inlines a small critical-CSS block so the shell paints before the main
 * stylesheet arrives.
 *
 * Brand values are read from src/design/tokens.js rather than hardcoded.
 * Previously this file carried its own copies of #2C3E50 etc., which drifted
 * silently whenever the theme changed.
 *
 * Keep this block SMALL — it is inlined into every prerendered HTML file. Only
 * rules needed to paint the nav bar and hero backdrop belong here.
 */
export function criticalCSS(): Plugin {
  return {
    name: 'vite-plugin-critical-css',
    transformIndexHtml(html: string) {
      const criticalStyles = `
        /* Critical CSS — generated from src/design/tokens.js at build time */
        *, ::before, ::after { box-sizing: border-box; }
        body { margin: 0; min-width: 320px; font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif; }
        .min-h-screen { min-height: 100vh; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .top-0 { top: 0; }
        .w-full { width: 100%; }
        .z-50 { z-index: 50; }
        .overflow-hidden { overflow: hidden; }
        .bg-cover { background-size: cover; }
        .bg-center { background-position: center; }
        .bg-no-repeat { background-repeat: no-repeat; }
        .bg-gray-50 { background-color: ${colors.slate[50]}; }
        .bg-dark-steel { background-color: ${colors.steel[800]}; }
        .pt-nav { padding-top: ${spacing.nav}; }
        .h-nav { height: ${spacing.nav}; }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `;

      const styleTag = `<style id="critical-css">${criticalStyles}</style>`;
      return html.replace('</head>', `${styleTag}\n</head>`);
    },
  };
}
