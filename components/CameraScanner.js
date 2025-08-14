import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, Upload, Search, Scan, Zap, X, RotateCcw } from 'lucide-react'
import EcoScoreCard from './EcoScoreCard'
import AlternativesList from './AlternativesList'

export default function CameraScanner({ mode, onScanResult, onEcoPointsEarned }) {
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
  const [facingMode, setFacingMode] = useState('environment') // 'user' for front camera

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.play()
      }
      setIsScanning(true)
      setError(null)
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.')
      console.error('Camera error:', err)
    }
  }, [facingMode, stream])

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
    if (mode === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => stopCamera()
  }, [mode, startCamera, stopCamera])

  // Capture and analyze image
  const captureAndAnalyze = async () => {
    if (!videoRef.current || loading) return

    setLoading(true)
    setError(null)

    try {
      // Capture frame from video
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      
      // Send to AI API
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.result)
        onScanResult?.(data.result)
        
        // Award points for scanning
        const points = Math.floor(data.result.ecoScore / 10) + 5
        onEcoPointsEarned?.(points)
        
        // Save to history
        saveToHistory(data.result)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      setError('Failed to analyze image. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageData = e.target?.result
        
        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        })

        const data = await response.json()
        
        if (data.success) {
          setResult(data.result)
          onScanResult?.(data.result)
          
          const points = Math.floor(data.result.ecoScore / 10) + 5
          onEcoPointsEarned?.(points)
          saveToHistory(data.result)
        } else {
          setError(data.error || 'Analysis failed')
        }
        setLoading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to process image. Please try again.')
      setLoading(false)
    }
  }

  // Handle text search
  const handleTextSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.result)
        onScanResult?.(data.result)
        
        const points = Math.floor(data.result.ecoScore / 10) + 3
        onEcoPointsEarned?.(points)
        saveToHistory(data.result)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Save scan to history
  const saveToHistory = (scanResult) => {
    if (typeof window !== 'undefined') {
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
    }
  }

  // Toggle camera facing mode
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  return (
    <div className="space-y-6">
      {/* Scanner Interface */}
      <div className="eco-card p-6">
        {mode === 'camera' && (
          <div className="relative">
            {/* Camera View */}
            <div className={`scanner-frame ${arMode ? 'ar-mode' : ''} ${window?.innerWidth < 768 ? 'mobile-scanner' : 'aspect-video'}`}>
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
                disabled={!isScanning || loading}
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

// Helper function to get eco icon based on score
function getEcoIcon(score) {
  if (score >= 80) return '🌱'
  if (score >= 60) return '♻️'
  if (score >= 40) return '🌿'
  return '⚠️'
}
