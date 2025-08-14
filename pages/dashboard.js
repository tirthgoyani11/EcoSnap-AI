import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Leaf, Calendar, Award } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    ecoPoints: 0,
    totalScans: 0,
    averageEcoScore: 0,
    co2Saved: 0,
    scanHistory: []
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const ecoPoints = parseInt(localStorage.getItem('ecoPoints') || '0')
      const co2Saved = parseFloat(localStorage.getItem('totalCO2Saved') || '0')
      const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]')
      
      const totalScans = scanHistory.length
      const averageEcoScore = totalScans > 0 
        ? Math.round(scanHistory.reduce((sum, scan) => sum + (scan.ecoScore || 0), 0) / totalScans)
        : 0

      setStats({
        ecoPoints,
        totalScans,
        averageEcoScore,
        co2Saved,
        scanHistory: scanHistory.slice(0, 10)
      })
    }
  }, [])

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-green-500 bg-green-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'green' }) => (
    <div className="eco-card p-6 text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${color}-100 mb-4`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-gray-600 font-medium mb-1">{title}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  )

  if (!mounted) {
    return (
      <div className="min-h-screen eco-gradient flex items-center justify-center">
        <div className="eco-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen eco-gradient">
      <Head>
        <title>Dashboard - EcoSnap AI</title>
      </Head>

      {/* Header */}
      <header className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <ArrowLeft className="text-white" size={20} />
              </button>
            </Link>
            <h1 className="text-white text-xl font-bold">Your Eco Journey</h1>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-2">
            <Award className="text-yellow-300" size={16} />
            <span className="text-white font-semibold">{stats.ecoPoints} pts</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-20">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Award}
            title="Total Scans"
            value={stats.totalScans}
            subtitle="Products analyzed"
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Avg Eco Score"
            value={stats.averageEcoScore}
            subtitle="Out of 100"
            color="green"
          />
          <StatCard
            icon={Leaf}
            title="CO₂ Impact"
            value={`${stats.co2Saved.toFixed(1)}kg`}
            subtitle="Potential saved"
            color="purple"
          />
          <StatCard
            icon={Calendar}
            title="This Week"
            value={stats.totalScans}
            subtitle="Scans completed"
            color="indigo"
          />
        </div>

        {/* Recent Scans */}
        {stats.scanHistory.length > 0 && (
          <div className="eco-card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Scans</h3>
            <div className="space-y-3">
              {stats.scanHistory.map((scan, index) => (
                <div key={scan.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{scan.productName}</div>
                    <div className="text-sm text-gray-600">{scan.brand} • {scan.category}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(scan.ecoScore)}`}>
                    {scan.ecoScore}/100
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalScans === 0 && (
          <div className="eco-card p-8 text-center">
            <Leaf className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Start Your Eco Journey</h3>
            <p className="text-gray-500 mb-4">
              Scan your first product to begin tracking your environmental impact!
            </p>
            <Link href="/">
              <button className="eco-button">
                Start Scanning
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
