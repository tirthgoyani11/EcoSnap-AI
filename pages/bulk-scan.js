import { useState, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Scan, Trash2, BarChart3, Leaf, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BulkScan() {
  const [scannedItems, setScannedItems] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)

  // Sample products for demo
  const demoProducts = [
    {
      id: 1,
      productName: 'Coca-Cola Classic 12oz Can',
      brand: 'Coca-Cola',
      ecoScore: 32,
      co2Impact: 2.1,
      price: 1.25,
      category: 'Beverages',
      image: null
    },
    {
      id: 2,
      productName: 'Organic Bananas',
      brand: 'Local Farm',
      ecoScore: 89,
      co2Impact: 0.3,
      price: 2.50,
      category: 'Produce',
      image: null
    },
    {
      id: 3,
      productName: 'Plastic Water Bottle',
      brand: 'Generic',
      ecoScore: 15,
      co2Impact: 3.2,
      price: 0.99,
      category: 'Beverages',
      image: null
    }
  ]

  const startScanning = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.play()
      }
      setIsScanning(true)
    } catch (err) {
      console.error('Camera error:', err)
    }
  }

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const scanProduct = async () => {
    if (!isScanning) {
      await startScanning()
      return
    }

    setLoading(true)
    
    // Simulate scanning with demo products
    setTimeout(() => {
      const randomProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)]
      const newItem = {
        ...randomProduct,
        id: Date.now(),
        quantity: 1,
        timestamp: new Date().toISOString()
      }
      
      setScannedItems(prev => [...prev, newItem])
      setLoading(false)
      
      // Award points
      const points = Math.floor(randomProduct.ecoScore / 10) + 2
      const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0')
      localStorage.setItem('ecoPoints', (currentPoints + points).toString())
    }, 1500)
  }

  const removeItem = (id) => {
    setScannedItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setScannedItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const addDemoItems = () => {
    const newItems = demoProducts.map((product, index) => ({
      ...product,
      id: Date.now() + index,
      quantity: Math.floor(Math.random() * 3) + 1,
      timestamp: new Date().toISOString()
    }))
    setScannedItems(prev => [...prev, ...newItems])
  }

  // Calculate cart statistics
  const cartStats = scannedItems.reduce((stats, item) => {
    const itemTotal = item.quantity
    return {
      totalItems: stats.totalItems + itemTotal,
      totalCost: stats.totalCost + (item.price * itemTotal),
      totalCO2: stats.totalCO2 + (item.co2Impact * itemTotal),
      avgEcoScore: stats.avgEcoScore + (item.ecoScore * itemTotal),
      categories: stats.categories.add(item.category)
    }
  }, { 
    totalItems: 0, 
    totalCost: 0, 
    totalCO2: 0, 
    avgEcoScore: 0,
    categories: new Set()
  })

  if (cartStats.totalItems > 0) {
    cartStats.avgEcoScore = Math.round(cartStats.avgEcoScore / cartStats.totalItems)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-green-500 bg-green-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const CartItem = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border"
    >
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{item.productName}</h4>
        <p className="text-sm text-gray-600">{item.brand} • {item.category}</p>
        <div className="flex items-center space-x-4 mt-2">
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(item.ecoScore)}`}>
            {item.ecoScore}/100
          </div>
          <span className="text-sm text-gray-500">{item.co2Impact}kg CO₂</span>
          <span className="text-sm font-medium text-gray-800">${item.price.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 ml-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
          >
            -
          </button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
          >
            +
          </button>
        </div>
        <button
          onClick={() => removeItem(item.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen eco-gradient">
      <Head>
        <title>Bulk Scan - EcoSnap AI</title>
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
            <h1 className="text-white text-xl font-bold">Bulk Cart Scan</h1>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-2">
            <ShoppingCart className="text-white" size={16} />
            <span className="text-white font-semibold">{cartStats.totalItems} items</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-20">
        {/* Scanner Section */}
        <div className="eco-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Scan className="mr-2" size={20} />
            Scan Your Cart
          </h3>

          {!isScanning ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">Scan multiple products to analyze your cart's eco impact</p>
              <div className="space-x-4">
                <button onClick={scanProduct} className="eco-button">
                  Start Scanning
                </button>
                <button 
                  onClick={addDemoItems} 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Add Demo Items
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="scanner-frame aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="scanner-overlay" />
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={scanProduct}
                  disabled={loading}
                  className="eco-button px-8 py-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="eco-spinner mx-auto" />
                  ) : (
                    <>
                      <Scan className="inline mr-2" size={16} />
                      Scan Item
                    </>
                  )}
                </button>
                <button
                  onClick={stopScanning}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Stop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cartStats.totalItems > 0 && (
          <div className="eco-card p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Cart Eco Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{cartStats.totalItems}</div>
                <div className="text-sm text-blue-800">Total Items</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className={`text-2xl font-bold px-2 py-1 rounded ${getScoreColor(cartStats.avgEcoScore)}`}>
                  {cartStats.avgEcoScore}
                </div>
                <div className="text-sm text-gray-600 mt-1">Avg Eco Score</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{cartStats.totalCO2.toFixed(1)}kg</div>
                <div className="text-sm text-purple-800">Total CO₂</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">${cartStats.totalCost.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
            </div>

            {/* Eco Insights */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🌱 Eco Insights</h4>
              <div className="space-y-2 text-sm">
                {cartStats.avgEcoScore < 50 && (
                  <p className="text-orange-700">
                    ⚠️ Your cart could be more eco-friendly. Consider swapping some items for greener alternatives.
                  </p>
                )}
                {cartStats.totalCO2 > 10 && (
                  <p className="text-red-700">
                    🌍 High carbon footprint detected. Look for local or low-carbon alternatives.
                  </p>
                )}
                {cartStats.avgEcoScore >= 70 && (
                  <p className="text-green-700">
                    ✨ Great job! Your cart has a good eco score. You're making sustainable choices!
                  </p>
                )}
                <p className="text-gray-600">
                  Categories: {Array.from(cartStats.categories).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scanned Items List */}
        {scannedItems.length > 0 && (
          <div className="eco-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Scanned Items</h3>
              <button
                onClick={() => setScannedItems([])}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {scannedItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-4">
              <button className="eco-button flex-1">
                <TrendingUp className="inline mr-2" size={16} />
                Get Eco Recommendations
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg">
                Share Cart
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {scannedItems.length === 0 && (
          <div className="eco-card p-8 text-center">
            <ShoppingCart className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Your Cart is Empty</h3>
            <p className="text-gray-500 mb-4">
              Start scanning products to analyze your shopping cart's environmental impact!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
