'use client';

import { useState, useEffect } from 'react'
import { Download, Trash2, Package } from 'lucide-react'
import EcoScoreCard from '../../components/EcoScoreCard'
import { BulkScanner } from '../../components/BulkScanner'

export default function BulkScan() {
  const [scannedProducts, setScannedProducts] = useState([])
  const [totalEcoScore, setTotalEcoScore] = useState(0)
  const [totalCO2Impact, setTotalCO2Impact] = useState(0)

  // Handle results from BulkScanner
  const handleScanResults = (results) => {
    if (!results || !Array.isArray(results)) return
    
    const newProducts = results.map(result => ({
      id: Date.now() + Math.random(), // Ensure unique IDs
      ...result.analysis
    }))
    
    setScannedProducts(prev => [...prev, ...newProducts])
  }

  // Calculate totals when products change
  useEffect(() => {
    if (scannedProducts.length === 0) {
      setTotalEcoScore(0)
      setTotalCO2Impact(0)
      return
    }

    const totalScore = scannedProducts.reduce((sum, product) => sum + product.ecoScore, 0)
    const averageScore = Math.round(totalScore / scannedProducts.length)
    const totalCO2 = scannedProducts.reduce((sum, product) => sum + product.co2Impact, 0)
    
    setTotalEcoScore(averageScore)
    setTotalCO2Impact(totalCO2)
  }, [scannedProducts])

  // Remove product
  const removeProduct = (id) => {
    setScannedProducts(prev => prev.filter(product => product.id !== id))
  }

  // Clear all products
  const clearAll = () => {
    setScannedProducts([])
  }

  // Export results
  const exportResults = () => {
    const csvContent = [
      ['Product Name', 'Brand', 'Category', 'Eco Score', 'CO2 Impact', 'Health Score'].join(','),
      ...scannedProducts.map(product => 
        [
          product.productName,
          product.brand,
          product.category,
          product.ecoScore,
          product.co2Impact,
          product.healthScore
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bulk-scan-results-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return '🌱'
    if (score >= 60) return '♻️'
    if (score >= 40) return '🌿'
    return '⚠️'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <Package className="inline mr-3" size={40} />
            Bulk Product Scanner
          </h1>
          <p className="text-xl text-gray-600">Analyze multiple products efficiently</p>
        </div>

        {/* Bulk Scanner */}
        <BulkScanner onResults={handleScanResults} />

        {/* Results Summary */}
        {scannedProducts.length > 0 && (
          <div className="mt-8 eco-card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Scan Results ({scannedProducts.length} products)
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={exportResults}
                  className="eco-button-secondary"
                >
                  <Download size={16} className="inline mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={clearAll}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  <Trash2 size={16} className="inline mr-2" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className={`text-3xl font-bold ${getScoreColor(totalEcoScore)}`}>
                  {getScoreIcon(totalEcoScore)} {totalEcoScore}
                </div>
                <div className="text-sm text-gray-600">Average Eco Score</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  🌍 {totalCO2Impact.toFixed(1)}kg
                </div>
                <div className="text-sm text-gray-600">Total CO2 Impact</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  ⭐ {Math.round((totalEcoScore / 100) * scannedProducts.length * 10)}
                </div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="space-y-4">
          {scannedProducts.map(product => (
            <EcoScoreCard 
              key={product.id} 
              product={product} 
              onRemove={() => removeProduct(product.id)}
            />
          ))}
          {scannedProducts.length === 0 && (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No products scanned yet
              </h3>
              <p className="text-gray-500">
                Upload some product images to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
