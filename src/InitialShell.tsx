// Minimal component that renders immediately
const InitialShell = () => {
  return (
    <div className="min-h-screen bg-dark-steel">
      {/* Navigation skeleton */}
      <nav className="fixed top-0 w-full bg-dark-steel/95 backdrop-blur-sm z-50 shadow-lg h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="animate-pulse flex items-center">
            <div className="h-12 w-12 bg-steel-gray rounded mr-4"></div>
            <div>
              <div className="h-6 w-32 bg-steel-gray rounded mb-1"></div>
              <div className="h-3 w-24 bg-steel-gray/50 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero skeleton */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        <div className="relative z-10 text-center px-4">
          <div className="animate-pulse">
            <div className="h-16 w-64 bg-steel-gray rounded mx-auto mb-4"></div>
            <div className="h-16 w-48 bg-yellow-400/50 rounded mx-auto mb-8"></div>
            <div className="h-4 w-96 bg-steel-gray/50 rounded mx-auto mb-2"></div>
            <div className="h-4 w-80 bg-steel-gray/50 rounded mx-auto mb-8"></div>
            <div className="flex gap-4 justify-center">
              <div className="h-12 w-32 bg-yellow-400/50 rounded"></div>
              <div className="h-12 w-32 bg-white/50 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default InitialShell