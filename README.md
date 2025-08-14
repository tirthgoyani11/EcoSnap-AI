# EcoSnap AI 🌱

An AI-powered sustainability scanner that helps users make eco-friendly choices by analyzing products through image recognition and providing eco-scores, environmental impact data, and sustainable alternatives.

## 🚀 Features

- 📷 **Live Camera Scanning**: Point your camera at products for instant AI analysis
- 🖼️ **Image Upload**: Upload product photos for detailed eco-analysis  
- 🔍 **Text Search**: Search products by name with AI-powered insights
- 🤖 **AI Chat Assistant**: Ask sustainability questions and get expert advice
- 📦 **Bulk Scanning**: Analyze multiple products with batch processing
- 📊 **Comprehensive Scoring**: Multi-factor eco-scoring system
- 🌿 **Smart Alternatives**: AI suggestions for better eco-friendly options
- 🏆 **Gamification**: Earn points and track your sustainability journey
- 📱 **Responsive Design**: Perfect on desktop, tablet, and mobile
- 🎯 **AR Mode**: Augmented reality overlay for real-time product info

## 🛠 Tech Stack

- **Frontend**: Next.js 13.5, React 18, Tailwind CSS
- **AI**: Google Gemini 1.5 Flash (Vision + Chat)
- **Icons**: Lucide React
- **Animations**: Framer Motion, Canvas Confetti
- **Deployment**: Vercel-ready with optimal configuration

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd EcoSnap-AI
npm install
```

### 2. Setup Environment (IMPORTANT for Real AI)
```bash
# Copy environment template
cp .env.local.example .env.local

# Get your FREE Gemini API key at: https://aistudio.google.com/app/apikey
# Edit .env.local and replace 'your_gemini_api_key_here' with your key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Configuration

### Without API Key (Demo Mode):
- ✅ All features work with realistic demo data
- ✅ Perfect for testing and development
- ⚠️ No real AI analysis

### With Gemini API Key (Real AI Mode):
- 🚀 **Real image analysis** of product photos
- 🤖 **Intelligent product recognition** from camera/uploads
- 💬 **Smart AI chat assistant** for sustainability questions  
- 🔍 **Advanced search** with AI-powered research
- 📈 **Accurate eco-scoring** based on real product data
- 🌱 **Personalized alternatives** tailored to your queries

**Get your FREE API key**: https://aistudio.google.com/app/apikey

## 📱 Pages & Features

| Page | URL | Features |
|------|-----|----------|
| **Home Scanner** | `/` | Camera, upload, text search with real-time AI analysis |
| **Dashboard** | `/dashboard` | Personal stats, scan history, achievements |
| **Leaderboard** | `/leaderboard` | Community rankings, top eco-warriors |
| **Bulk Scan** | `/bulk-scan` | Multi-product analysis, CSV export, batch processing |
| **Ask Anything** | `/ask-anything` | AI sustainability assistant, expert advice |

## 🔧 API Endpoints

- `POST /api/vision` - Analyze product images or text queries
- `POST /api/chat` - AI sustainability assistant
- `POST /api/search` - Advanced product research

## 🌟 Demo vs Real Mode

### Demo Mode (No API Key)
- Realistic sample data
- All UI features working
- Great for presentations
- No API costs

### Real Mode (With API Key)
- Actual AI analysis
- Real product recognition
- Accurate sustainability data
- Personalized recommendations

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add your GEMINI_API_KEY in Vercel dashboard
```

### Other Platforms
- Works on Netlify, Railway, or any Node.js host
- Just add environment variables in your platform's settings

## 🎯 Perfect For

- 🏆 **Hackathons**: Impressive demo with real AI
- 🌱 **Sustainability Projects**: Educational and practical
- 📱 **Portfolio Projects**: Showcases modern web tech
- 🔬 **Research**: Environmental impact analysis
- 📊 **Prototyping**: Rapid sustainability app development

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🌍 Made with 💚 for a sustainable future**

*"The best time to scan sustainably was 20 years ago. The second best time is now."* 🌱
