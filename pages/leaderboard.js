import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react'

export default function Leaderboard() {
  const [userStats, setUserStats] = useState({ ecoPoints: 0, rank: 0 })
  const [mounted, setMounted] = useState(false)

  const demoLeaderboard = [
    { name: 'EcoChampion2024', points: 1250, scans: 156, badge: '🌟' },
    { name: 'GreenWarrior', points: 980, scans: 134, badge: '🌱' },
    { name: 'SustainableLife', points: 850, scans: 128, badge: '♻️' },
    { name: 'ClimateHero', points: 720, scans: 98, badge: '🌍' },
    { name: 'EcoAdvocate', points: 650, scans: 89, badge: '🌿' },
  ]

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const ecoPoints = parseInt(localStorage.getItem('ecoPoints') || '0')
      setUserStats({
        ecoPoints,
        rank: ecoPoints > 0 ? Math.max(6, 11 - Math.floor(ecoPoints / 100)) : demoLeaderboard.length + 1
      })
    }
  }, [])

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-500" size={20} />
      case 2: return <Medal className="text-gray-400" size={20} />
      case 3: return <Medal className="text-amber-600" size={20} />
      default: return <span className="text-gray-600 font-semibold">#{rank}</span>
    }
  }

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
        <title>Leaderboard - EcoSnap AI</title>
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
            <h1 className="text-white text-xl font-bold">Eco Champions</h1>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-2">
            <Trophy className="text-yellow-300" size={16} />
            <span className="text-white font-semibold">Rank #{userStats.rank}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-20">
        {/* User Stats Card */}
        <div className="eco-card p-6 mb-6 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Your Ranking</h3>
              <div className="text-sm text-gray-600">
                Points: {userStats.ecoPoints} • Rank: #{userStats.rank}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">#{userStats.rank}</div>
              <div className="text-sm text-gray-500">Global Rank</div>
            </div>
          </div>

          {userStats.ecoPoints === 0 && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                🌟 Start scanning products to earn points and join the leaderboard!
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="eco-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Trophy className="mr-2 text-yellow-500" size={20} />
              Global Rankings
            </h3>
          </div>

          <div className="space-y-3">
            {demoLeaderboard.map((player, index) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{player.badge}</span>
                      <span className="font-semibold text-gray-800">{player.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {player.scans} scans completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">{player.points}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>

          {/* Motivational Footer */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center">
            <h4 className="font-semibold text-gray-800 mb-2">🌱 Keep Making an Impact!</h4>
            <p className="text-sm text-gray-600">
              Every scan helps you make more sustainable choices and climb the leaderboard.
              Together, we're creating a more eco-friendly world!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
