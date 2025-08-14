import { useState, useEffect } from 'react'
import { Lightbulb, X } from 'lucide-react'

const ecoTips = [
  {
    tip: "Look for products with minimal packaging to reduce waste.",
    category: "Packaging",
    emoji: "📦"
  },
  {
    tip: "Choose refillable containers whenever possible to reduce single-use plastics.",
    category: "Zero Waste",
    emoji: "🔄"
  },
  {
    tip: "Buy local and seasonal produce to reduce carbon footprint from transportation.",
    category: "Food",
    emoji: "🥬"
  },
  {
    tip: "Look for Energy Star certified appliances to save energy and money.",
    category: "Energy",
    emoji: "⚡"
  },
  {
    tip: "Choose products with recyclable or compostable packaging materials.",
    category: "Materials",
    emoji: "♻️"
  },
  {
    tip: "Buy only what you need to prevent food waste and unnecessary consumption.",
    category: "Consumption",
    emoji: "🎯"
  },
  {
    tip: "Support brands with certified organic or sustainable farming practices.",
    category: "Agriculture",
    emoji: "🌱"
  },
  {
    tip: "Opt for products with natural ingredients over synthetic chemicals.",
    category: "Health",
    emoji: "🍃"
  },
  {
    tip: "Choose durable goods that last longer instead of disposable alternatives.",
    category: "Durability",
    emoji: "💪"
  },
  {
    tip: "Look for Fair Trade certification to support ethical labor practices.",
    category: "Ethics",
    emoji: "🤝"
  }
]

export default function EcoTipOfTheDay() {
  const [currentTip, setCurrentTip] = useState(null)
  const [isVisible, setIsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get today's tip based on current date
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    const tipIndex = dayOfYear % ecoTips.length
    setCurrentTip(ecoTips[tipIndex])

    // Check if user has dismissed today's tip
    if (typeof window !== 'undefined') {
      const dismissedDate = localStorage.getItem('ecoTipDismissedDate')
      const todayStr = today.toDateString()
      
      if (dismissedDate === todayStr) {
        setIsVisible(false)
      }
    }
  }, [])

  const dismissTip = () => {
    if (typeof window !== 'undefined') {
      const today = new Date().toDateString()
      localStorage.setItem('ecoTipDismissedDate', today)
    }
    setIsVisible(false)
  }

  if (!mounted || !currentTip || !isVisible) {
    return null
  }

  return (
    <div className="eco-card p-4 mb-6 max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="bg-green-500 p-2 rounded-full">
            <Lightbulb className="text-white" size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{currentTip.emoji}</span>
              <h4 className="font-semibold text-gray-800">Eco Tip of the Day</h4>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {currentTip.category}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentTip.tip}
            </p>
          </div>
        </div>
        <button
          onClick={dismissTip}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Dismiss for today"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
