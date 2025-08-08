import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import TeamSite from './components/TeamSite'
import Admin from './components/Admin'
import OpponentTeams from './components/OpponentTeams'
import StorePage from './components/StorePage'
import { URLTeamProvider } from './contexts/URLTeamContext'
import { CartProvider } from './contexts/CartContext'

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
              <Routes>
                <Route path="/" element={<TeamSite />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/opponents" element={<OpponentTeams />} />
                <Route path="/store" element={<StorePage />} />
              </Routes>
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