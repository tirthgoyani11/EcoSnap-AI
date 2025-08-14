import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Extended demo product database
const productDatabase = {
  'coca cola': {
    productName: 'Coca-Cola Classic 12oz Can',
    brand: 'Coca-Cola',
    category: 'Soft Drinks',
    ecoScore: 32,
    packagingScore: 45,
    carbonScore: 25,
    ingredientScore: 20,
    certificationScore: 15,
    alternatives: [
      {
        name: 'Hint Water - Watermelon',
        brand: 'Hint',
        ecoScore: 85,
        price: 1.99,
        whyBetter: 'Zero calories, natural flavoring, recyclable aluminum packaging'
      }
    ]
  },
  'pepsi': {
    productName: 'Pepsi Cola 12oz Can',
    brand: 'PepsiCo',
    category: 'Soft Drinks',
    ecoScore: 30,
    packagingScore: 45,
    carbonScore: 23,
    ingredientScore: 18,
    certificationScore: 12,
    alternatives: [
      {
        name: 'La Croix Sparkling Water',
        brand: 'La Croix',
        ecoScore: 82,
        price: 0.99,
        whyBetter: 'Zero calories, natural essence, recyclable aluminum can'
      }
    ]
  },
  'iphone 15': {
    productName: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'Electronics',
    ecoScore: 58,
    packagingScore: 75,
    carbonScore: 42,
    ingredientScore: 65,
    certificationScore: 68,
    certifications: ['Energy Star', 'Carbon Neutral by 2030'],
    alternatives: [
      {
        name: 'Fairphone 5',
        brand: 'Fairphone',
        ecoScore: 84,
        price: 699,
        whyBetter: 'Repairable design, ethical sourcing, 8-year warranty, recycled materials'
      },
      {
        name: 'Google Pixel 8a',
        brand: 'Google',
        ecoScore: 72,
        price: 499,
        whyBetter: 'Made with recycled materials, carbon neutral shipping, 7-year updates'
      }
    ]
  },
  'nike shoes': {
    productName: 'Nike Air Max 90',
    brand: 'Nike',
    category: 'Footwear',
    ecoScore: 45,
    packagingScore: 35,
    carbonScore: 40,
    ingredientScore: 50,
    certificationScore: 55,
    alternatives: [
      {
        name: 'Allbirds Tree Runners',
        brand: 'Allbirds',
        ecoScore: 88,
        price: 98,
        whyBetter: 'Made from eucalyptus tree fiber, carbon negative, machine washable'
      },
      {
        name: 'Veja V-10',
        brand: 'Veja',
        ecoScore: 85,
        price: 150,
        whyBetter: 'Organic cotton, wild rubber, transparent supply chain'
      }
    ]
  },
  'detergent': {
    productName: 'Tide Original Liquid Detergent',
    brand: 'Tide',
    category: 'Household',
    ecoScore: 42,
    packagingScore: 30,
    carbonScore: 35,
    ingredientScore: 45,
    certificationScore: 60,
    alternatives: [
      {
        name: 'Seventh Generation Free & Clear',
        brand: 'Seventh Generation',
        ecoScore: 85,
        price: 8.99,
        whyBetter: 'Plant-based ingredients, concentrated formula, recyclable packaging'
      },
      {
        name: 'Dropps Stain & Odor Pods',
        brand: 'Dropps',
        ecoScore: 87,
        price: 15.99,
        whyBetter: 'Zero plastic packaging, biodegradable pods, EPA Safer Choice certified'
      }
    ]
  },
  'shampoo': {
    productName: 'Head & Shoulders Classic Clean',
    brand: 'Head & Shoulders',
    category: 'Personal Care',
    ecoScore: 38,
    packagingScore: 25,
    carbonScore: 40,
    ingredientScore: 35,
    certificationScore: 52,
    alternatives: [
      {
        name: 'Ethique Solid Shampoo Bar',
        brand: 'Ethique',
        ecoScore: 92,
        price: 15.99,
        whyBetter: 'Zero plastic packaging, concentrated formula, compostable wrapper'
      },
      {
        name: 'Plaine Products Shampoo',
        brand: 'Plaine Products',
        ecoScore: 89,
        price: 24.00,
        whyBetter: 'Refillable aluminum bottles, organic ingredients, carbon neutral shipping'
      }
    ]
  }
}

