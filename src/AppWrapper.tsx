import { lazy, Suspense, useEffect, useState } from 'react'
import InitialShell from './InitialShell'

// Lazy load the entire App component
const App = lazy(() => import('./App'))

function AppWrapper() {
  const [showApp, setShowApp] = useState(false)
  
  useEffect(() => {
    // Defer app loading to after initial paint
    const timer = setTimeout(() => {
      setShowApp(true)
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!showApp) {
    return <InitialShell />
  }
  
  return (
    <Suspense fallback={<InitialShell />}>
      <App />
    </Suspense>
  )
}

export default AppWrapper