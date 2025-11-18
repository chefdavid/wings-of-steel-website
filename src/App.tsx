import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import LoadingSpinner from './components/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'
import ModalEscapeHandler from './components/ModalEscapeHandler'
import { GlobalAriaLive } from './components/AriaLiveRegion'
import ProtectedEventRoute from './components/ProtectedEventRoute'

// Lazy load heavy components
const TeamSite = lazy(() => import('./components/TeamSite'))
const Admin = lazy(() => import('./components/Admin'))
const OpponentTeams = lazy(() => import('./components/OpponentTeams'))
const StorePage = lazy(() => import('./components/StorePage'))
const LocalGallery = lazy(() => import('./pages/LocalGallery'))
const GolfOuting = lazy(() => import('./pages/GolfOuting'))
const JoinTeam = lazy(() => import('./pages/JoinTeam'))
const PracticeSchedule = lazy(() => import('./pages/PracticeSchedule'))
const PizzaPinsAndPop = lazy(() => import('./pages/PizzaPinsAndPop'))
const PizzaPinsDashboard = lazy(() => import('./pages/PizzaPinsDashboard'))
const AccessibilityStatement = lazy(() => import('./pages/AccessibilityStatement'))
const GamePage = lazy(() => import('./pages/GamePage'))
const GameHighlightsGallery = lazy(() => import('./pages/GameHighlightsGallery'))
// Temporarily disable FeedbackAdmin until properly configured
// const FeedbackAdmin = lazy(() => import('./components/FeedbackAdmin'))

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
          <GlobalAriaLive />
          <ModalEscapeHandler />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Root routes - Direct access */}
              <Route path="/" element={<TeamSite />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/opponents" element={<OpponentTeams />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/gallery" element={<LocalGallery />} />
              <Route path="/golf-outing" element={
                <ProtectedEventRoute eventKey="golf-outing">
                  <GolfOuting />
                </ProtectedEventRoute>
              } />
              <Route path="/join-team" element={<JoinTeam />} />
              <Route path="/practice-schedule" element={<PracticeSchedule />} />
              <Route path="/pizza-pins-pop" element={
                <ProtectedEventRoute eventKey="pizza-pins-pop">
                  <PizzaPinsAndPop />
                </ProtectedEventRoute>
              } />
              <Route path="/pizza-pins-dashboard" element={<PizzaPinsDashboard />} />
              <Route path="/accessibility" element={<AccessibilityStatement />} />
              <Route path="/game/:gameId" element={<GamePage />} />
              <Route path="/game-highlights" element={<GameHighlightsGallery />} />

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
    </ErrorBoundary>
  )
}

export default App