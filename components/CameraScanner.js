import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, Upload, Search, Scan, Zap, X, RotateCcw } from 'lucide-react'
import EcoScoreCard from './EcoScoreCard'
import AlternativesList from './AlternativesList'

// Demo products for fallback
const demoProducts = [
  {
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
    alternatives: [
      {
        name: 'Hint Water - Watermelon',
        brand: 'Hint',
        ecoScore: 85,
        price: 1.99,
        co2Impact: 0.3,
        rating: 4.5,
        whyBetter: 'Zero calories, natural flavoring, and aluminum packaging that\'s infinitely recyclable.',
        benefits: ['Zero Sugar', 'Natural', 'Recyclable'],
        improvements: { co2Reduction: 85, betterScore: 53 }
      }
    ]
  },
  {
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
    productName: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'Electronics',
    ecoScore: 58,
    packagingScore: 75,
    carbonScore: 42,
    ingredientScore: 65,
    certificationScore: 68,
    recyclable: true,
    co2Impact: 5.2,
    healthScore: 70,
    certifications: ['Energy Star'],
    ecoDescription: 'Good sustainability efforts but high carbon footprint from manufacturing.',
    alternatives: [
      {
        name: 'Fairphone 5',
        brand: 'Fairphone',
        ecoScore: 84,
        price: 699,
        co2Impact: 2.1,
        rating: 4.3,
        whyBetter: 'Repairable design, ethical sourcing, 8-year warranty, recycled materials.',
        benefits: ['Repairable', 'Ethical', '8-Year Warranty'],
        improvements: { co2Reduction: 60, betterScore: 26 }
      }
    ]
  }
]

