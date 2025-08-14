import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, conversationHistory } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // Return demo response if no API key
      return res.status(200).json({
        response: getDemoResponse(message)
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const systemPrompt = `You are an expert sustainability and environmental consultant. Your role is to help users make more environmentally conscious choices in their daily lives. 

Guidelines:
- Provide practical, actionable advice
- Focus on sustainability, recycling, energy efficiency, eco-friendly products, and environmental impact
- Be encouraging and positive while being realistic about challenges
- Suggest specific alternatives and solutions when possible
- Include specific numbers, percentages, or facts when relevant
- Keep responses informative but conversational
- Use emojis sparingly to make responses more engaging
- If asked about non-environmental topics, gently redirect to sustainability aspects

Current user question: "${message}"

Provide a helpful, detailed response about sustainability, environmental impact, or eco-friendly living.`

    let contextMessages = []
    if (conversationHistory && Array.isArray(conversationHistory)) {
      contextMessages = conversationHistory.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    }

    const chat = model.startChat({
      history: contextMessages,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    })

    const result = await chat.sendMessage(systemPrompt)
    const response = await result.response
    const text = response.text()

    return res.status(200).json({ response: text })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Return demo response as fallback
    return res.status(200).json({
      response: getDemoResponse(req.body.message)
    })
  }
}

function getDemoResponse(message) {
  const lowerMessage = message.toLowerCase()
  
  // Contextual responses based on keywords
  if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint')) {
    return `Great question about reducing your carbon footprint! 🌍

Here are some effective ways to make a real impact:

**Energy at Home:**
• Switch to LED bulbs (75% less energy)
• Unplug devices when not in use
• Use a programmable thermostat
• Consider renewable energy options

**Transportation:**
• Walk, bike, or use public transport
• Combine errands into one trip
• Work from home when possible

**Consumption:**
• Buy less, choose quality items that last
• Repair instead of replacing
• Choose local and seasonal products

Even small changes add up! The average household can reduce their carbon footprint by 20-30% with basic changes. Which area would you like to focus on first?`
  }

  if (lowerMessage.includes('plastic') || lowerMessage.includes('bag')) {
    return `Excellent question about plastic alternatives! ♻️

**Best Reusable Options:**
• Cotton canvas bags (durable & washable)
• Jute bags (biodegradable & strong)  
• Recycled PET bags (made from plastic bottles)
• Mesh bags (perfect for produce)

**Pro Tips:**
• Keep bags in your car or by your door
• One reusable bag replaces 1,000+ plastic bags over its lifetime
• Choose bags with comfortable handles
• Look for foldable options for convenience

**Impact:** Americans use 380 billion plastic bags yearly, but only 1% get recycled properly. Making the switch to reusables is one of the easiest ways to reduce waste!

Need specific recommendations for where to find good reusable bags?`
  }

  if (lowerMessage.includes('recycle') || lowerMessage.includes('recycling')) {
    return `Great recycling question! ♻️ Here's how to recycle effectively:

**Common Materials:**
• **Plastic:** Check numbers 1-2 (most accepted), clean first
• **Glass:** Most types accepted, remove lids
• **Paper:** Remove staples, no greasy pizza boxes
• **Electronics:** Special e-waste centers only
• **Batteries:** Store drop-off locations

**Pro Tips:**
• When in doubt, check your local recycling center's website
• Contamination ruins entire batches
• "Wishcycling" (hoping it's recyclable) actually hurts the system

**Better Than Recycling:**
Reduce and reuse first! Recycling uses energy too.

What specific items do you need help recycling?`
  }

  if (lowerMessage.includes('energy') || lowerMessage.includes('electric')) {
    return `Energy efficiency is a great place to start! ⚡

**Quick Wins:**
• Seal air leaks around windows/doors
• Use cold water for washing (90% of energy goes to heating)
• Air dry clothes instead of using the dryer
• Unplug devices when not in use

**Bigger Improvements:**
• LED bulbs (last 25x longer than incandescent)
• Smart/programmable thermostat (10% savings)
• Energy Star appliances when replacing old ones
• Better insulation (biggest impact for most homes)

**Solar Options:**
• Rooftop solar (check local incentives)
• Community solar programs
• Green energy plans from utilities

The average home can cut energy use by 25% with basic improvements. What's your biggest energy concern?`
  }

  if (lowerMessage.includes('water')) {
    return `Water conservation is crucial! 💧 Here are effective strategies:

**High-Impact Changes:**
• Fix leaks immediately (1 drip/second = 5 gallons/day)
• Shorter showers (save 2.5 gallons per minute)
• Only run full loads in dishwasher/washer
• Install low-flow fixtures

**Outdoor Water (50% of home use):**
• Water early morning or evening
• Plant native, drought-resistant species
• Use drip irrigation or soaker hoses
• Collect rainwater for gardens

**Kitchen & Bathroom:**
• Turn off tap while brushing teeth
• Use cold water when possible
• Install aerators on faucets

The average American uses 100 gallons daily, but we can easily cut that by 30% with simple changes. What area uses the most water in your home?`
  }

  // Default responses for general questions
  const defaultResponses = [
    `That's a thoughtful environmental question! 🌱 

While I don't have specific data on that exact topic, here are some universal eco-principles that apply to most situations:

• **Reduce first** - The most sustainable option is often using less
• **Choose quality** - Buy fewer, better-made items that last longer  
• **Think local** - Local sourcing typically has lower environmental impact
• **Consider lifecycle** - Think about production, use, and disposal
• **Support sustainable businesses** - Your purchasing power drives change

For specific guidance on this topic, I'd recommend checking with local environmental organizations or EPA resources. Is there a particular aspect of sustainable living you'd like to explore further?`,

    `Great sustainability question! 🌍

Here are some general eco-friendly principles that might help:

• **Energy efficiency** - Look for ways to reduce energy consumption
• **Waste reduction** - Focus on reducing, reusing, then recycling
• **Sustainable materials** - Choose renewable or recycled materials when possible
• **Local sourcing** - Support local businesses to reduce transportation impact
• **Long-term thinking** - Consider the full environmental impact over time

Small, consistent changes often have more impact than perfect but unsustainable efforts. What specific environmental goal are you trying to achieve?`
  ]

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}
