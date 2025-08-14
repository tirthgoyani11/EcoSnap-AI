import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const ecoAssistantPrompt = `
You are EcoBot, a friendly and knowledgeable eco-friendly AI assistant. Your mission is to help users make more sustainable choices and live an environmentally conscious lifestyle.

Guidelines for responses:
- Be conversational, friendly, and encouraging
- Focus on practical, actionable advice
- Use emojis to make responses more engaging (but not too many)
- Provide specific examples when possible
- If you don't know something specific, acknowledge it and suggest reliable resources
- Always be positive about small steps toward sustainability
- Include relevant eco-certifications, brands, or alternatives when appropriate
- Keep responses informative but not overwhelmingly long
- Use bullet points or short paragraphs for readability

Topics you can help with:
- Sustainable product alternatives
- Eco-friendly certifications and labels
- Carbon footprint reduction
- Waste reduction and recycling
- Energy efficiency
- Sustainable food choices
- Green transportation
- Eco-friendly home and lifestyle tips
- Environmental impact of products
- Sustainable brands and companies

Remember: Every small sustainable choice makes a difference! 🌱
`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'No message provided' })
    }

    // Try Gemini API first
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
        
        const chat = model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: ecoAssistantPrompt }]
            },
            {
              role: 'model',
              parts: [{ text: 'Hello! I\'m EcoBot, your friendly eco-assistant. I\'m here to help you make sustainable choices and live a greener lifestyle. What would you like to know about eco-friendly living?' }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        })

        const result = await chat.sendMessage(message)
        const response = result.response
        const botResponse = response.text()

        return res.status(200).json({
          success: true,
          response: botResponse
        })

      } catch (geminiError) {
        console.error('Gemini Chat Error:', geminiError)
        // Fall through to fallback responses
      }
    }

    // Fallback responses for common questions
    const fallbackResponse = getFallbackResponse(message)
    
    res.status(200).json({
      success: true,
      response: fallbackResponse
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process message' 
    })
  }
}

