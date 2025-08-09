import type { Plugin } from 'vite';

export function criticalCSS(): Plugin {
  return {
    name: 'vite-plugin-critical-css',
    transformIndexHtml(html: string) {
        // Extract critical CSS for above-the-fold content
        const criticalStyles = `
          /* Critical CSS for initial render */
          *, ::before, ::after { box-sizing: border-box; }
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          .min-h-screen { min-height: 100vh; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .bg-gray-50 { background-color: #f9fafb; }
          .text-center { text-align: center; }
          .animate-spin { animation: spin 1s linear infinite; }
          .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
          
          /* Navigation critical styles */
          .fixed { position: fixed; }
          .top-0 { top: 0; }
          .w-full { width: 100%; }
          .z-50 { z-index: 50; }
          .bg-dark-steel { background-color: #2C3E50; }
          
          /* Hero critical styles */
          .relative { position: relative; }
          .absolute { position: absolute; }
          .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
          .bg-cover { background-size: cover; }
          .bg-center { background-position: center; }
          .bg-no-repeat { background-repeat: no-repeat; }
          .overflow-hidden { overflow: hidden; }
        `;

        // Inject critical CSS inline
        const styleTag = `<style id="critical-css">${criticalStyles}</style>`;
        
        // Add to head before other stylesheets
        return html.replace('</head>', `${styleTag}\n</head>`);
    }
  };
}