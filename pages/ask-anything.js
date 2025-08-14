import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Send, MessageCircle, Lightbulb, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AskAnything() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '👋 Hi! I\'m your eco-friendly AI assistant. Ask me anything about sustainable living, product alternatives, or environmental impact!',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Sample questions for quick start
  const sampleQuestions = [
    "What makes a product eco-friendly?",
    "How can I reduce my carbon footprint?",
    "What are the best sustainable alternatives to plastic?",
    "How do I read eco certifications on products?",
    "What's the difference between recyclable and biodegradable?",
    "How can I make my daily routine more sustainable?"
  ]

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText.trim() })
      })

      const data = await response.json()

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, botMessage])
        
        // Award points for asking questions
        const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0')
        localStorage.setItem('ecoPoints', (currentPoints + 2).toString())
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      // Fallback with predefined responses
      const fallbackResponse = getFallbackResponse(messageText)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getFallbackResponse = (question) => {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('plastic') || lowerQuestion.includes('alternative')) {
      return `🌱 Great question about plastic alternatives! Here are some sustainable swaps:

• **Water bottles** → Stainless steel or glass bottles
• **Shopping bags** → Canvas, jute, or mesh bags  
• **Food containers** → Glass or bamboo containers
• **Straws** → Metal, bamboo, or paper straws
• **Packaging** → Look for cardboard, paper, or compostable materials

The key is choosing reusable, durable materials that can replace single-use plastics. Start with one swap at a time!`
    }
    
    if (lowerQuestion.includes('carbon') || lowerQuestion.includes('footprint')) {
      return `🌍 Here are effective ways to reduce your carbon footprint:

**Transportation:**
• Walk, bike, or use public transport
• Combine errands into one trip
• Work from home when possible

**Energy:**
• Switch to LED bulbs
• Unplug devices when not in use
• Use programmable thermostats

**Food:**
• Eat less meat, more plants
• Buy local and seasonal produce
• Reduce food waste

**Shopping:**
• Buy only what you need
• Choose quality items that last
• Support sustainable brands

Every small change adds up to make a big difference! 🌱`
    }
    
    if (lowerQuestion.includes('eco-friendly') || lowerQuestion.includes('sustainable')) {
      return `♻️ A product is eco-friendly when it:

**Materials:** Made from renewable, recycled, or biodegradable materials
**Production:** Uses clean energy and sustainable processes
**Packaging:** Minimal, recyclable, or compostable packaging
**Durability:** Built to last, reducing replacement needs
**End-of-life:** Can be recycled, composted, or safely disposed

**Look for certifications:**
• Energy Star (appliances)
• USDA Organic (food)
• Forest Stewardship Council (paper)
• Fair Trade (various products)
• Cradle to Cradle (overall sustainability)

Remember: the most eco-friendly product is often the one you don't need to buy! 🌿`
    }
    
    if (lowerQuestion.includes('certification') || lowerQuestion.includes('label')) {
      return `🏆 Here's how to decode eco certifications:

**Energy Star** ⭐ - Energy efficient appliances
**USDA Organic** 🌱 - No synthetic pesticides/fertilizers  
**Fair Trade** 🤝 - Ethical labor practices
**Forest Stewardship Council (FSC)** 🌳 - Sustainable forestry
**Cradle to Cradle** ♻️ - Circular design principles
**Green Seal** ✅ - Environmental standards met
**EPEAT** 💻 - Sustainable electronics

**Red flags to watch for:**
• Vague terms like "natural" or "eco" without certification
• Green imagery without substance (greenwashing)
• Claims that are too good to be true

When in doubt, research the certification body and their standards!`
    }
    
    return `🤖 I understand you're asking about "${question}". While I don't have a specific answer right now, here are some general eco-friendly tips:

• **Reduce** consumption when possible
• **Reuse** items creatively  
• **Recycle** properly according to local guidelines
• **Research** before buying - look for sustainable certifications
• **Repair** instead of replacing when feasible

For more specific advice, try rephrasing your question or check out reputable environmental websites like EPA.gov or Earth911.com! 

Is there a particular aspect of sustainability you'd like to explore further? 🌱`
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: '👋 Hi! I\'m your eco-friendly AI assistant. Ask me anything about sustainable living, product alternatives, or environmental impact!',
        timestamp: new Date().toISOString()
      }
    ])
  }

  const Message = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] p-4 rounded-lg ${
        message.type === 'user' 
          ? 'bg-green-500 text-white ml-4' 
          : 'bg-white border shadow-sm mr-4'
      }`}>
        {message.type === 'bot' && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-sm">🤖</span>
            </div>
            <span className="text-sm font-medium text-gray-600">EcoBot</span>
          </div>
        )}
        <div className="whitespace-pre-line leading-relaxed">
          {message.content}
        </div>
        <div className={`text-xs mt-2 opacity-75 ${
          message.type === 'user' ? 'text-white' : 'text-gray-500'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen eco-gradient flex flex-col">
      <Head>
        <title>Ask Anything - EcoSnap AI</title>
      </Head>

      {/* Header */}
      <header className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <ArrowLeft className="text-white" size={20} />
              </button>
            </Link>
            <h1 className="text-white text-xl font-bold">Ask EcoBot Anything</h1>
          </div>
          <button
            onClick={clearChat}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="text-white" size={16} />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 px-4 pb-4 overflow-hidden">
        <div className="h-full eco-card p-4 flex flex-col">
          
          {/* Sample Questions */}
          {messages.length === 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Lightbulb className="mr-2 text-yellow-500" size={20} />
                Try asking about:
              </h3>
              <div className="grid gap-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  >
                    <MessageCircle className="inline mr-2 text-green-500" size={16} />
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            <AnimatePresence>
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </AnimatePresence>
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-4"
              >
                <div className="bg-white border shadow-sm p-4 rounded-lg mr-4">
                  <div className="flex items-center space-x-2">
                    <div className="eco-spinner" />
                    <span className="text-gray-600">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about eco-friendly products, sustainability tips, or anything green..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="eco-button px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
            
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">
                💡 Tip: Be specific in your questions for better answers!
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