function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase()
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `👋 Hello there! I'm EcoBot, your eco-friendly assistant. I'm here to help you make sustainable choices and reduce your environmental impact. What would you like to learn about today?

Some popular topics I can help with:
• Sustainable product alternatives
• Reducing carbon footprint  
• Eco-friendly certifications
• Waste reduction tips
• Energy efficiency

What interests you most? 🌱`
  }

  // Plastic alternatives
  if (lowerMessage.includes('plastic') && (lowerMessage.includes('alternative') || lowerMessage.includes('replace'))) {
    return `🌊 Great question! Here are some fantastic plastic alternatives:

**Single-use items:**
• Water bottles → Stainless steel, glass, or bamboo bottles
• Shopping bags → Canvas, jute, or mesh reusable bags
• Food containers → Glass, stainless steel, or silicone
• Straws → Metal, bamboo, paper, or silicone straws

**Packaging alternatives to look for:**
• Cardboard and paper packaging
• Compostable bioplastics (PLA)
• Glass containers
• Metal tins and cans

**Pro tip:** The best alternative is often reusing what you already have! Start with one swap at a time. 🌱`
  }

  // Carbon footprint
  if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint') || lowerMessage.includes('emission')) {
    return `🌍 Here are proven ways to reduce your carbon footprint:

**Transportation (biggest impact):**
• Walk, bike, or use public transport when possible
• Work from home to reduce commuting
• Combine errands into one trip
• Choose fuel-efficient vehicles

**Energy at home:**
• Switch to LED bulbs (75% less energy)
• Unplug electronics when not in use
• Use a programmable thermostat
• Consider renewable energy if available

**Food choices:**
• Eat more plant-based meals
• Buy local and seasonal produce
• Reduce food waste
• Choose organic when possible

**Shopping:**
• Buy only what you need
• Choose quality over quantity
• Support brands with sustainability commitments

Every small change adds up! Start with what feels manageable. 💚`
  }

  // Eco-friendly products
  if (lowerMessage.includes('eco-friendly') || lowerMessage.includes('sustainable') || lowerMessage.includes('green product')) {
    return `♻️ Here's what makes a product truly eco-friendly:

**Key characteristics:**
• Made from renewable or recycled materials
• Minimal, recyclable packaging
• Energy-efficient production
• Durability (lasts longer)
• Non-toxic ingredients
• Responsible end-of-life disposal

**Certifications to look for:**
• Energy Star ⭐ (appliances)
• USDA Organic 🌱 (food & personal care)
• Fair Trade 🤝 (ethical sourcing)
• Forest Stewardship Council 🌳 (paper products)
• Cradle to Cradle ♻️ (circular design)

**Beware of "greenwashing":**
Watch out for vague terms like "natural" or "eco" without certifications.

Remember: The most sustainable product is often the one you don't need to buy! Repair, reuse, and repurpose when possible. 🌿`
  }

  // Recycling
  if (lowerMessage.includes('recycle') || lowerMessage.includes('recycling')) {
    return `♻️ Smart recycling makes a huge difference! Here's how to do it right:

**Know your numbers:**
• #1 & #2 plastics: Usually recyclable
• #3-7 plastics: Check with your local facility
• Clean containers before recycling

**What CAN be recycled (most areas):**
• Paper and cardboard
• Glass bottles and jars
• Aluminum cans
• Steel/tin cans
• Most plastic bottles

**What CANNOT be recycled:**
• Plastic bags (take to store drop-offs)
• Pizza boxes with grease
• Broken glass
• Electronics (special e-waste programs)

**Pro tips:**
• When in doubt, check Earth911.com
• Reduce and reuse before recycling
• Buy products with recycled content

The circular economy starts with you! 🔄`
  }

  // Energy efficiency
  if (lowerMessage.includes('energy') || lowerMessage.includes('electric') || lowerMessage.includes('power')) {
    return `⚡ Energy efficiency saves money and the planet! Here are top tips:

**Lighting:**
• Switch to LED bulbs (use 75% less energy)
• Use natural light when possible
• Install dimmer switches

**Heating & Cooling:**
• Set thermostat 68°F (winter) / 78°F (summer)
• Seal air leaks around windows/doors
• Use fans to circulate air
• Change HVAC filters regularly

**Electronics:**
• Unplug devices when not in use ("phantom load")
• Use power strips to cut standby power
• Choose Energy Star appliances
• Enable power-saving modes

**Water heating:**
• Lower water heater to 120°F
• Take shorter showers
• Fix leaky faucets promptly

**Smart upgrades:**
• Programmable or smart thermostats
• Smart power strips
• Energy-efficient appliances

Your energy choices create a ripple effect! 💡`
  }

  // Food and diet
  if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('diet')) {
    return `🥬 Sustainable eating is delicious and impactful! Here's how:

**Choose more plants:**
• Reduce meat consumption (try "Meatless Monday")
• Explore plant-based proteins (beans, lentils, quinoa)
• Eat seasonal, local produce when possible

**Smart shopping:**
• Buy organic (especially for "Dirty Dozen" produce)
• Shop at farmers markets
• Choose minimal packaging
• Bring reusable bags

**Reduce food waste:**
• Plan meals and make shopping lists
• Store food properly
• Use leftovers creatively
• Compost food scraps

**Sustainable protein sources:**
• Wild-caught fish over farmed
• Grass-fed, locally-sourced meat
• Plant proteins (lowest carbon footprint)

**Fun fact:** Food production accounts for about 25% of global emissions. Your choices matter! 🌱`
  }

  // Water conservation
  if (lowerMessage.includes('water') && !lowerMessage.includes('bottle')) {
    return `💧 Water conservation is crucial! Here are effective strategies:

**In the bathroom:**
• Take shorter showers (save 2.5 gallons per minute)
• Fix leaky faucets and toilets
• Install low-flow showerheads
• Turn off water while brushing teeth

**In the kitchen:**
• Run dishwasher only when full
• Fix dripping faucets
• Don't run water to thaw food
• Collect cold water while waiting for hot

**Outdoors:**
• Water plants early morning or evening
• Use drip irrigation or soaker hoses
• Choose native, drought-resistant plants
• Collect rainwater for gardens

**Smart upgrades:**
• Low-flow toilets and faucets
• High-efficiency washing machines
• Smart irrigation systems

**Did you know?** The average American uses 80-100 gallons per day. Every drop saved helps! 🌊`
  }

  // Transportation
  if (lowerMessage.includes('transport') || lowerMessage.includes('car') || lowerMessage.includes('commute')) {
    return `🚲 Transportation is often the biggest source of personal emissions. Here are greener options:

**Active transportation:**
• Walk or bike for short trips
• Use public transit when available
• Try e-bikes for longer distances

**Driving efficiently:**
• Combine errands into one trip
• Remove excess weight from your car
• Keep tires properly inflated
• Drive the speed limit (saves 10-40% fuel)

**Vehicle choices:**
• Consider hybrid or electric vehicles
• Right-size your vehicle (smaller = more efficient)
• Maintain your car regularly

**Alternative options:**
• Work from home when possible
• Use ride-sharing for occasional trips
• Car-share programs in cities
• Video calls instead of business travel

**Fun fact:** Transportation accounts for about 29% of US greenhouse gas emissions. Your mobility choices make a difference! 🌍`
  }

  // Cleaning products
  if (lowerMessage.includes('clean') || lowerMessage.includes('soap') || lowerMessage.includes('detergent')) {
    return `🧽 Clean your home without harming the planet! Here are eco-friendly cleaning tips:

**Green cleaning products to look for:**
• EPA Safer Choice certified
• Plant-based ingredients
• Biodegradable formulas
• Minimal packaging
• Concentrated formulas

**DIY cleaning solutions:**
• All-purpose: White vinegar + water
• Glass cleaner: Vinegar + water + newspaper
• Scrub: Baking soda paste
• Disinfectant: 70% isopropyl alcohol

**Sustainable brands:**
• Seventh Generation
• Method
• Mrs. Meyer's
• Branch Basics
• Blueland (refillable tablets)

**Cleaning tips:**
• Use microfiber cloths (reusable)
• Open windows for natural air freshening
• Choose refillable containers when possible

**Avoid:** Products with phosphates, chlorine bleach, or artificial fragrances.

Clean homes and a clean planet! 🌿`
  }

  // General sustainability
  if (lowerMessage.includes('sustainable') || lowerMessage.includes('green living') || lowerMessage.includes('environment')) {
    return `🌱 Living sustainably is a journey, not a destination! Here are foundational principles:

**The 5 R's hierarchy:**
1. **Refuse** what you don't need
2. **Reduce** consumption
3. **Reuse** items creatively
4. **Recycle** properly
5. **Rot** (compost) organic waste

**Start small:**
• Switch one product at a time
• Focus on high-impact changes first
• Build sustainable habits gradually

**Key areas to focus:**
• Energy use (biggest impact)
• Transportation choices
• Food consumption
• Waste reduction
• Water conservation

**Remember:**
• Progress over perfection
• Small changes multiply over time
• Every sustainable choice matters
• Share knowledge with others

**Sustainable living benefits:**
• Lower environmental impact
• Often saves money long-term
• Healthier for you and your family
• Sets a positive example

You're already on the right path by asking questions! Keep learning and growing. 🌍`
  }

  // Default response for unrecognized questions
  return `🤖 That's an interesting question! While I might not have a specific answer about "${message}", I'm here to help with all things eco-friendly.

**I can help you with:**
• Sustainable product alternatives
• Carbon footprint reduction
• Eco-friendly certifications
• Energy and water conservation
• Waste reduction tips
• Green transportation options
• Sustainable food choices

**For specific environmental questions, I recommend:**
• EPA.gov (official environmental info)
• Earth911.com (recycling guidance)
• GoodGuide.com (product ratings)
• Environmental Working Group (EWG.org)

Try rephrasing your question or ask about any of the topics above! I'm here to help you live more sustainably. 🌱

What aspect of eco-friendly living interests you most?`
}
