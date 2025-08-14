import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image, query } = req.body

    if (!image && !query) {
      return res.status(400).json({ error: 'Image data or query required' })
    }

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // Return demo data if no API key
      return getDemoResponse(query || 'product')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    let prompt = `
Analyze this product and provide a comprehensive eco-friendly assessment. Return the response in valid JSON format with the following structure:

{
  "productName": "Product name",
  "brand": "Brand name", 
  "category": "Product category",
  "ecoScore": 85,
  "packagingScore": 90,
  "carbonScore": 80,
  "ingredientScore": 85,
  "certificationScore": 75,
  "recyclable": true,
  "co2Impact": 1.2,
  "healthScore": 88,
  "certifications": ["USDA Organic", "Fair Trade"],
  "ecoDescription": "Detailed explanation of environmental impact",
  "alternatives": [
    {
      "name": "Alternative product name",
      "brand": "Brand",
      "ecoScore": 92,
      "price": 15.99,
      "co2Impact": 0.8,
      "rating": 4.5,
      "whyBetter": "Explanation of why it's better",
      "benefits": ["Benefit 1", "Benefit 2"],
      "improvements": {
        "co2Reduction": 30,
        "betterScore": 15
      }
    }
  ]
}

Scoring guidelines:
- ecoScore: Overall environmental impact (0-100, higher is better)
- packagingScore: Sustainability of packaging materials
- carbonScore: Carbon footprint consideration  
- ingredientScore: Ingredient sustainability and sourcing
- certificationScore: Environmental certifications
- healthScore: Health impact of the product
- co2Impact: Estimated CO2 impact in kg
- All scores should be realistic and well-reasoned

Focus on sustainability, environmental impact, packaging, carbon footprint, and suggest 1-3 better eco-friendly alternatives if applicable.
`

    let result
    if (image) {
      // Handle image analysis
      const imageData = image.replace(/^data:image\/[a-z]+;base64,/, '')
      
      const imageParts = [
        {
          inlineData: {
            data: imageData,
            mimeType: "image/jpeg"
          }
        }
      ]
      
      result = await model.generateContent([prompt, ...imageParts])
    } else {
      // Handle text-based query
      prompt += `\n\nAnalyze the product: "${query}"`
      result = await model.generateContent(prompt)
    }

    const response = await result.response
    let text = response.text()

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim()
    
    try {
      const analysisData = JSON.parse(text)
      
      // Validate required fields and add defaults if missing
      const validatedData = {
        productName: analysisData.productName || 'Unknown Product',
        brand: analysisData.brand || 'Unknown Brand',
        category: analysisData.category || 'General',
        ecoScore: Math.min(100, Math.max(0, analysisData.ecoScore || 50)),
        packagingScore: Math.min(100, Math.max(0, analysisData.packagingScore || 50)),
        carbonScore: Math.min(100, Math.max(0, analysisData.carbonScore || 50)),
        ingredientScore: Math.min(100, Math.max(0, analysisData.ingredientScore || 50)),
        certificationScore: Math.min(100, Math.max(0, analysisData.certificationScore || 0)),
        recyclable: analysisData.recyclable ?? true,
        co2Impact: Math.max(0, analysisData.co2Impact || 1.0),
        healthScore: Math.min(100, Math.max(0, analysisData.healthScore || 70)),
        certifications: Array.isArray(analysisData.certifications) ? analysisData.certifications : [],
        ecoDescription: analysisData.ecoDescription || 'Environmental analysis not available.',
        alternatives: Array.isArray(analysisData.alternatives) ? analysisData.alternatives : []
      }

      return res.status(200).json(validatedData)
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw text:', text)
      // Return demo data if parsing fails
      return getDemoResponse(query || 'product')
    }

  } catch (error) {
    console.error('Vision API error:', error)
    
    // Return demo data as fallback
    return getDemoResponse(req.body.query || 'product')
  }
}

function getDemoResponse(query = 'product') {
  const demoProducts = [
    {
      productName: query.includes('coca') || query.includes('cola') ? 'Coca-Cola Classic 12oz Can' : 
                   query.includes('apple') ? 'Organic Gala Apple' :
                   query.includes('phone') || query.includes('iphone') ? 'iPhone 15 Pro' :
                   query.includes('water') ? 'Plastic Water Bottle' : 
                   `${query} (Demo Analysis)`,
      brand: query.includes('coca') ? 'Coca-Cola' : 
             query.includes('apple') ? 'Local Farm' :
             query.includes('phone') ? 'Apple' :
             'Generic Brand',
      category: query.includes('coca') || query.includes('water') ? 'Beverages' :
                query.includes('apple') ? 'Fresh Produce' :
                query.includes('phone') ? 'Electronics' : 'General',
      ecoScore: Math.floor(Math.random() * 60) + 30,
      packagingScore: Math.floor(Math.random() * 50) + 40,
      carbonScore: Math.floor(Math.random() * 60) + 25,
      ingredientScore: Math.floor(Math.random() * 40) + 50,
      certificationScore: Math.floor(Math.random() * 30) + 10,
      recyclable: Math.random() > 0.3,
      co2Impact: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
      healthScore: Math.floor(Math.random() * 40) + 40,
      certifications: Math.random() > 0.5 ? ['Demo Certification'] : [],
      ecoDescription: `Demo analysis for "${query}". This is placeholder data. Add your GEMINI_API_KEY to .env.local for real AI-powered analysis.`,
      alternatives: Math.random() > 0.4 ? [
        {
          name: `Eco-Friendly Alternative to ${query}`,
          brand: 'EcoChoice',
          ecoScore: Math.floor(Math.random() * 20) + 80,
          price: Math.round((Math.random() * 20 + 10) * 100) / 100,
          co2Impact: Math.round((Math.random() * 1.5 + 0.2) * 10) / 10,
          rating: Math.round((Math.random() * 1 + 4) * 10) / 10,
          whyBetter: 'More sustainable materials and production process.',
          benefits: ['Sustainable', 'Lower Impact', 'Recyclable'],
          improvements: {
            co2Reduction: Math.floor(Math.random() * 40) + 20,
            betterScore: Math.floor(Math.random() * 30) + 15
          }
        }
      ] : []
    }
  ]

  return {
    status: 200,
    json: (data) => Promise.resolve(demoProducts[0])
  }
}
