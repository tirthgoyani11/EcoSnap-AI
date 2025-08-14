import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Camera, Upload, Search, Zap, Leaf, Trophy, User, Menu } from 'lucide-react'
import EcoTipOfTheDay from '../components/EcoTipOfTheDay'
import confetti from 'canvas-confetti'

// Dynamically import Scanner with SSR disabled
const Scanner = dynamic(() => import('../components/Scanner'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
})

export default function Home() {
  const [ecoPoints, setEcoPoints] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [scanResult, setScanResult] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEcoPoints(parseInt(localStorage.getItem('ecoPoints') || '0'))
    }
  }, [])

  const addEcoPoints = (points) => {
    const newPoints = ecoPoints + points
    setEcoPoints(newPoints)
    localStorage.setItem('ecoPoints', newPoints.toString())
    
    // Celebration animation for milestone achievements
    if (newPoints > 0 && newPoints % 100 === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#8b5cf6']
      })
    }
  }

  const handleScanResult = (result) => {
    setScanResult(result)
    // Award points for successful scan
    addEcoPoints(10)
    console.log('Scan result:', result)
  }

  const handleScanError = (error) => {
    console.error('Scan error:', error)
  }

  const NavButton = ({ icon: Icon, label, href, onClick }) => (
    <Link href={href || '#'}>
      <button
        onClick={onClick}
        className="flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-white/20 transition-all duration-200"
      >
        <Icon size={20} className="text-white" />
        <span className="text-xs text-white font-medium">{label}</span>
      </button>
    </Link>
  )

  return (
    <div className="min-h-screen eco-gradient">
      <Head>
        <title>EcoSnap AI - Smart Eco Product Scanner</title>
        <meta name="description" content="Scan products and get instant eco scores with AI-powered sustainability insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="relative p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Leaf className="text-white text-2xl" />
            <h1 className="text-white text-xl font-bold">EcoSnap AI</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavButton icon={Camera} label="Scanner" href="/" />
            <NavButton icon={Trophy} label="Leaderboard" href="/leaderboard" />
            <NavButton icon={User} label="Dashboard" href="/dashboard" />
          </nav>

          {/* Eco Points Display */}
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-2 backdrop-blur-sm">
            <Zap className="text-yellow-300 text-sm" />
            <span className="text-white font-semibold text-sm">{ecoPoints}</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-white p-2"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/80 backdrop-blur-md p-4 rounded-b-lg">
            <div className="flex justify-around">
              <NavButton icon={Camera} label="Scanner" href="/" onClick={() => setShowMobileMenu(false)} />
              <NavButton icon={Trophy} label="Leaderboard" href="/leaderboard" onClick={() => setShowMobileMenu(false)} />
              <NavButton icon={User} label="Dashboard" href="/dashboard" onClick={() => setShowMobileMenu(false)} />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 pb-20">
        {/* Eco Tip of the Day */}
        <EcoTipOfTheDay />

        {/* Scanner Section */}
        <div className="eco-card p-6 mb-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">QR Code & Barcode Scanner</h2>
          
          {/* Scanner Component */}
          <Scanner onResult={handleScanResult} onError={handleScanError} />

          {/* Scan Result Display */}
          {scanResult && (
            <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Scan Result:</h3>
              <p className="text-green-700 font-mono text-sm break-all">{scanResult}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
          <Link href="/bulk-scan">
            <button className="eco-button w-full py-3">
              <span className="text-sm font-medium">🛒 Bulk Scan</span>
            </button>
          </Link>
          
          <Link href="/ask-anything">
            <button className="eco-button w-full py-3">
              <span className="text-sm font-medium">💭 Ask AI</span>
            </button>
          </Link>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md p-4">
        <div className="flex justify-around">
          <NavButton icon={Camera} label="Scanner" href="/" />
          <NavButton icon={Trophy} label="Leaderboard" href="/leaderboard" />
          <NavButton icon={User} label="Dashboard" href="/dashboard" />
        </div>
      </div>
    </div>
  )
}
