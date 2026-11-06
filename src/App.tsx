import { MotionConfig } from 'motion/react'
import { About } from './components/about/About'
import { Approach } from './components/approach/Approach'
import { Contact } from './components/contact/Contact'
import { Experience } from './components/experience/Experience'
import { Footer } from './components/footer/Footer'
import { Hero } from './components/hero/Hero'
import { ProjectDetail } from './components/projects/ProjectDetail'
import { Projects } from './components/projects/Projects'
import { TechStack } from './components/stack/TechStack'
import { GlassScope } from './components/ui/GlassScope'
import './App.css'

function App() {
  return (
    <>
      {/* The hero lazy-loads its own three.js scene, so its copy paints immediately. */}
      <Hero />
      {/* "user": transform animations are skipped when reduced motion is requested. */}
      <MotionConfig reducedMotion="user">
        <GlassScope>
          <main>
            <About />
            <Projects />
            <TechStack />
            <Experience />
            <Approach />
            <Contact />
          </main>
          <Footer />
          <ProjectDetail />
        </GlassScope>
      </MotionConfig>
    </>
  )
}

export default App
