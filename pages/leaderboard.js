import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Trophy, Medal, Award, TrendingUp, Users, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Leaderboard() {
  const [userStats, setUserStats] = useState({ ecoPoints: 0, rank: 0, totalScans: 0 })
  const [leaderboard, setLeaderboard] = useState([])
  const [timeFrame, setTimeFrame] = useState('all') // all, week, month

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ecoPoints = parseInt(localStorage.getItem('ecoPoints') || '0')
      const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]')
      
      // Generate demo leaderboard data (in real app, this would come from a backend)
      const demoLeaderboard = generateDemoLeaderboard(ecoPoints)
      setLeaderboard(demoLeaderboard)
      
      // Calculate user's rank
      const rank = demoLeaderboard.findIndex(player => player.isCurrentUser) + 1
      
      setUserStats({
        ecoPoints,
        rank: rank || demoLeaderboard.length + 1,
        totalScans: scanHistory.length
      })
    }
  }, [])

  const generateDemoLeaderboard = (userPoints) => {
    const demoPlayers = [
      { name: 'EcoMaster2024', points: Math.max(userPoints + 50, 850), scans: 156, avgScore: 78, badge: '🌟' },
      { name: 'GreenWarrior', points: Math.max(userPoints + 30, 720), scans: 134, avgScore: 82, badge: '🌱' },
      { name: 'SustainableLife', points: Math.max(userPoints + 20, 680), scans: 128, avgScore: 75, badge: '♻️' },
      { name: 'ClimateChampion', points: Math.max(userPoints + 10, 620), scans: 98, avgScore: 77, badge: '🌍' },
      { name: 'EcoEnthusiast', points: Math.max(userPoints - 10, 580), scans: 89, avgScore: 73, badge: '🌿' },
      { name: 'GreenThumb', points: Math.max(userPoints - 20, 540), scans: 76, avgScore: 79, badge: '🌺' },
      { name: 'NatureLover99', points: Math.max(userPoints - 30, 500), scans: 72, avgScore: 71, badge: '🦋' },
      { name: 'EcoAdvocate', points: Math.max(userPoints - 40, 460), scans: 68, avgScore: 74, badge: '🌳' },
      { name: 'PlanetProtector', points: Math.max(userPoints - 50, 420), scans: 64, avgScore: 70, badge: '🛡️' },
      { name: 'CleanEnergy', points: Math.max(userPoints - 60, 380), scans: 58, avgScore: 68, badge: '⚡' },
    ]

    // Add current user if they have points
    if (userPoints > 0) {
      demoPlayers.push({
        name: 'You',
        points: userPoints,
        scans: userStats.totalScans,
        avgScore: 65,
        badge: '👤',
        isCurrentUser: true
      })
    }

    // Sort by points and limit to top 20
    return demoPlayers
      .sort((a, b) => b.points - a.points)
      .slice(0, 20)
      .map((player, index) => ({ ...player, rank: index + 1 }))
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-500" size={20} />
      case 2: return <Medal className="text-gray-400" size={20} />
      case 3: return <Medal className="text-amber-600" size={20} />
      default: return <span className="text-gray-600 font-semibold">#{rank}</span>
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600'
      default: return 'bg-gray-100'
    }
  }

  const LeaderboardEntry = ({ player, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
        player.isCurrentUser
          ? 'border-green-300 bg-green-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Rank */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          player.rank <= 3 ? getRankColor(player.rank) : 'bg-gray-100'
        }`}>
          {getRankIcon(player.rank)}
        </div>

        {/* Player Info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{player.badge}</span>
            <span className={`font-semibold ${player.isCurrentUser ? 'text-green-800' : 'text-gray-800'}`}>
              {player.name}
            </span>
            {player.isCurrentUser && (
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">You</span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {player.scans} scans • Avg score: {player.avgScore}
          </div>
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <div className={`text-xl font-bold ${player.isCurrentUser ? 'text-green-600' : 'text-gray-800'}`}>
          {player.points}
        </div>
        <div className="text-sm text-gray-500">points</div>
      </div>
    </motion.div>
  )

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
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Points: {userStats.ecoPoints}</span>
                <span>•</span>
                <span>Scans: {userStats.totalScans}</span>
                <span>•</span>
                <span>Rank: #{userStats.rank}</span>
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

        {/* Time Frame Selector */}
        <div className="flex justify-center mb-6">
          <div className="eco-card p-1 inline-flex">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'month', label: 'This Month' },
              { key: 'week', label: 'This Week' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeFrame(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeFrame === key
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="eco-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
            <Trophy className="mr-2 text-yellow-500" size={20} />
            Top Eco Champions
          </h3>
          
          <div className="flex items-end justify-center space-x-4">
            {leaderboard.slice(0, 3).map((player, index) => {
              const positions = [1, 0, 2] // Second place (index 1) in middle, tallest
              const actualIndex = positions[index]
              const heights = ['h-20', 'h-24', 'h-16']
              const colors = ['bg-gray-400', 'bg-yellow-500', 'bg-amber-600']
              
              return (
                <div key={player.name} className="text-center">
                  <div className="mb-2">
                    <div className="text-2xl mb-1">{player.badge}</div>
                    <div className="text-sm font-semibold text-gray-800">{player.name}</div>
                    <div className="text-xs text-gray-600">{player.points} pts</div>
                  </div>
                  <div className={`w-16 ${heights[actualIndex]} ${colors[actualIndex]} rounded-t-lg flex items-end justify-center pb-2`}>
                    <span className="text-white font-bold">{actualIndex + 1}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="eco-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Users className="mr-2" size={20} />
              Global Rankings
            </h3>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {leaderboard.length} eco champions
            </span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((player, index) => (
              <LeaderboardEntry key={player.name} player={player} index={index} />
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
