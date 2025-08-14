import { useState } from 'react'
import { ChevronDown, ChevronUp, Leaf, Recycle, Heart, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EcoScoreCard({ product }) {
  const [expanded, setExpanded] = useState(false)

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-green-500 bg-green-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return '🌱'
    if (score >= 60) return '♻️'
    if (score >= 40) return '🌿'
    return '⚠️'
  }

  const ScoreBreakdown = ({ title, score, icon: Icon, description }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon size={20} className="text-gray-600" />
        <div>
          <p className="font-medium text-gray-800">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
        {score}/100
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="eco-card p-6"
    >
      {/* Product Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{product.productName}</h3>
          <p className="text-gray-600 text-sm">{product.brand || 'Unknown Brand'}</p>
          <p className="text-gray-500 text-xs mt-1">{product.category || 'Product'}</p>
        </div>
        {product.image && (
          <img
            src={product.image}
            alt={product.productName}
            className="w-16 h-16 rounded-lg object-cover ml-4"
          />
        )}
      </div>

      {/* Main Eco Score */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <span className="text-4xl mr-2">{getScoreIcon(product.ecoScore)}</span>
          <div>
            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(product.ecoScore)}`}>
              {product.ecoScore}/100
            </div>
            <p className="text-sm font-medium text-gray-600 mt-1">
              {getScoreLabel(product.ecoScore)} Eco Score
            </p>
          </div>
        </div>
        
        {/* Score Description */}
        <p className="text-gray-700 text-sm max-w-md mx-auto">
          {product.ecoDescription || getDefaultDescription(product.ecoScore)}
        </p>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {product.certifications && product.certifications.length > 0 && (
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Award className="text-green-600 mx-auto mb-1" size={20} />
            <p className="text-sm font-medium text-green-800">Certified</p>
            <p className="text-xs text-green-600">{product.certifications.join(', ')}</p>
          </div>
        )}
        
        {product.recyclable && (
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Recycle className="text-blue-600 mx-auto mb-1" size={20} />
            <p className="text-sm font-medium text-blue-800">Recyclable</p>
            <p className="text-xs text-blue-600">Packaging can be recycled</p>
          </div>
        )}
        
        {product.co2Impact && (
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Leaf className="text-purple-600 mx-auto mb-1" size={20} />
            <p className="text-sm font-medium text-purple-800">CO₂ Impact</p>
            <p className="text-xs text-purple-600">{product.co2Impact}kg CO₂</p>
          </div>
        )}
        
        {product.healthScore && (
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Heart className="text-red-600 mx-auto mb-1" size={20} />
            <p className="text-sm font-medium text-red-800">Health Score</p>
            <p className="text-xs text-red-600">{product.healthScore}/100</p>
          </div>
        )}
      </div>

      {/* Detailed Breakdown Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center space-x-2 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span className="text-sm font-medium">
          {expanded ? 'Hide Details' : 'Show Detailed Breakdown'}
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Score Breakdown</h4>
              
              <ScoreBreakdown
                title="Packaging"
                score={product.packagingScore || 70}
                icon={Recycle}
                description="Material recyclability & sustainability"
              />
              
              <ScoreBreakdown
                title="Carbon Footprint"
                score={product.carbonScore || 65}
                icon={Leaf}
                description="Production & transportation emissions"
              />
              
              <ScoreBreakdown
                title="Ingredients"
                score={product.ingredientScore || 75}
                icon={Heart}
                description="Natural & organic content"
              />
              
              <ScoreBreakdown
                title="Certifications"
                score={product.certificationScore || 80}
                icon={Award}
                description="Eco & health certifications"
              />
            </div>

            {/* Additional Information */}
            {product.additionalInfo && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Additional Information</h4>
                <p className="text-sm text-gray-600">{product.additionalInfo}</p>
              </div>
            )}

            {/* Improvement Tips */}
            {product.improvementTips && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">💡 Improvement Tips</h4>
                <ul className="space-y-1">
                  {product.improvementTips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Default descriptions based on eco score
function getDefaultDescription(score) {
  if (score >= 80) {
    return "This product has excellent sustainability credentials with minimal environmental impact."
  }
  if (score >= 60) {
    return "This product has good eco-friendly features but could be improved in some areas."
  }
  if (score >= 40) {
    return "This product has fair sustainability features with room for significant improvement."
  }
  return "This product has poor eco-friendly credentials and significant environmental impact."
}
