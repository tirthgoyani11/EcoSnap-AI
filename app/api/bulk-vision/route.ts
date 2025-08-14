import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface UploadedFile extends File {
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  name: string;
}

interface ValidationResult {
  data: string;
  mimeType: string;
}

interface ScanResult {
  filename: string;
  analysis?: {
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
  };
  error?: string;
}

const getValidImage = async (file: UploadedFile): Promise<ValidationResult> => {
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
    const formFiles = form.getAll('files');
    const files = formFiles.filter((file): file is UploadedFile => file instanceof File);

    if (files.length === 0) {
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
You are an AI trained to analyze product images and assess their environmental impact. For each image:

1. Identify the product name and brand
2. Determine product category
3. Analyze and score (0-100) these aspects:
   - Overall eco-friendliness
   - Packaging sustainability
   - Carbon footprint impact
   - Ingredient/material sustainability
   - Eco certifications present
4. Determine if packaging is recyclable
5. Estimate CO2 impact in kg
6. Calculate health impact score
7. List any eco-certifications
8. Provide a brief eco-analysis 

Please be as accurate as possible. Prioritize facts and details visible in the image.

Return only JSON format with this exact structure (numbers should be 0-100 except CO2):
{
  "productName": "",
  "brand": "",
  "category": "",
  "ecoScore": 0,
  "packagingScore": 0,
  "carbonScore": 0,
  "ingredientScore": 0, 
  "certificationScore": 0,
  "recyclable": true/false,
  "co2Impact": 0.0,
  "healthScore": 0,
  "certifications": [],
  "ecoDescription": ""
}`;

    const results: ScanResult[] = [];
    const errors: ScanResult[] = [];

    // Process each image
    for (const file of files) {
      try {
        const image = await getValidImage(file);
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: image.data,
              mimeType: image.mimeType
            }
          }
        ]);

        const response = await result.response;
        const text = response.text();
        
        try {
          const analysis = JSON.parse(text);
          results.push({
            filename: file.name,
            analysis
          });
        } catch (parseError) {
          throw new Error('Failed to parse analysis result');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
        errors.push({
          filename: file.name,
          error: errorMessage
        });
      }
    }

    return NextResponse.json({
      results,
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: errorMessage
    }, { status: 500 });
  }
}
