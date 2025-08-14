import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const getValidImage = async (file) => {
  // Check if it's actually an image
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload an image.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Basic validation - check if it's a valid image by looking at magic numbers
  const header = buffer.slice(0, 4).toString('hex');
  const validHeaders = {
    'ffd8ffe0': 'image/jpeg', // JPEG
    '89504e47': 'image/png',  // PNG
    '47494638': 'image/gif',  // GIF
    '52494646': 'image/webp', // WEBP
  };

  if (!Object.keys(validHeaders).includes(header)) {
    throw new Error('Invalid image format');
  }

  return {
    data: buffer.toString('base64'),
    mimeType: file.type
  };
};

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const files = form.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });

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

Focus on sustainability, environmental impact, packaging, carbon footprint, and suggest better eco-friendly alternatives if applicable.
Ensure all numeric values are reasonable and within their expected ranges.`;

    const results = [];

    // Process files sequentially to avoid rate limiting
    for (const file of files) {
      try {
        // Validate and process the image
        const image = await getValidImage(file);
        
        const imageParts = [
          {
            inlineData: {
              data: image.data,
              mimeType: image.mimeType
            }
          }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        let text = response.text();

        // Clean up the response to extract JSON
        text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
        const analysis = JSON.parse(text);

        // Validate critical fields
        if (!analysis.productName || !analysis.ecoScore || !analysis.co2Impact) {
          throw new Error('Invalid analysis result');
        }

        results.push({
          filename: file.name,
          analysis
        });

        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          filename: file.name,
          error: error.message || 'Failed to process this image'
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Bulk analysis error:', error);
    return NextResponse.json({ 
      error: 'Error processing images',
      details: error.message 
    }, { status: 500 });
  }
}
