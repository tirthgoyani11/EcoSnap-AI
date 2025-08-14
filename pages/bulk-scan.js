import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Package, Plus, X, Trash2, Download, Upload, Scan } from 'lucide-react'
import EcoScoreCard from '../components/EcoScoreCard'

// Demo products for bulk scanning
const sampleProducts = [
  {
    id: 1,
    productName: 'Coca-Cola Classic 12oz Can',
    brand: 'Coca-Cola',
    category: 'Beverages',
    ecoScore: 32,
    packagingScore: 45,
    carbonScore: 25,
    ingredientScore: 20,
    certificationScore: 15,
    recyclable: true,
    co2Impact: 2.1,
    healthScore: 25,
    certifications: [],
    ecoDescription: 'High sugar content and significant environmental impact from production and packaging.',
    alternatives: []
  },
  {
    id: 2,
    productName: 'Organic Gala Apple',
    brand: 'Local Farm',
    category: 'Fresh Produce',
    ecoScore: 92,
    packagingScore: 95,
    carbonScore: 88,
    ingredientScore: 95,
    certificationScore: 90,
    recyclable: true,
    co2Impact: 0.1,
    healthScore: 95,
    certifications: ['USDA Organic', 'Local'],
    ecoDescription: 'Excellent eco-friendly choice with minimal packaging and local sourcing.',
    alternatives: []
  },
  {
    id: 3,
    productName: 'Plastic Water Bottle',
    brand: 'Generic',
    category: 'Beverages',
    ecoScore: 28,
    packagingScore: 20,
    carbonScore: 30,
    ingredientScore: 75,
    certificationScore: 10,
    recyclable: true,
    co2Impact: 1.8,
    healthScore: 80,
    certifications: [],
    ecoDescription: 'Single-use plastic with high environmental impact.',
    alternatives: []
  }
]

export default function BulkScan() {
  const [scannedProducts, setScannedProducts] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [currentScanMode, setCurrentScanMode] = useState('manual') // manual, camera, upload
  const [newProductName, setNewProductName] = useState('')
  const [totalEcoScore, setTotalEcoScore] = useState(0)
  const [totalCO2Impact, setTotalCO2Impact] = useState(0)

  // Calculate totals when products change
  useEffect(() => {
    const totalScore = scannedProducts.reduce((sum, product) => sum + product.ecoScore, 0)
    const averageScore = scannedProducts.length > 0 ? Math.round(totalScore / scannedProducts.length) : 0
    const totalCO2 = scannedProducts.reduce((sum, product) => sum + product.co2Impact, 0)
    
    setTotalEcoScore(averageScore)
    setTotalCO2Impact(totalCO2)
  }, [scannedProducts])

  // Add product manually
  const addManualProduct = () => {
    if (!newProductName.trim()) return

    setIsScanning(true)
    
    // Simulate scanning delay
    setTimeout(() => {
      // Get a random sample product and customize it
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
      const newProduct = {
        ...randomProduct,
        id: Date.now(),
        productName: newProductName,
        ecoDescription: `Analysis for "${newProductName}" - estimated based on product category.`
      }
      
      setScannedProducts(prev => [...prev, newProduct])
      setNewProductName('')
      setIsScanning(false)
      
      // Award points
      const points = Math.floor(newProduct.ecoScore / 10) + 2
      awardPoints(points)
    }, 1500)
  }

  // Simulate camera scanning
  const startCameraScan = () => {
    setIsScanning(true)
    
    setTimeout(() => {
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
      const newProduct = {
        ...randomProduct,
        id: Date.now() + Math.random()
      }
      
      setScannedProducts(prev => [...prev, newProduct])
      setIsScanning(false)
      
      const points = Math.floor(newProduct.ecoScore / 10) + 3
      awardPoints(points)
    }, 2000)
  }

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setIsScanning(true)
    
    // Simulate processing multiple files
    setTimeout(() => {
      const newProducts = files.map((file, index) => {
        const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
        return {
          ...randomProduct,
          id: Date.now() + index,
          productName: file.name.replace(/\.[^/.]+$/, "") // Remove file extension
        }
      })
      
      setScannedProducts(prev => [...prev, ...newProducts])
      setIsScanning(false)
      
      const totalPoints = newProducts.reduce((sum, product) => sum + Math.floor(product.ecoScore / 10) + 3, 0)
      awardPoints(totalPoints)
    }, 2500)
  }

  // Award points
  const awardPoints = (points) => {
    if (typeof window !== 'undefined') {
      const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0')
      localStorage.setItem('ecoPoints', (currentPoints + points).toString())
    }
  }

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
      <Head>
        <title>Bulk Scan - EcoSnap AI</title>
        <meta name="description" content="Scan multiple products at once for comprehensive eco analysis" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <Package className="inline mr-3" size={40} />
            Bulk Product Scanner
          </h1>
          <p className="text-xl text-gray-600">Analyze multiple products efficiently</p>
        </div>

        {/* Scanning Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Manual Entry */}
          <div className="eco-card p-6">
            <h3 className="text-lg font-semibold mb-4">Manual Entry</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && addManualProduct()}
              />
              <button
                onClick={addManualProduct}
                disabled={isScanning || !newProductName.trim()}
                className="w-full eco-button disabled:opacity-50"
              >
                {isScanning ? (
                  <div className="eco-spinner mx-auto" />
                ) : (
                  <>
                    <Plus size={16} className="inline mr-2" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Camera Scan */}
          <div className="eco-card p-6">
            <h3 className="text-lg font-semibold mb-4">Camera Scan</h3>
            <button
              onClick={startCameraScan}
              disabled={isScanning}
              className="w-full eco-button disabled:opacity-50"
            >
              {isScanning ? (
                <div className="eco-spinner mx-auto" />
              ) : (
                <>
                  <Scan size={16} className="inline mr-2" />
                  Quick Scan
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Demo mode - simulates camera scanning
            </p>
          </div>

          {/* File Upload */}
          <div className="eco-card p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
            <label className="w-full eco-button cursor-pointer block text-center">
              {isScanning ? (
                <div className="eco-spinner mx-auto" />
              ) : (
                <>
                  <Upload size={16} className="inline mr-2" />
                  Choose Files
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isScanning}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Select multiple product images
            </p>
          </div>
        </div>

        {/* Results Summary */}
        {scannedProducts.length > 0 && (
          <div className="eco-card p-6 mb-6">
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
          {scannedProducts.map((product) => (
            <div key={product.id} className="eco-card p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getScoreIcon(product.ecoScore)}</span>
                    <div>
                      <h3 className="font-semibold">{product.productName}</h3>
                      <p className="text-sm text-gray-600">{product.brand} • {product.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Eco Score:</span>
                      <span className={`ml-2 font-bold ${getScoreColor(product.ecoScore)}`}>
                        {product.ecoScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">CO2 Impact:</span>
                      <span className="ml-2">{product.co2Impact}kg</span>
                    </div>
                    <div>
                      <span className="font-medium">Health:</span>
                      <span className="ml-2">{product.healthScore}/100</span>
                    </div>
                    <div>
                      <span className="font-medium">Recyclable:</span>
                      <span className="ml-2">{product.recyclable ? '✅' : '❌'}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeProduct(product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {scannedProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No products scanned yet
            </h3>
            <p className="text-gray-500">
              Use one of the scanning methods above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
