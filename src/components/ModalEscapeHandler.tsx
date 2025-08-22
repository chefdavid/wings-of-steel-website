import { useEffect } from 'react';

const ModalEscapeHandler = () => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Try to close any visible modals/popups
        
        // Check for any element with modal/popup/overlay in class name
        const modalElements = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"]');
        modalElements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Check if it's visible
            const style = window.getComputedStyle(element);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
              // Try to hide it
              element.style.display = 'none';
              console.log('Closed modal/popup via Escape key:', element);
            }
          }
        });

        // Also try to click any close buttons
        const closeButtons = document.querySelectorAll(
          '[class*="close"], [aria-label*="close"], [aria-label*="Close"], button:has(svg)'
        );
        closeButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            const style = window.getComputedStyle(button);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
              button.click();
            }
          }
        });

        // Remove any fixed overlays that might be blocking
        const fixedElements = document.querySelectorAll('.fixed.inset-0');
        fixedElements.forEach(element => {
          if (element instanceof HTMLElement && element.style.zIndex && parseInt(element.style.zIndex) > 40) {
            element.style.display = 'none';
            console.log('Removed fixed overlay:', element);
          }
        });
      }
    };

    // Add the event listener
    document.addEventListener('keydown', handleEscape);

    // Also add a emergency close button in case the popup has no close button
    const emergencyButton = document.createElement('button');
    emergencyButton.innerHTML = '✕ Close Any Popup (ESC)';
    emergencyButton.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors z-[99999] hidden';
    emergencyButton.id = 'emergency-modal-close';
    emergencyButton.onclick = () => {
      const modalElements = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"], .fixed.inset-0');
      modalElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'none';
        }
      });
      emergencyButton.style.display = 'none';
    };
    document.body.appendChild(emergencyButton);

    // Show emergency button if there's a modal visible
    const checkForModals = () => {
      const hasModal = document.querySelector('[class*="modal"]:not([style*="display: none"]), [class*="popup"]:not([style*="display: none"])');
      if (hasModal && emergencyButton) {
        emergencyButton.style.display = 'block';
      }
    };

    // Check periodically for stuck modals
    const interval = setInterval(checkForModals, 2000);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      clearInterval(interval);
      if (emergencyButton && emergencyButton.parentNode) {
        emergencyButton.parentNode.removeChild(emergencyButton);
      }
    };
  }, []);

  return null;
};

export default ModalEscapeHandler;