import { useState } from 'react'
import Head from 'next/head'
import { MessageCircle, Send, Bot, User, Lightbulb, Recycle, Leaf, Globe } from 'lucide-react'

const sampleQuestions = [
  "How can I reduce my carbon footprint at home?",
  "What are the best eco-friendly alternatives to plastic bags?",
  "Is it better to buy local or organic food?",
  "How do I properly recycle electronics?",
  "What's the environmental impact of fast fashion?",
  "How can I make my home more energy efficient?"
]

const sampleResponses = [
  {
    question: "carbon footprint",
    response: "Great question! Here are some effective ways to reduce your carbon footprint at home:\n\n🏠 **Energy Use:**\n• Switch to LED bulbs (use 75% less energy)\n• Unplug devices when not in use\n• Use a programmable thermostat\n• Consider renewable energy sources\n\n🚗 **Transportation:**\n• Walk, bike, or use public transport\n• Combine errands into one trip\n• Work from home when possible\n• Consider electric or hybrid vehicles\n\n♻️ **Consumption:**\n• Buy less, choose quality items\n• Repair instead of replacing\n• Choose local and seasonal products\n• Reduce meat consumption\n\nEven small changes can make a big difference! Which area would you like to focus on first?"
  },
  {
    question: "plastic bags",
    response: "Excellent question! Here are the best eco-friendly alternatives to plastic bags:\n\n🛍️ **Reusable Options:**\n• **Cotton canvas bags** - Durable and washable\n• **Jute bags** - Biodegradable and strong\n• **Recycled PET bags** - Made from recycled plastic bottles\n• **Mesh produce bags** - Perfect for fruits and vegetables\n\n📦 **Other Alternatives:**\n• **Paper bags** - Biodegradable but less durable\n• **Cardboard boxes** - Great for bulk items\n• **Basket or cart** - For regular shopping trips\n\n💡 **Pro Tips:**\n• Keep reusable bags in your car or by your door\n• Choose bags with longer handles for comfort\n• Look for foldable options that fit in your purse\n• One reusable bag can replace 1000+ plastic bags!\n\nThe key is remembering to bring them - maybe set a phone reminder until it becomes habit!"
  },
  {
    question: "local or organic",
    response: "This is a nuanced question! Both local and organic have environmental benefits:\n\n🌱 **Organic Benefits:**\n• No synthetic pesticides or fertilizers\n• Better for soil health and biodiversity\n• Often better for farmworker safety\n• Supports sustainable farming practices\n\n🚚 **Local Benefits:**\n• Reduced transportation emissions\n• Supports local economy\n• Fresher produce (picked closer to peak ripeness)\n• Often seasonal and varied\n\n🏆 **The Winner?**\n**Local organic is ideal**, but if you must choose:\n• **Local conventional** often beats **distant organic** for carbon footprint\n• **Organic** is better for avoiding pesticides and supporting biodiversity\n• **Seasonal local** reduces need for energy-intensive greenhouses\n\n💡 **Best Strategy:**\n1. Prioritize local and seasonal\n2. Buy organic for the \"Dirty Dozen\" (highest pesticide foods)\n3. Support local farmers markets when possible\n4. Grow your own herbs and simple vegetables\n\nWhat type of food are you most interested in sourcing sustainably?"
  }
]