const searchPrompt = `
Based on the product search query, provide an eco-friendly assessment. Return a JSON object with:

{
  "productName": "full product name",
  "brand": "brand name",
  "category": "product category",
  "ecoScore": number 0-100,
  "packagingScore": number 0-100,
  "carbonScore": number 0-100,
  "ingredientScore": number 0-100,
  "certificationScore": number 0-100,
  "recyclable": boolean,
  "co2Impact": estimated kg CO2,
  "healthScore": number 0-100,
  "certifications": ["list of certifications"],
  "ecoDescription": "explanation of eco score",
  "alternatives": [
    {
      "name": "alternative name",
      "brand": "brand",
      "ecoScore": number 0-100,
      "price": estimated price,
      "co2Impact": kg CO2,
      "rating": 1-5,
      "whyBetter": "why it's better",
      "benefits": ["benefit1", "benefit2"],
      "improvements": {"co2Reduction": percentage, "betterScore": points}
    }
  ]
}

For the search query, consider:
- Common product variants and brands
- Typical environmental impact for the category
- Realistic eco-friendly alternatives available in the market
- Price ranges for the product category
`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'No search query provided' })
    }

    const searchQuery = query.toLowerCase().trim()

    // First check local database for exact matches
    let result = null
    for (const [key, product] of Object.entries(productDatabase)) {
      if (searchQuery.includes(key) || key.includes(searchQuery)) {
        result = { ...product }
        break
      }
    }

    // If no local match, try Gemini API
    if (!result && process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
        
        const prompt = `${searchPrompt}\n\nProduct search query: "${query}"`
        
        const geminiResult = await model.generateContent(prompt)
        const response = await geminiResult.response
        let analysisText = response.text()

        // Clean up response
        analysisText = analysisText.replace(/```json\n?|\n?```/g, '')
        
        try {
          result = JSON.parse(analysisText)
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError)
          result = null
        }
      } catch (geminiError) {
        console.error('Gemini Search Error:', geminiError)
      }
    }

    // Final fallback for unknown products
    if (!result) {
      const category = getProductCategory(searchQuery)
      result = {
        productName: query,
        brand: 'Unknown Brand',
        category: category,
        ecoScore: Math.floor(Math.random() * 40) + 30, // 30-70 range
        packagingScore: Math.floor(Math.random() * 50) + 25,
        carbonScore: Math.floor(Math.random() * 50) + 25,
        ingredientScore: Math.floor(Math.random() * 60) + 20,
        certificationScore: Math.floor(Math.random() * 30) + 10,
        recyclable: Math.random() > 0.3,
        co2Impact: Math.random() * 3 + 0.5,
        healthScore: Math.floor(Math.random() * 60) + 20,
        certifications: [],
        ecoDescription: `This ${category.toLowerCase()} has moderate environmental impact. Consider looking for certified eco-friendly alternatives.`,
        alternatives: [
          {
            name: `Eco-Friendly ${category} Alternative`,
            brand: 'Green Brand',
            ecoScore: 85,
            price: 15.99,
            co2Impact: 0.3,
            rating: 4.5,
            whyBetter: 'Made with sustainable materials, recyclable packaging, and ethical production practices.',
            benefits: ['Sustainable', 'Recyclable', 'Ethically Made'],
            improvements: { co2Reduction: 60, betterScore: 35 }
          }
        ]
      }
    }

    // Ensure all fields are properly formatted
    result = {
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
      ecoDescription: 'Product information retrieved.',
      alternatives: [],
      ...result
    }

    res.status(200).json({
      success: true,
      result: result
    })

  } catch (error) {
    console.error('Search API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Search failed' 
    })
  }
}

// Helper function to categorize products
function getProductCategory(query) {
  const categoryMap = {
    'food': ['food', 'snack', 'cereal', 'bread', 'milk', 'cheese', 'fruit', 'vegetable'],
    'beverages': ['drink', 'water', 'soda', 'juice', 'coffee', 'tea', 'beer', 'wine'],
    'electronics': ['phone', 'laptop', 'computer', 'tablet', 'tv', 'headphones', 'speaker'],
    'clothing': ['shirt', 'pants', 'shoes', 'dress', 'jacket', 'hat', 'socks'],
    'personal care': ['shampoo', 'soap', 'toothpaste', 'deodorant', 'lotion', 'makeup'],
    'household': ['detergent', 'cleaner', 'toilet paper', 'towel', 'dish soap'],
    'automotive': ['car', 'oil', 'tire', 'battery', 'fuel']
  }

  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  return 'General'
}
