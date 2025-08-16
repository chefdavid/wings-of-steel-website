import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import LoadingSpinner from './components/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load heavy components
const TeamSite = lazy(() => import('./components/TeamSite'))
const Admin = lazy(() => import('./components/Admin'))
const OpponentTeams = lazy(() => import('./components/OpponentTeams'))
const StorePage = lazy(() => import('./components/StorePage'))
// Temporarily disable FeedbackAdmin until properly configured
// const FeedbackAdmin = lazy(() => import('./components/FeedbackAdmin'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <CartProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Root routes - Direct access */}
              <Route path="/" element={<TeamSite />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/opponents" element={<OpponentTeams />} />
              <Route path="/store" element={<StorePage />} />
              
              {/* Team-specific routes (for backwards compatibility) */}
              <Route path="/team/:team" element={<TeamSite />} />
              <Route path="/team/:team/admin" element={<Admin />} />
              <Route path="/team/:team/opponents" element={<OpponentTeams />} />
              <Route path="/team/:team/store" element={<StorePage />} />
              
              {/* Redirect old adult team URLs to root */}
              <Route path="/team/adult/*" element={<Navigate to="/" replace />} />
              
              {/* Catch all - redirect to root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App