export default function AskAnything() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your eco-assistant. Ask me anything about sustainability, environmental impact, eco-friendly alternatives, or green living tips. I'm here to help you make more environmentally conscious choices! 🌱",
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const generateResponse = (question) => {
    const lowerQuestion = question.toLowerCase()
    
    // Find matching sample response
    const matchedResponse = sampleResponses.find(sample => 
      lowerQuestion.includes(sample.question)
    )
    
    if (matchedResponse) {
      return matchedResponse.response
    }
    
    // General eco responses based on keywords
    if (lowerQuestion.includes('recycle') || lowerQuestion.includes('recycling')) {
      return "♻️ **Recycling Tips:**\n\n• **Electronics**: Take to certified e-waste centers, never throw in regular trash\n• **Plastic**: Check numbers 1-2 are widely accepted, clean containers first\n• **Glass**: Most types accepted, remove lids and rings\n• **Paper**: Remove staples and plastic windows\n• **Batteries**: Special drop-off locations at most stores\n\n💡 **Pro tip**: When in doubt, check your local recycling center's website for specific guidelines. Contamination can spoil entire batches of recyclables!\n\nWhat specific items do you need help recycling?"
    }
    
    if (lowerQuestion.includes('energy') || lowerQuestion.includes('electric')) {
      return "⚡ **Energy Efficiency Tips:**\n\n🏠 **Home Improvements:**\n• Seal air leaks around windows and doors\n• Add insulation to attic and walls\n• Upgrade to ENERGY STAR appliances\n• Install smart thermostats\n\n💡 **Daily Habits:**\n• Use cold water for washing clothes\n• Air dry instead of using the dryer\n• Turn off lights and unplug devices\n• Use natural light during the day\n\n🌞 **Renewable Options:**\n• Solar panels (check for local incentives)\n• Community solar programs\n• Green energy from your utility company\n\nWhich area would you like to explore further?"
    }
    
    if (lowerQuestion.includes('water') || lowerQuestion.includes('conservation')) {
      return "💧 **Water Conservation Ideas:**\n\n🚿 **Bathroom (70% of home water use):**\n• Take shorter showers (save 2.5 gallons per minute)\n• Fix leaks promptly\n• Install low-flow showerheads and toilets\n• Turn off tap while brushing teeth\n\n🍽️ **Kitchen & Laundry:**\n• Only run full loads in dishwasher/washing machine\n• Use cold water when possible\n• Collect rinse water for plants\n• Install aerators on faucets\n\n🌱 **Outdoor:**\n• Water early morning or evening\n• Use drip irrigation or soaker hoses\n• Plant native, drought-resistant species\n• Collect rainwater in barrels\n\nWhat's your biggest water use area you'd like to improve?"
    }
    
    if (lowerQuestion.includes('food') || lowerQuestion.includes('diet') || lowerQuestion.includes('eating')) {
      return "🍎 **Sustainable Food Choices:**\n\n🌱 **Plant-Forward Diet:**\n• Reduce meat consumption (even one day/week helps!)\n• Try plant-based proteins: beans, lentils, tofu\n• Eat seasonal, local produce when possible\n• Minimize processed and packaged foods\n\n🗑️ **Reduce Food Waste:**\n• Plan meals and make shopping lists\n• Store food properly to extend freshness\n• Use leftovers creatively\n• Compost food scraps\n\n📦 **Packaging:**\n• Shop at farmers markets with reusable bags\n• Buy in bulk to reduce packaging\n• Choose glass or paper over plastic when possible\n• Support brands with sustainable packaging\n\nWhat aspect of sustainable eating interests you most?"
    }
    
    // Default responses for general questions
    const defaultResponses = [
      "That's a great eco-conscious question! While I don't have specific data on that topic, I'd recommend checking with local environmental organizations or sustainability websites for the most current information. In general, focusing on reducing consumption, reusing items, and recycling properly are excellent starting points for any environmental concern.",
      
      "I appreciate your interest in sustainable living! For specific guidance on that topic, I'd suggest consulting resources like the EPA's website, local environmental groups, or sustainability-focused apps. Remember that small, consistent actions often have more impact than perfect but unsustainable changes.",
      
      "Environmental consciousness is so important! While I don't have detailed information on that specific question, some universal eco-friendly principles include: buying less but better quality items, choosing local when possible, reducing energy and water usage, and supporting businesses with strong environmental commitments. What specific area would you like to focus on?"
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    const currentQuestion = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      // Call the real chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentQuestion,
          conversationHistory: messages.slice(-6) // Send last 6 messages for context
        })
      })

      if (!response.ok) {
        throw new Error('Chat API failed')
      }

      const data = await response.json()
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, botMessage])
      
      // Award points for asking questions
      if (typeof window !== 'undefined') {
        const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0')
        localStorage.setItem('ecoPoints', (currentPoints + 1).toString())
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      // Fallback to demo response
      const response = generateResponse(currentQuestion)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, botMessage])
      
      // Award points anyway
      if (typeof window !== 'undefined') {
        const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0')
        localStorage.setItem('ecoPoints', (currentPoints + 1).toString())
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickQuestion = (question) => {
    setInputMessage(question)
  }

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Head>
        <title>Ask Anything - EcoSnap AI</title>
        <meta name="description" content="Ask questions about sustainability and eco-friendly living" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <MessageCircle className="inline mr-3" size={40} />
            Ask Anything
          </h1>
          <p className="text-xl text-gray-600">Your AI sustainability assistant</p>
        </div>

        {/* Quick Questions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">💡 Popular Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <span className="text-gray-600">{question}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="eco-card mb-4" style={{ height: '500px', overflow: 'hidden' }}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-100 text-gray-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="text-sm">
                        {formatMessage(message.content)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="rounded-lg p-4 bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t pt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about sustainability, recycling, energy saving..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="eco-button disabled:opacity-50 px-4 py-2"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="eco-card p-6 text-center">
            <Leaf className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Sustainability Tips</h3>
            <p className="text-sm text-gray-600">
              Get personalized advice on reducing your environmental impact
            </p>
          </div>
          
          <div className="eco-card p-6 text-center">
            <Recycle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Recycling Guidance</h3>
            <p className="text-sm text-gray-600">
              Learn how to properly dispose of and recycle different materials
            </p>
          </div>
          
          <div className="eco-card p-6 text-center">
            <Globe className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Environmental Impact</h3>
            <p className="text-sm text-gray-600">
              Understand the environmental effects of everyday choices
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
