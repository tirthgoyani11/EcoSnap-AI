'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Search, X, Square } from 'lucide-react';

interface ScannerProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onResult, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [html5QrCode, setHtml5QrCode] = useState<any>(null);
  const [mode, setMode] = useState<'camera' | 'file'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  // Initialize html5-qrcode only on client side
  useEffect(() => {
    let qrCodeScanner: any = null;

    const initializeScanner = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Dynamic import to ensure client-side only loading
        const { Html5QrcodeScanner, Html5Qrcode } = await import('html5-qrcode');
        
        // Create scanner instance
        qrCodeScanner = new Html5Qrcode('qr-reader');
        setHtml5QrCode(qrCodeScanner);
      } catch (err) {
        console.error('Failed to initialize QR scanner:', err);
        setError('Failed to initialize scanner');
        onError?.('Failed to initialize scanner');
      }
    };

    initializeScanner();

    // Cleanup function
    return () => {
      if (qrCodeScanner) {
        try {
          qrCodeScanner.stop().catch(console.error);
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
    };
  }, [onError]);

  const startScanning = async () => {
    if (!html5QrCode || isScanning) return;

    try {
      setError(null);
      setIsScanning(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera
        config,
        (decodedText: string) => {
          // Success callback
          console.log('QR Code detected:', decodedText);
          stopScanning();
          onResult?.(decodedText);
        },
        (errorMessage: string) => {
          // Error callback (called frequently, so we don't show these errors)
          // console.log('QR scan error:', errorMessage);
        }
      );
    } catch (err: any) {
      console.error('Failed to start scanning:', err);
      setError('Failed to start camera. Please check permissions.');
      onError?.('Failed to start camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (!html5QrCode || !isScanning) return;

    try {
      await html5QrCode.stop();
      setIsScanning(false);
    } catch (err) {
      console.error('Failed to stop scanning:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !html5QrCode) return;

    try {
      setError(null);
      const result = await html5QrCode.scanFile(file, true);
      console.log('QR Code from file:', result);
      onResult?.(result);
    } catch (err: any) {
      console.error('Failed to scan file:', err);
      setError('No QR code found in the selected image.');
      onError?.('No QR code found in the selected image.');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      {/* Mode Selection */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setMode('camera')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
            mode === 'camera'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Camera size={16} />
          <span>Camera</span>
        </button>
        <button
          onClick={() => setMode('file')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
            mode === 'file'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>
      </div>

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="space-y-4">
          {/* Scanner Container */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
            <div id="qr-reader" ref={scannerRef} className="w-full"></div>
          </div>

          {/* Camera Controls */}
          <div className="flex space-x-2">
            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={!html5QrCode}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Camera size={18} />
                <span>Start Scanning</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Square size={18} />
                <span>Stop Scanning</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* File Upload Mode */}
      {mode === 'file' && (
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">Click to upload an image with QR code</p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, WebP</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <div className="font-medium mb-1">Instructions:</div>
        <ul className="list-disc list-inside space-y-1">
          <li>Point your camera at a QR code or barcode</li>
          <li>Make sure the code is well-lit and in focus</li>
          <li>The scanner will automatically detect and decode the code</li>
        </ul>
      </div>
    </div>
  );
};

export default Scanner;
