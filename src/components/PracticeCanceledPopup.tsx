import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PracticeCanceledPopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show on December 11, 2025
    const today = new Date()
    const targetDate = new Date(2025, 11, 11) // Month is 0-indexed, so 11 = December

    const isTargetDay =
      today.getFullYear() === targetDate.getFullYear() &&
      today.getMonth() === targetDate.getMonth() &&
      today.getDate() === targetDate.getDate()

    if (isTargetDay) {
      // Small delay before showing for better UX
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsVisible(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Popup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-steel-blue via-dark-steel to-steel-gray" />

            {/* Ice pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Warning Icon */}
              <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="font-sport text-4xl md:text-5xl text-white mb-4 tracking-wide">
                PRACTICE CANCELED
              </h2>

              {/* Date */}
              <p className="text-ice-blue text-xl font-display mb-4">
                Wednesday, December 11th
              </p>

              {/* Message */}
              <p className="text-white/90 text-lg mb-8">
                Today's practice has been canceled.
                <br />
                <span className="text-ice-blue font-semibold">See you next week!</span>
              </p>

              {/* Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30
                         text-white font-display text-lg rounded-full transition-all duration-300
                         hover:scale-105 hover:border-white/50"
              >
                Got It!
              </button>
            </div>

            {/* Close X button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                       text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
