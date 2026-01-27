// Suppress console warnings for known non-critical issues
// This runs early to catch errors before they're logged

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Override console.error to suppress font errors
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  
  // Suppress font-related errors (fonts have fallbacks)
  if (
    message.includes('Failed to decode downloaded font') ||
    message.includes('OTS parsing error') ||
    message.includes('invalid sfntVersion') ||
    message.includes('sfntVersion')
  ) {
    return; // Suppress font errors - fonts will fallback gracefully
  }
  
  // Show other errors
  originalError.apply(console, args);
};

// Override console.warn to suppress known warnings
console.warn = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  
  // Suppress known non-critical warnings
  if (
    message.includes('Failed to decode downloaded font') ||
    message.includes('OTS parsing error') ||
    message.includes('invalid sfntVersion') ||
    message.includes('preloaded using link preload but not used') ||
    message.includes('Extension context invalidated') ||
    message.includes('Multiple GoTrueClient instances') ||
    message.includes('A listener indicated an asynchronous response') ||
    (import.meta.env.DEV && message.includes('Stripe.js integration over HTTP'))
  ) {
    return; // Suppress these warnings
  }
  
  // Show other warnings
  originalWarn.apply(console, args);
};
