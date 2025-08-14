'use client';

import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface ScanResult {
  filename: string;
  analysis: string;
}

export function BulkScanner() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    
    Array.from(e.target.files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process images');
      }

      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Error during bulk scan:', error);
      setError(error instanceof Error ? error.message : 'Failed to process images');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <div 
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          ${loading ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-blue-400'}
          transition-colors cursor-pointer
        `}
        onClick={() => !loading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-gray-600">Processing images...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">
              Click or drag and drop images to analyze
            </p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, WebP</p>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleBulkScan}
          className="hidden"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={index}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <h3 className="font-medium text-gray-900">{result.filename}</h3>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{result.analysis}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
