import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { DonationModalProvider, useDonationModal } from './contexts/DonationModalContext'
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
const HockeyForACause = lazy(() => import('./pages/HockeyForACause'))
const TopGolf = lazy(() => import('./pages/TopGolf'))
const JoinTeam = lazy(() => import('./pages/JoinTeam'))
const PracticeSchedule = lazy(() => import('./pages/PracticeSchedule'))
const Events = lazy(() => import('./pages/Events'))
const AccessibilityStatement = lazy(() => import('./pages/AccessibilityStatement'))
const GamePage = lazy(() => import('./pages/GamePage'))
const GameHighlightsGallery = lazy(() => import('./pages/GameHighlightsGallery'))
const Donate = lazy(() => import('./pages/Donate'))
const DonationModal = lazy(() => import('./components/DonationModal'))
const NotFound = lazy(() => import('./pages/NotFound'))
// Temporarily disable FeedbackAdmin until properly configured
// const FeedbackAdmin = lazy(() => import('./components/FeedbackAdmin'))

function GlobalDonationModal() {
  const { isOpen, initialAmount, eventTag, closeModal } = useDonationModal()
  if (!isOpen) return null
  return (
    <Suspense fallback={null}>
      <DonationModal
        isOpen={isOpen}
        onClose={closeModal}
        onSuccess={closeModal}
        initialAmount={initialAmount}
        eventTag={eventTag}
      />
    </Suspense>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <DonationModalProvider>
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
              <Route path="/hockey-for-a-cause" element={
                <ProtectedEventRoute eventKey="hockey-for-a-cause">
                  <HockeyForACause />
                </ProtectedEventRoute>
              } />
              <Route path="/topgolf" element={
                <ProtectedEventRoute eventKey="topgolf">
                  <TopGolf />
                </ProtectedEventRoute>
              } />
              <Route path="/join-team" element={<JoinTeam />} />
              <Route path="/practice-schedule" element={<PracticeSchedule />} />
              <Route path="/events" element={<Events />} />
              <Route path="/accessibility" element={<AccessibilityStatement />} />
              <Route path="/game/:gameId" element={<GamePage />} />
              <Route path="/game-highlights" element={<GameHighlightsGallery />} />
              <Route path="/donate" element={<Donate />} />

              {/* Team-specific routes (for backwards compatibility) */}
              <Route path="/team/:team" element={<TeamSite />} />
              <Route path="/team/:team/admin" element={<Admin />} />
              <Route path="/team/:team/opponents" element={<OpponentTeams />} />
              <Route path="/team/:team/store" element={<StorePage />} />

              {/* Redirect old adult team URLs to root */}
              <Route path="/team/adult/*" element={<Navigate to="/" replace />} />

              {/* Catch all - 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <GlobalDonationModal />
        </DonationModalProvider>
      </CartProvider>
    </ErrorBoundary>
  )
}

export default App
