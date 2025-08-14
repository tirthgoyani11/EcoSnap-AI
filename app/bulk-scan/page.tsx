'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
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

  const handleScanResults = (results: any[]) => {
    if (!results || !Array.isArray(results)) return;
    
    const newProducts = results.map(result => ({
      id: Date.now() + Math.random(),
      ...result.analysis
    }));
    
    setProducts(prev => [...prev, ...newProducts]);
  };

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

        <BulkScanner onResults={handleScanResults} />
      </div>
    </div>
  );
}
