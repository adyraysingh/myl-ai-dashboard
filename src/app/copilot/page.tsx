'use client'
import { useState, useRef, useEffect } from 'react'
import { sendCopilotMessage } from '@/lib/api'
import { Send, Bot, User } from 'lucide-react'

interface Message { role: 'user'|'assistant'; content: string; time: string }

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Maya, your AI sales copilot. How can I help you today?', time: new Date().toLocaleTimeString() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input, time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await sendCopilotMessage(input)
      setMessages(prev => [...prev, { role: 'assistant', content: res?.message || res?.response || JSON.stringify(res), time: new Date().toLocaleTimeString() }])
    } catch(e:any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}`, time: new Date().toLocaleTimeString() }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">AI Copilot</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">Chat with Maya AI for sales insights and decisions</p>
      </div>
      <div className="flex-1 overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'bg-indigo-600' : 'bg-[var(--muted)]'}`}>
              {m.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
            </div>
            <div className={`max-w-[75%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.role === 'assistant' ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'bg-indigo-600 text-white'}`}>
                {m.content}
              </div>
              <span className="text-[10px] text-[var(--muted-foreground)] px-1">{m.time}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
            <div className="px-4 py-2.5 bg-[var(--muted)] rounded-2xl">
              <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: `${i*0.15}s`}} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask Maya anything about your sales pipeline..."
          className="flex-1 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-indigo-500"
        />
        <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors">
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
