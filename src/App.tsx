import { Suspense, lazy, useEffect, useState } from 'react'
import { StaircaseLoader, useLoadingProgress } from './components/StaircaseLoader'
import './App.css'

// Lazy-load the heavy Hero component (includes three.js, GLB assets, etc.)
const Hero = lazy(() =>
  import('./components/hero/Hero').then((m) => ({ default: m.Hero })),
)

function App() {
  const { markReady, markError, ...loading } = useLoadingProgress()
  const [heroMounted, setHeroMounted] = useState(false)

  // Once the Suspense boundary resolves, the Hero component mounts and
  // triggers this callback — that's our real "app ready" signal.
  useEffect(() => {
    if (heroMounted) {
      markReady()
    }
  }, [heroMounted, markReady])

  return (
    <>
      <StaircaseLoader loading={loading} />
      <Suspense fallback={null}>
        <Hero />
        <ReadySignal onReady={() => setHeroMounted(true)} onError={markError} />
      </Suspense>
    </>
  )
}

/**
 * Invisible component that fires a callback on mount.
 * Placed *inside* the Suspense boundary, so it only renders once
 * all lazy children have resolved.
 */
function ReadySignal({ onReady }: { onReady: () => void; onError: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

export default App