export default function CameraScanner({ mode, onEcoPointsEarned }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [arMode, setArMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) return

    try {
      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        }
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Set stream first
      setStream(newStream)
      
      // Then update video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(console.error)
        }
      }
      
      setIsScanning(true)
      setError(null)
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions or try text search.')
      console.error('Camera error:', err)
      setIsScanning(false)
    }
  }, [facingMode])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }, [stream])

  // Initialize camera when mode changes
  useEffect(() => {
    if (!mounted) return
    
    if (mode === 'camera' && !isScanning) {
      startCamera()
    } else if (mode !== 'camera') {
      stopCamera()
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [mode, mounted])

  // Handle facing mode changes separately to avoid re-initialization
  useEffect(() => {
    if (mode === 'camera' && isScanning) {
      startCamera()
    }
  }, [facingMode])

  // Capture and analyze with real API
  const captureAndAnalyze = async () => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      let imageData = null
      
      // Capture image from video if camera is active
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)
        imageData = canvas.toDataURL('image/jpeg', 0.8)
      }
      
      // Call vision API
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          query: 'analyze this product for sustainability'
        })
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const productData = await response.json()
      setResult(productData)
      
      // Award points for scanning
      const points = Math.floor(productData.ecoScore / 10) + 5
      onEcoPointsEarned?.(points)
      
      // Save to history
      saveToHistory(productData)
    } catch (err) {
      setError('Analysis failed. Please try again or check your connection.')
      console.error('Analysis error:', err)
      
      // Fallback to demo data
      const randomProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)]
      setResult(randomProduct)
      const points = Math.floor(randomProduct.ecoScore / 10) + 5
      onEcoPointsEarned?.(points)
      saveToHistory(randomProduct)
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload with real API
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
      
      // Call vision API with uploaded image
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          query: `analyze this product image for sustainability: ${file.name}`
        })
      })
      
      if (!response.ok) {
        throw new Error('Image analysis failed')
      }
      
      const productData = await response.json()
      setResult(productData)
      
      const points = Math.floor(productData.ecoScore / 10) + 5
      onEcoPointsEarned?.(points)
      saveToHistory(productData)
      
    } catch (err) {
      setError('Failed to process image. Please try again or check your connection.')
      console.error('Upload error:', err)
      
      // Fallback to demo data
      const randomProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)]
      setResult({ ...randomProduct, productName: `${file.name} (Demo Analysis)` })
      const points = Math.floor(randomProduct.ecoScore / 10) + 5
      onEcoPointsEarned?.(points)
      saveToHistory(randomProduct)
    } finally {
      setLoading(false)
    }
  }

  // Handle text search with real API
  const handleTextSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Call vision API for text-based product search
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          // No image data for text search
        })
      })
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const productData = await response.json()
      setResult(productData)
      
      const points = Math.floor(productData.ecoScore / 10) + 3
      onEcoPointsEarned?.(points)
      saveToHistory(productData)
      
    } catch (err) {
      setError('Search failed. Please try again or check your connection.')
      console.error('Search error:', err)
      
      // Fallback to demo data matching logic
      const query = searchQuery.toLowerCase()
      let matchedProduct = demoProducts.find(p => 
        p.productName.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
      
      if (!matchedProduct) {
        matchedProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)]
        matchedProduct = {
          ...matchedProduct,
          productName: searchQuery,
          ecoDescription: `Demo analysis for "${searchQuery}". Add GEMINI_API_KEY for real AI analysis.`
        }
      }
      
      setResult(matchedProduct)
      const points = Math.floor(matchedProduct.ecoScore / 10) + 3
      onEcoPointsEarned?.(points)
      saveToHistory(matchedProduct)
    } finally {
      setLoading(false)
    }
  }

  // Save scan to history
  const saveToHistory = (scanResult) => {
    if (typeof window !== 'undefined') {
      try {
        const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
        const newScan = {
          ...scanResult,
          timestamp: new Date().toISOString(),
          id: Date.now()
        }
        history.unshift(newScan)
        // Keep only last 50 scans
        if (history.length > 50) history.pop()
        localStorage.setItem('scanHistory', JSON.stringify(history))
      } catch (error) {
        console.error('Failed to save to history:', error)
      }
    }
  }

  // Toggle camera facing mode
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  const getEcoIcon = (score) => {
    if (score >= 80) return '🌱'
    if (score >= 60) return '♻️'
    if (score >= 40) return '🌿'
    return '⚠️'
  }

  if (!mounted) {
    return <div className="eco-spinner mx-auto"></div>
  }

  return (
    <div className="space-y-6">
      {/* Scanner Interface */}
      <div className="eco-card p-6">
        {mode === 'camera' && (
          <div className="relative">
            {/* Camera View */}
            <div className="scanner-frame">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanner Overlay */}
              {isScanning && <div className="scanner-overlay" />}
              
              {/* AR Overlay */}
              {arMode && result && (
                <div className="ar-overlay">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getEcoIcon(result.ecoScore)}</span>
                    <div>
                      <div className="font-bold">Eco Score: {result.ecoScore}/100</div>
                      <div className="text-sm opacity-90">{result.productName}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              <button
                onClick={toggleCamera}
                className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                title="Switch Camera"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={captureAndAnalyze}
                disabled={loading}
                className="eco-button px-8 py-3 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="eco-spinner mx-auto" />
                ) : (
                  <>
                    <Scan className="inline mr-2" size={20} />
                    Scan Product
                  </>
                )}
              </button>

              <button
                onClick={() => setArMode(!arMode)}
                className={`p-3 rounded-full transition-colors ${
                  arMode ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title="AR Mode"
              >
                <Zap size={20} />
              </button>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-500 transition-colors">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Click to upload product image</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="eco-button"
              >
                {loading ? <div className="eco-spinner mx-auto" /> : 'Choose Image'}
              </button>
            </div>
          </div>
        )}

        {mode === 'search' && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter product name (e.g., Coca Cola, iPhone 15)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
              />
              <button
                onClick={handleTextSearch}
                disabled={loading || !searchQuery.trim()}
                className="eco-button disabled:opacity-50"
              >
                {loading ? <div className="eco-spinner" /> : <Search size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mt-4">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          <EcoScoreCard product={result} />
          <AlternativesList alternatives={result.alternatives} />
        </div>
      )}
    </div>
  )
}
