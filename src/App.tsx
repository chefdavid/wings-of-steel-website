import Navigation from './components/Navigation'
import Hero from './components/Hero'
import About from './components/About'
import Team from './components/Team'
import Schedule from './components/Schedule'
import GetInvolved from './components/GetInvolved'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Team />
      <Schedule />
      <GetInvolved />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
