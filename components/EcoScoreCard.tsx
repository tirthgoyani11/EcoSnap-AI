import { useState } from 'react'
import { ChevronDown, ChevronUp, Leaf, Recycle, Heart, Award } from 'lucide-react'

interface Product {
  id: number;
  productName: string;
  brand?: string;
  category?: string;
  ecoScore: number;
  packagingScore: number;
  carbonScore: number;
  ingredientScore: number;
  certificationScore: number;
  recyclable: boolean;
  co2Impact: number;
  healthScore: number;
  certifications: string[];
  ecoDescription: string;
}

interface EcoScoreCardProps {
  product: Product;
  onRemove?: () => void;
}

interface ScoreBreakdownProps {
  title: string;
  score: number;
  icon: React.ElementType;
  description: string;
}

export default function EcoScoreCard({ product, onRemove }: EcoScoreCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-green-500 bg-green-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const getScoreIcon = (score: number): string => {
    if (score >= 80) return '🌱'
    if (score >= 60) return '♻️'
    if (score >= 40) return '🌿'
    return '⚠️'
  }

  const ScoreBreakdown = ({ title, score, icon: Icon, description }: ScoreBreakdownProps) => (
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
    <div className="eco-card p-6">
      {/* Product Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{product.productName}</h3>
          <p className="text-gray-600 text-sm">{product.brand || 'Unknown Brand'}</p>
          <p className="text-gray-500 text-xs mt-1">{product.category || 'Product'}</p>
        </div>

        {/* Score and Actions */}
        <div className="flex items-start space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${getScoreColor(product.ecoScore)}`}>
            <span>{getScoreIcon(product.ecoScore)}</span>
            <span className="font-bold">{product.ecoScore}</span>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-red-500 hover:text-red-600 focus:outline-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Score Label */}
      <div className="mb-4">
        <span className={`text-sm font-medium ${getScoreColor(product.ecoScore)} px-2 py-1 rounded`}>
          {getScoreLabel(product.ecoScore)}
        </span>
      </div>

      {/* Toggle Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <span>{expanded ? 'Hide Details' : 'Show Details'}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <ScoreBreakdown
            title="Environmental Impact"
            score={product.carbonScore}
            icon={Leaf}
            description={`CO2 Impact: ${product.co2Impact.toFixed(1)}kg CO2e`}
          />
          <ScoreBreakdown
            title="Packaging"
            score={product.packagingScore}
            icon={Recycle}
            description={product.recyclable ? 'Recyclable packaging' : 'Non-recyclable packaging'}
          />
          <ScoreBreakdown
            title="Health Score"
            score={product.healthScore}
            icon={Heart}
            description="Impact on personal and environmental health"
          />
          <ScoreBreakdown
            title="Certifications"
            score={product.certificationScore}
            icon={Award}
            description={product.certifications.join(', ') || 'No certifications found'}
          />

          {/* Eco Description */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {product.ecoDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
