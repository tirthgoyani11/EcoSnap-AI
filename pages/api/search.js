import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, type = 'product' } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // Return demo data if no API key
      return res.status(200).json(getDemoSearchResults(query, type))
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    let prompt = ''
    
    if (type === 'alternatives') {
      prompt = `Find eco-friendly alternatives for: "${query}". 

Return a JSON array of 3-5 sustainable alternatives with this structure:
[
  {
    "name": "Product name",
    "brand": "Brand name",
    "category": "Product category",
    "ecoScore": 85,
    "price": 29.99,
    "co2Impact": 0.8,
    "rating": 4.5,
    "availability": "Online/In Stores",
    "whyBetter": "Detailed explanation of environmental benefits",
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "certifications": ["Certification 1", "Certification 2"],
    "improvements": {
      "co2Reduction": 40,
      "betterScore": 25,
      "savings": "Annual cost savings if applicable"
    },
    "where_to_buy": ["Store 1", "Website 1", "Store 2"]
  }
]

Focus on realistic, purchasable alternatives that are genuinely more sustainable.`

    } else if (type === 'tips') {
      prompt = `Provide 5-7 practical sustainability tips related to: "${query}".

Return JSON in this format:
{
  "category": "${query}",
  "tips": [
    {
      "title": "Tip title",
      "description": "Detailed explanation",
      "impact": "Environmental impact (High/Medium/Low)",
      "difficulty": "Implementation difficulty (Easy/Medium/Hard)",
      "savings": "Potential cost savings",
      "co2Reduction": "Estimated CO2 reduction"
    }
  ]
}

Make tips actionable, specific, and include quantified benefits when possible.`

    } else {
      // Default product search
      prompt = `Research the product: "${query}" and provide comprehensive sustainability information.

Return JSON in this format:
{
  "productName": "Full product name",
  "brand": "Brand name",
  "category": "Product category",
  "ecoScore": 75,
  "packagingScore": 80,
  "carbonScore": 70,
  "ingredientScore": 85,
  "certificationScore": 60,
  "recyclable": true,
  "co2Impact": 2.1,
  "healthScore": 80,
  "certifications": ["List of certifications"],
  "pros": ["Environmental pros"],
  "cons": ["Environmental concerns"],
  "ecoDescription": "Detailed sustainability analysis",
  "priceRange": "$ - $$$$",
  "bestAlternatives": [
    {
      "name": "Alternative name",
      "reason": "Why it's better",
      "ecoScore": 90
    }
  ],
  "sustainability_facts": [
    "Interesting sustainability facts about this product category"
  ]
}

Focus on accurate, well-researched information about environmental impact.`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim()
    
    try {
      const data = JSON.parse(text)
      return res.status(200).json(data)
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw text:', text)
      // Return demo data if parsing fails
      return res.status(200).json(getDemoSearchResults(query, type))
    }

  } catch (error) {
    console.error('Search API error:', error)
    
    // Return demo data as fallback
    return res.status(200).json(getDemoSearchResults(req.body.query, req.body.type))
  }
}

function getDemoSearchResults(query, type = 'product') {
  if (type === 'alternatives') {
    return [
      {
        name: `Eco-Friendly Alternative to ${query}`,
        brand: 'GreenChoice',
        category: 'Sustainable Products',
        ecoScore: Math.floor(Math.random() * 20) + 80,
        price: Math.round((Math.random() * 50 + 20) * 100) / 100,
        co2Impact: Math.round((Math.random() * 2 + 0.5) * 10) / 10,
        rating: Math.round((Math.random() * 1 + 4) * 10) / 10,
        availability: 'Online & Select Stores',
        whyBetter: `This alternative uses sustainable materials and has a significantly lower environmental impact than conventional ${query.toLowerCase()}.`,
        benefits: ['Lower Carbon Footprint', 'Sustainable Materials', 'Recyclable Packaging'],
        certifications: ['EcoMark', 'Carbon Neutral'],
        improvements: {
          co2Reduction: Math.floor(Math.random() * 40) + 30,
          betterScore: Math.floor(Math.random() * 25) + 15,
          savings: '$50-100 annually'
        },
        where_to_buy: ['Amazon', 'Target', 'Local Co-op']
      },
      {
        name: `Premium Sustainable ${query}`,
        brand: 'EarthFirst',
        category: 'Premium Eco Products',
        ecoScore: Math.floor(Math.random() * 15) + 85,
        price: Math.round((Math.random() * 80 + 40) * 100) / 100,
        co2Impact: Math.round((Math.random() * 1.5 + 0.3) * 10) / 10,
        rating: Math.round((Math.random() * 0.8 + 4.2) * 10) / 10,
        availability: 'Specialty Stores & Online',
        whyBetter: `Premium option with organic materials and carbon-negative production process.`,
        benefits: ['Organic Materials', 'Carbon Negative', 'Fair Trade'],
        certifications: ['USDA Organic', 'Fair Trade', 'B-Corp'],
        improvements: {
          co2Reduction: Math.floor(Math.random() * 50) + 40,
          betterScore: Math.floor(Math.random() * 30) + 20,
          savings: 'Offset by durability'
        },
        where_to_buy: ['Whole Foods', 'REI', 'Brand Website']
      }
    ]
  }

  if (type === 'tips') {
    return {
      category: query,
      tips: [
        {
          title: `Reduce ${query} Usage`,
          description: `Look for ways to minimize your use of ${query} in daily life through conscious consumption choices.`,
          impact: 'Medium',
          difficulty: 'Easy',
          savings: '$20-50 annually',
          co2Reduction: '5-15% reduction'
        },
        {
          title: `Choose Sustainable ${query} Options`,
          description: `When you do need ${query}, opt for eco-friendly versions made from sustainable materials.`,
          impact: 'High',
          difficulty: 'Easy',
          savings: 'Long-term value',
          co2Reduction: '20-40% improvement'
        },
        {
          title: `Proper Disposal and Recycling`,
          description: `Learn the correct way to dispose of or recycle ${query} to minimize environmental impact.`,
          impact: 'Medium',
          difficulty: 'Easy',
          savings: 'Varies',
          co2Reduction: '10-20% improvement'
        }
      ]
    }
  }

  // Default product search result
  return {
    productName: `${query} (Demo Analysis)`,
    brand: 'Various Brands',
    category: 'General Product',
    ecoScore: Math.floor(Math.random() * 60) + 30,
    packagingScore: Math.floor(Math.random() * 50) + 40,
    carbonScore: Math.floor(Math.random() * 60) + 25,
    ingredientScore: Math.floor(Math.random() * 40) + 50,
    certificationScore: Math.floor(Math.random() * 30) + 20,
    recyclable: Math.random() > 0.3,
    co2Impact: Math.round((Math.random() * 4 + 0.5) * 10) / 10,
    healthScore: Math.floor(Math.random() * 40) + 50,
    certifications: ['Demo Certification'],
    pros: [`Positive environmental aspects of ${query}`],
    cons: [`Areas for improvement in ${query} sustainability`],
    ecoDescription: `Demo analysis for "${query}". This product category has various environmental considerations. Add your GEMINI_API_KEY to .env.local for real AI-powered research.`,
    priceRange: '$$',
    bestAlternatives: [
      {
        name: `Sustainable ${query} Alternative`,
        reason: 'More eco-friendly materials and production',
        ecoScore: Math.floor(Math.random() * 20) + 80
      }
    ],
    sustainability_facts: [
      `Interesting fact about ${query} and environmental impact`,
      `Another sustainability consideration for this product category`
    ]
  }
}
