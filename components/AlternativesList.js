import { useState } from 'react'
import { ExternalLink, MapPin, Star, TrendingUp, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AlternativesList({ alternatives = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-green-500 bg-green-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const calculateSavings = (original, alternative) => {
    const co2Savings = (original.co2Impact || 5) - (alternative.co2Impact || 3)
    const costSavings = (original.price || 10) - (alternative.price || 8)
    return { co2Savings: Math.max(0, co2Savings), costSavings }
  }

  if (!alternatives || alternatives.length === 0) {
    return (
      <div className="eco-card p-6 text-center">
        <Leaf className="mx-auto mb-3 text-gray-400" size={48} />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Alternatives Found</h3>
        <p className="text-gray-500 text-sm">
          We couldn't find eco-friendly alternatives for this product yet.
          Try scanning another product or check back later!
        </p>
      </div>
    )
  }

  return (
    <div className="eco-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">🌱 Eco-Friendly Alternatives</h3>
        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {alternatives.length} found
        </span>
      </div>

      <div className="space-y-4">
        {alternatives.map((alternative, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              {/* Product Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {alternative.image && (
                    <img
                      src={alternative.image}
                      alt={alternative.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-800">{alternative.name}</h4>
                    <p className="text-sm text-gray-600">{alternative.brand}</p>
                  </div>
                </div>

                {/* Key Benefits */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {alternative.benefits?.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>

                {/* Why Better Explanation */}
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium text-green-600">Why it's better: </span>
                  {alternative.whyBetter}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full ${getScoreColor(alternative.ecoScore)}`}>
                      {alternative.ecoScore}/100
                    </div>
                    <span className="text-gray-600">Eco Score</span>
                  </div>
                  
                  {alternative.price && (
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">${alternative.price}</span>
                      {alternative.originalPrice && alternative.originalPrice > alternative.price && (
                        <span className="text-green-600 text-xs">
                          Save ${(alternative.originalPrice - alternative.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {alternative.co2Impact && (
                    <div className="flex items-center space-x-2">
                      <Leaf size={14} className="text-green-600" />
                      <span className="text-gray-600">{alternative.co2Impact}kg CO₂</span>
                    </div>
                  )}
                  
                  {alternative.rating && (
                    <div className="flex items-center space-x-2">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="text-gray-600">{alternative.rating}/5</span>
                    </div>
                  )}
                </div>

                {/* Improvement Stats */}
                {alternative.improvements && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-4 text-sm">
                      {alternative.improvements.co2Reduction && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp size={14} className="text-green-600" />
                          <span className="text-green-700 font-medium">
                            -{alternative.improvements.co2Reduction}% CO₂
                          </span>
                        </div>
                      )}
                      {alternative.improvements.betterScore && (
                        <div className="flex items-center space-x-1">
                          <span className="text-green-700 font-medium">
                            +{alternative.improvements.betterScore} points better
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 ml-4">
                {alternative.buyLink && (
                  <a
                    href={alternative.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span>Buy</span>
                  </a>
                )}
                
                {alternative.storeLocator && (
                  <button className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                    <MapPin size={14} />
                    <span>Find Store</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Details */}
            {alternative.details && (
              <div className="mt-3">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {expandedIndex === index ? 'Hide Details' : 'Show Details'}
                </button>
                
                {expandedIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700"
                  >
                    {alternative.details}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Switch Impact Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {alternatives.reduce((acc, alt) => acc + (alt.improvements?.co2Reduction || 0), 0) / alternatives.length || 0}%
            </div>
            <div className="text-gray-600">Avg CO₂ Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(alternatives.reduce((acc, alt) => acc + (alt.ecoScore || 0), 0) / alternatives.length)}
            </div>
            <div className="text-gray-600">Avg Eco Score</div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Making the switch to these alternatives could significantly reduce your environmental impact!
        </p>
      </div>
    </div>
  )
}
