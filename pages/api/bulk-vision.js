import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = await req.formData()
    const files = form.getAll('files')

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' })
    }

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
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

Focus on sustainability, environmental impact, packaging, carbon footprint, and suggest better eco-friendly alternatives if applicable.`

    const results = []

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = buffer.toString('base64')

        const imageParts = [
          {
            inlineData: {
              data: base64Image,
              mimeType: file.type || "image/jpeg"
            }
          }
        ]

        const result = await model.generateContent([prompt, ...imageParts])
        const response = await result.response
        let text = response.text()

        // Clean up the response to extract JSON
        text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim()
        const analysis = JSON.parse(text)

        results.push({
          filename: file.name,
          analysis
        })
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        results.push({
          filename: file.name,
          error: 'Failed to process this image'
        })
      }
    }

    return res.status(200).json({ results })

  } catch (error) {
    console.error('Bulk analysis error:', error)
    return res.status(500).json({ error: 'Error processing images' })
  }
}
