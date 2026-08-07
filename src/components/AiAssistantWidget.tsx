import React, { useState, useEffect } from 'react';
import { Bot, Mic, MicOff, Send, X, Sparkles, TrendingUp, Package, Users, ShoppingCart, Search } from 'lucide-react';
import { Product, Customer, DailyStats, Sale } from '../types';

interface AiAssistantWidgetProps {
  products: Product[];
  customers: Customer[];
  stats: DailyStats | null;
  recentSales: Sale[];
  onNavigateTab: (tab: string) => void;
  onOpenQuickAction: (action: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionTab?: string;
  actionLabel?: string;
  timestamp: string;
}

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  products,
  customers,
  stats,
  recentSales,
  onNavigateTab,
  onOpenQuickAction
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Namaste! I am your TradeMate AI Business Assistant. You can type or use voice commands like 'Show low stock items', 'Show today's profit', or 'Open customer ledger'.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Voice speech recognition setup
  const handleListenToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian Accent English / Hindi mix

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleProcessQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleProcessQuery = (textToProcess: string) => {
    const q = (textToProcess || query).trim();
    if (!q) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');

    // AI Logic Engine
    const lower = q.toLowerCase();
    let replyText = '';
    let actionTab: string | undefined = undefined;
    let actionLabel: string | undefined = undefined;

    if (lower.includes('reorder') || lower.includes('low stock') || lower.includes('stock below')) {
      const lowStock = products.filter(p => p.currentStock <= p.minStock);
      if (lowStock.length === 0) {
        replyText = "All stock levels are healthy! No items are currently below minimum reorder level.";
      } else {
        const itemNames = lowStock.map(p => `${p.name} (${p.currentStock} ${p.unit})`).join(', ');
        replyText = `Found ${lowStock.length} items below reorder level: ${itemNames}.`;
        actionTab = 'products';
        actionLabel = 'Go to Products Inventory';
      }
    } else if (lower.includes('profit') || lower.includes('margin')) {
      const profit = stats?.estimatedProfitToday || 0;
      replyText = `Today's estimated net profit is ₹${profit.toLocaleString('en-IN')} after subtracting daily expenses.`;
      actionTab = 'reports';
      actionLabel = 'View Financial Reports';
    } else if (lower.includes('highest selling') || lower.includes('top selling') || lower.includes('fast moving')) {
      const sorted = [...products].sort((a, b) => (b.purchasePrice || 0) - (a.purchasePrice || 0));
      const top = sorted[0];
      replyText = top
        ? `Your top value inventory item is '${top.name}' priced at ₹${top.sellingPrice} per ${top.unit} with ${top.currentStock} ${top.unit} in stock.`
        : "No products cataloged yet.";
      actionTab = 'products';
      actionLabel = 'View All Products';
    } else if (lower.includes('not sold') || lower.includes('dead stock') || lower.includes('slow moving')) {
      const dead = products.filter(p => p.currentStock > 30);
      replyText = dead.length > 0
        ? `You have ${dead.length} items with heavy stock (>30 units) that may be moving slow: ${dead.slice(0, 3).map(d => d.name).join(', ')}.`
        : "No dead stock identified. Inventory turnover is steady.";
      actionTab = 'reports';
      actionLabel = 'View Dead Stock Analysis';
    } else if (lower.includes('ledger') || lower.includes('udhaar') || lower.includes('customer') || lower.includes('collect')) {
      const totalUdhaar = stats?.totalPendingUdhaar || 0;
      replyText = `Total pending customer Udhaar Khata is ₹${totalUdhaar.toLocaleString('en-IN')}.`;
      actionTab = 'customers';
      actionLabel = 'Open Customer Udhaar Ledger';
    } else if (lower.includes('sale') || lower.includes('bill') || lower.includes('sell')) {
      replyText = `Ready to issue a new bill! Total sales today stand at ₹${(stats?.todaySalesTotal || 0).toLocaleString('en-IN')}.`;
      actionTab = 'sales';
      actionLabel = 'Open POS Counter Billing';
    } else if (lower.includes('supplier') || lower.includes('purchase')) {
      replyText = "Opening Supplier analytics & purchase management.";
      actionTab = 'suppliers';
      actionLabel = 'Go to Suppliers';
    } else {
      replyText = `I analyzed '${q}'. Current inventory has ${products.length} products, today's sales are ₹${stats?.todaySalesTotal || 0}, and pending Udhaar is ₹${stats?.totalPendingUdhaar || 0}.`;
      actionTab = 'dashboard';
      actionLabel = 'View Dashboard';
    }

    setTimeout(() => {
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        actionTab,
        actionLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiReply]);
    }, 400);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer border border-blue-400/40"
          title="TradeMate AI Voice Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <span className="text-xs font-bold hidden sm:inline-block pr-1">AI Voice Assistant</span>
        </button>
      )}

      {/* Floating AI Assistant Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-6 right-2 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[580px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col font-sans overflow-hidden text-white">
          {/* Header */}
          <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  TradeMate AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  ● Voice Speech Recognition Active
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 min-h-[260px] max-h-[360px] text-xs">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.actionTab && (
                    <button
                      onClick={() => {
                        onNavigateTab(m.actionTab!);
                        setIsOpen(false);
                      }}
                      className="mt-2 text-[10px] bg-blue-500 hover:bg-blue-400 text-white font-bold px-2.5 py-1 rounded-lg block cursor-pointer transition-colors"
                    >
                      {m.actionLabel || 'View Details'} →
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick Suggested Query Chips */}
          <div className="p-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] text-slate-300">
            {[
              "Products below reorder level",
              "Today's profit",
              "Open customer ledger",
              "Items not sold in 90 days"
            ].map(q => (
              <button
                key={q}
                onClick={() => handleProcessQuery(q)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 whitespace-nowrap cursor-pointer hover:border-blue-400"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input & Voice Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleListenToggle}
              className={`p-2.5 rounded-xl text-white transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700'
              }`}
              title={isListening ? 'Listening...' : 'Voice Command'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleProcessQuery(query)}
              placeholder={isListening ? 'Speak your query now...' : 'Ask AI or type speech command...'}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={() => handleProcessQuery(query)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
