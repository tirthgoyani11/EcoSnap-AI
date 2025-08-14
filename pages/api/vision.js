import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Fallback data for demo purposes
const demoProducts = {
  'coca cola': {
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
      },
      {
        name: 'Spindrift Sparkling Water',
        brand: 'Spindrift',
        ecoScore: 78,
        price: 1.49,
        co2Impact: 0.5,
        rating: 4.3,
        whyBetter: 'Made with real fruit, no artificial ingredients, and sustainable packaging.',
        benefits: ['Real Fruit', 'No Artificial Ingredients', 'BPA-Free'],
        improvements: { co2Reduction: 76, betterScore: 46 }
      },
      {
        name: 'JUST Water',
        brand: 'JUST',
        ecoScore: 82,
        price: 2.49,
        co2Impact: 0.2,
        rating: 4.4,
        whyBetter: 'Plant-based packaging, ethically sourced spring water, and carbon neutral shipping.',
        benefits: ['Plant-Based Packaging', 'Spring Water', 'Carbon Neutral'],
        improvements: { co2Reduction: 90, betterScore: 50 }
      }
    ]
  },
  'apple': {
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
  'plastic bottle': {
    productName: 'Single-Use Plastic Water Bottle',
    brand: 'Generic',
    category: 'Beverages',
    ecoScore: 15,
    packagingScore: 10,
    carbonScore: 20,
    ingredientScore: 80,
    certificationScore: 5,
    recyclable: true,
    co2Impact: 3.2,
    healthScore: 75,
    certifications: [],
    ecoDescription: 'Poor environmental choice due to single-use plastic and high carbon footprint.',
    alternatives: [
      {
        name: 'Hydro Flask Water Bottle',
        brand: 'Hydro Flask',
        ecoScore: 88,
        price: 39.95,
        co2Impact: 0.02,
        rating: 4.8,
        whyBetter: 'Reusable stainless steel construction eliminates single-use plastic waste.',
        benefits: ['Reusable', 'Stainless Steel', 'Lifetime Use'],
        improvements: { co2Reduction: 99, betterScore: 73 }
      }
    ]
  }
}

const ecoScorePrompt = `
Analyze this product image and provide an eco-friendly assessment. Return a JSON object with:

{
  "productName": "detected product name",
  "brand": "brand name if visible",
  "category": "product category",
  "ecoScore": number 0-100 (overall eco-friendliness),
  "packagingScore": number 0-100 (packaging recyclability/sustainability),
  "carbonScore": number 0-100 (carbon footprint assessment),
  "ingredientScore": number 0-100 (ingredient naturalness/health),
  "certificationScore": number 0-100 (visible eco certifications),
  "recyclable": boolean,
  "co2Impact": estimated kg CO2 (number),
  "healthScore": number 0-100,
  "certifications": ["list of visible certifications"],
  "ecoDescription": "brief explanation of eco rating",
  "improvementTips": ["tip1", "tip2"],
  "alternatives": [
    {
      "name": "alternative product name",
      "brand": "brand name",
      "ecoScore": number 0-100,
      "price": estimated price,
      "co2Impact": kg CO2,
      "rating": 1-5 stars,
      "whyBetter": "explanation why this is better",
      "benefits": ["benefit1", "benefit2"],
      "improvements": {"co2Reduction": percentage, "betterScore": points better}
    }
  ]
}

Focus on:
- Packaging materials (plastic, glass, aluminum, cardboard)
- Visible certifications (organic, fair trade, energy star, etc.)
- Product type and typical environmental impact
- Suggest 2-3 realistic eco-friendly alternatives
- Be realistic with scores - very few products should score above 85
`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image } = req.body

    if (!image) {
      return res.status(400).json({ error: 'No image provided' })
    }

    // Convert base64 to format Gemini expects
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '')
    
    try {
      // Use Gemini 2.0 Flash for multimodal analysis
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

      const imageParts = [{
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }]

      const result = await model.generateContent([ecoScorePrompt, ...imageParts])
      const response = await result.response
      let analysisText = response.text()

      // Clean up response to extract JSON
      analysisText = analysisText.replace(/```json\n?|\n?```/g, '')
      
      let analysis
      try {
        analysis = JSON.parse(analysisText)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        // Fallback to demo data based on detected content
        const detectedText = analysisText.toLowerCase()
        
        if (detectedText.includes('coca') || detectedText.includes('coke')) {
          analysis = demoProducts['coca cola']
        } else if (detectedText.includes('apple') || detectedText.includes('fruit')) {
          analysis = demoProducts['apple']
        } else if (detectedText.includes('bottle') || detectedText.includes('water')) {
          analysis = demoProducts['plastic bottle']
        } else {
          // Generic fallback
          analysis = {
            productName: 'Unknown Product',
            brand: 'Unknown',
            category: 'General',
            ecoScore: 50,
            packagingScore: 50,
            carbonScore: 50,
            ingredientScore: 50,
            certificationScore: 50,
            recyclable: false,
            co2Impact: 1.5,
            healthScore: 50,
            certifications: [],
            ecoDescription: 'Product analysis unavailable. Try scanning a different angle or product.',
            alternatives: []
          }
        }
      }

      // Ensure all required fields are present
      analysis = {
        productName: 'Unknown Product',
        brand: 'Unknown',
        category: 'General',
        ecoScore: 50,
        packagingScore: 50,
        carbonScore: 50,
        ingredientScore: 50,
        certificationScore: 50,
        recyclable: false,
        co2Impact: 1.5,
        healthScore: 50,
        certifications: [],
        ecoDescription: 'Analysis completed.',
        alternatives: [],
        ...analysis
      }

      res.status(200).json({
        success: true,
        result: analysis
      })

    } catch (geminiError) {
      console.error('Gemini API Error:', geminiError)
      
      // Fallback to demo data
      const randomProduct = Object.values(demoProducts)[Math.floor(Math.random() * Object.keys(demoProducts).length)]
      
      res.status(200).json({
        success: true,
        result: {
          ...randomProduct,
          productName: 'Demo Product (AI Offline)',
          ecoDescription: 'Demo mode - Gemini API unavailable. This is sample data for testing.'
        }
      })
    }

  } catch (error) {
    console.error('Vision API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze image' 
    })
  }
}
