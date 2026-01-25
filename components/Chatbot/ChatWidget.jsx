'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import ProductCard from './ProductCard'

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Welcome to M&K Jewellers! ✨ How may I assist you in finding the perfect piece today?' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [conversationId, setConversationId] = useState(null)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(scrollToBottom, [messages])

    const handleSend = async () => {
        if (!input.trim() || isTyping) return

        const userMessage = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsTyping(true)

        try {
            const res = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    conversationId,
                }),
            })

            const data = await res.json()

            if (data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.data.reply,
                    products: data.data.products || [], // Add products from agent
                    toolsUsed: data.data.toolsUsed || [] // Track which tools were used
                }])

                if (!conversationId) {
                    setConversationId(data.data.conversationId)
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'My apologies, I encountered an issue. Please try again.'
                }])
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize for the inconvenience. Please try again.'
            }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <>
            {/* Floating Button - Elegant Gold Theme */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white p-4 rounded-full shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all duration-300 z-50 group"
                    aria-label="Open chat"
                >
                    <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </button>
            )}

            {/* Chat Window - Premium Jewelry Theme */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-amber-100 overflow-hidden">
                    {/* Header - Elegant Gold Gradient */}
                    <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-b border-amber-200 p-5">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles size={18} className="text-amber-600" />
                                    <h3 className="font-bold text-gray-800 text-lg">M&K Jewellers</h3>
                                </div>
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Online • Here to help
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-amber-100 rounded-lg p-2 transition-colors text-gray-600 hover:text-gray-800"
                                aria-label="Close chat"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages - Luxury Background */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-amber-50/30 to-white">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                                    : 'bg-white text-gray-800 shadow-md border border-amber-100'
                                    } p-4 rounded-2xl ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-100">
                                            <Sparkles size={14} className="text-amber-600" />
                                            <span className="text-xs font-semibold text-amber-700">M&K Assistant</span>
                                        </div>
                                    )}
                                    <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-strong:text-inherit prose-strong:font-semibold prose-ul:my-1 prose-li:my-0">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p className="my-1" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 my-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="my-0.5" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Product Cards - Show if agent returned products */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {msg.products.map((product, pIdx) => (
                                                <ProductCard key={product.id || pIdx} product={product} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-amber-100 p-4 rounded-2xl rounded-bl-sm shadow-md">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-100">
                                        <Sparkles size={14} className="text-amber-600" />
                                        <span className="text-xs font-semibold text-amber-700">M&K Assistant</span>
                                    </div>
                                    <div className="flex space-x-1.5">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input - Premium Gold Accent */}
                    <div className="p-4 border-t border-amber-100 bg-gradient-to-r from-amber-50/50 to-yellow-50/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder="Ask about our jewelry..."
                                disabled={isTyping}
                                className="flex-1 border-2 border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 bg-white placeholder:text-gray-400 text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-3 rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                                aria-label="Send message"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">Powered by M.K.Jewellers ✨</p>
                    </div>
                </div>
            )}
        </>
    )
}
