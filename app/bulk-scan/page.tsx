'use client';

import { useState, useEffect } from 'react';
import { Package, Upload, FileImage, AlertCircle, Check, X, Download, Trash2, RefreshCw } from 'lucide-react';
import { BulkScanner } from '../../components/BulkScanner';

export interface Product {
  id: number;
  productName: string;
  brand: string;
  category: string;
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

export default function BulkScan() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalEcoScore: 0,
    totalCO2Impact: 0,
    averageScore: 0,
    recyclableCount: 0
  });

  useEffect(() => {
    if (products.length > 0) {
      const totalEco = products.reduce((sum, p) => sum + p.ecoScore, 0);
      const totalCO2 = products.reduce((sum, p) => sum + p.co2Impact, 0);
      const recyclable = products.filter(p => p.recyclable).length;

      setStats({
        totalEcoScore: totalEco,
        totalCO2Impact: totalCO2,
        averageScore: Math.round(totalEco / products.length),
        recyclableCount: recyclable
      });
    } else {
      setStats({
        totalEcoScore: 0,
        totalCO2Impact: 0,
        averageScore: 0,
        recyclableCount: 0
      });
    }
  }, [products]);

  const handleScanResults = (results: any[]) => {
    if (!results || !Array.isArray(results)) return;
    setIsProcessing(true);
    
    const newProducts = results.map(result => ({
      id: Date.now() + Math.random(),
      ...result.analysis
    }));
    
    setProducts(prev => [...prev, ...newProducts]);
    setIsProcessing(false);
  };

  const handleRemoveProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    setProducts([]);
  };

  const exportToCSV = () => {
    const headers = [
      'Product Name',
      'Brand',
      'Category',
      'Eco Score',
      'CO2 Impact',
      'Health Score',
      'Recyclable'
    ].join(',');

    const rows = products.map(p => [
      p.productName,
      p.brand,
      p.category,
      p.ecoScore,
      p.co2Impact.toFixed(2),
      p.healthScore,
      p.recyclable ? 'Yes' : 'No'
    ].join(','));

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eco-scan-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-green-500 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '⚠️';
    return '❌';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <Package className="mr-3" size={40} />
            Bulk Product Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload multiple product images to analyze their environmental impact, 
            sustainability scores, and get detailed eco-friendly insights.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="mr-2" size={24} />
                Upload Products
              </h2>
              <BulkScanner onResults={handleScanResults} />
            </div>

            {/* Results List */}
            {products.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FileImage className="mr-2" size={24} />
                    Analyzed Products ({products.length})
                  </h2>
                  <div className="flex space-x-3">
                    <button 
                      onClick={exportToCSV}
                      className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Download size={16} className="mr-1" />
                      Export CSV
                    </button>
                    <button 
                      onClick={handleClearAll}
                      className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Product Cards */}
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{product.productName}</h3>
                          <p className="text-gray-600">{product.brand} • {product.category}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className={`rounded-lg p-3 ${getScoreColor(product.ecoScore)}`}>
                          <div className="text-lg font-semibold">
                            {getScoreEmoji(product.ecoScore)} {product.ecoScore}
                          </div>
                          <div className="text-sm">Eco Score</div>
                        </div>
                        <div className="rounded-lg p-3 bg-blue-50 text-blue-600">
                          <div className="text-lg font-semibold">{product.co2Impact.toFixed(1)}kg</div>
                          <div className="text-sm">CO2 Impact</div>
                        </div>
                        <div className={`rounded-lg p-3 ${getScoreColor(product.healthScore)}`}>
                          <div className="text-lg font-semibold">{product.healthScore}</div>
                          <div className="text-sm">Health Score</div>
                        </div>
                        <div className="rounded-lg p-3 bg-gray-50">
                          <div className="text-lg font-semibold">
                            {product.recyclable ? '♻️ Yes' : '❌ No'}
                          </div>
                          <div className="text-sm">Recyclable</div>
                        </div>
                      </div>

                      {product.ecoDescription && (
                        <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {product.ecoDescription}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Analysis Summary</h2>
              
              {products.length > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600 mb-1">Average Eco Score</div>
                      <div className="text-3xl font-bold text-green-700">
                        {stats.averageScore} {getScoreEmoji(stats.averageScore)}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600 mb-1">Total CO2 Impact</div>
                      <div className="text-3xl font-bold text-blue-700">
                        {stats.totalCO2Impact.toFixed(1)}kg
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-600 mb-1">Recyclable Products</div>
                      <div className="text-3xl font-bold text-purple-700">
                        {stats.recyclableCount}/{products.length}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                        <div className="text-sm text-gray-500">Products</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round((stats.recyclableCount / products.length) * 100)}%
                        </div>
                        <div className="text-sm text-gray-500">Recyclable</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-500">
                    Upload some product images to see analysis summary
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="animate-spin text-blue-500" size={24} />
            <p className="text-gray-700">Processing images...</p>
          </div>
        </div>
      )}
    </div>
  );
}
