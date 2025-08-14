#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌱 EcoSnap AI Setup Script');
console.log('================================\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  console.log('Please upgrade Node.js: https://nodejs.org/');
  process.exit(1);
}

console.log('✅ Node.js version:', nodeVersion);

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Copy environment file
console.log('\n🔧 Setting up environment variables...');
const envExample = path.join(__dirname, '.env.local.example');
const envLocal = path.join(__dirname, '.env.local');

if (fs.existsSync(envExample)) {
  if (!fs.existsSync(envLocal)) {
    fs.copyFileSync(envExample, envLocal);
    console.log('✅ Created .env.local file');
    console.log('⚠️  Please edit .env.local and add your GEMINI_API_KEY');
  } else {
    console.log('ℹ️  .env.local already exists');
  }
} else {
  console.log('❌ .env.local.example not found');
}

// Check for API key
if (fs.existsSync(envLocal)) {
  const envContent = fs.readFileSync(envLocal, 'utf8');
  if (!envContent.includes('GEMINI_API_KEY=your_gemini_api_key_here') && 
      envContent.includes('GEMINI_API_KEY=')) {
    console.log('✅ Gemini API key appears to be configured');
  } else {
    console.log('\n⚠️  IMPORTANT: You need to add your Gemini API key to .env.local');
    console.log('   1. Visit: https://makersuite.google.com/app/apikey');
    console.log('   2. Create a new API key');
    console.log('   3. Replace "your_gemini_api_key_here" in .env.local with your key');
  }
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
  console.log('✅ Created public directory');
}

// Create favicon if it doesn't exist
const faviconPath = path.join(publicDir, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  // Create a simple text favicon placeholder
  fs.writeFileSync(faviconPath, '');
  console.log('ℹ️  Created placeholder favicon.ico');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Add your Gemini API key to .env.local (if not done already)');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');
console.log('4. Start scanning products! 🌱');

console.log('\n📖 For more information, see README.md');
console.log('🔗 Get API key: https://makersuite.google.com/app/apikey');

// Check if we can run the dev server
console.log('\n🚀 Testing development server...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build test successful - ready for development!');
  
  console.log('\n🎯 Quick start commands:');
  console.log('   npm run dev     # Start development server');
  console.log('   npm run build   # Build for production');
  console.log('   npm run start   # Start production server');
  
} catch (error) {
  console.log('⚠️  Build test failed - please check your API key configuration');
  console.log('   This is normal if you haven\'t added your Gemini API key yet');
}
