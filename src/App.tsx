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
  console.log('App component rendering');
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Root route - Redirect to youth team */}
          <Route path="/" element={<Navigate to="/team/youth" replace />} />
          
          {/* Team-specific routes (only youth for now) */}
          <Route path="/team/:team/*" element={
            <URLTeamProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<TeamSite />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/opponents" element={<OpponentTeams />} />
                  <Route path="/store" element={<StorePage />} />
                </Routes>
              </Suspense>
            </URLTeamProvider>
          } />
          
          {/* Redirect old adult team URLs to youth */}
          <Route path="/team/adult/*" element={<Navigate to="/team/youth" replace />} />
        
          {/* Legacy redirects */}
          <Route path="/admin" element={<Navigate to="/team/youth/admin" replace />} />
          <Route path="#admin" element={<Navigate to="/team/youth/admin" replace />} />
          
          {/* Catch all - redirect to youth team */}
          <Route path="*" element={<Navigate to="/team/youth" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  )
}

export default App