import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { URLTeamProvider } from './contexts/URLTeamContext'
import { CartProvider } from './contexts/CartContext'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load heavy components
const TeamSite = lazy(() => import('./components/TeamSite'))
const Admin = lazy(() => import('./components/Admin'))
const OpponentTeams = lazy(() => import('./components/OpponentTeams'))
const StorePage = lazy(() => import('./components/StorePage'))

function App() {
  return (
    <Router>
      <CartProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Root routes - Direct access without redirect */}
            <Route path="/" element={
              <URLTeamProvider>
                <TeamSite />
              </URLTeamProvider>
            } />
            <Route path="/admin" element={
              <URLTeamProvider>
                <Admin />
              </URLTeamProvider>
            } />
            <Route path="/opponents" element={
              <URLTeamProvider>
                <OpponentTeams />
              </URLTeamProvider>
            } />
            <Route path="/store" element={
              <URLTeamProvider>
                <StorePage />
              </URLTeamProvider>
            } />
            
            {/* Team-specific routes (keep for backwards compatibility) */}
            <Route path="/team/:team/*" element={
              <URLTeamProvider>
                <Routes>
                  <Route path="/" element={<TeamSite />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/opponents" element={<OpponentTeams />} />
                  <Route path="/store" element={<StorePage />} />
                </Routes>
              </URLTeamProvider>
            } />
            
            {/* Redirect old adult team URLs to root */}
            <Route path="/team/adult/*" element={<Navigate to="/" replace />} />
            
            {/* Legacy redirects */}
            <Route path="#admin" element={<Navigate to="/admin" replace />} />
            
            {/* Catch all - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </CartProvider>
    </Router>
  )
}

export default App