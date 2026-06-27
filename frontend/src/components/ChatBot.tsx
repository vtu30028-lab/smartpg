import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Loader2, MapPin, LocateFixed } from 'lucide-react';
import api from '../services/api';
import { useLocationContext } from '../context/LocationContext';
import type { AISearchResult, PG } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  results?: PG[];
}

export default function ChatBot() {
  const { location, status, requestLocation, isLive } = useLocationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI PG Assistant. Enable location for nearby results, then ask e.g. "Find PG under 8000 near college with food".',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-request location when chat opens
  useEffect(() => {
    if (isOpen && status === 'idle') {
      requestLocation();
    }
  }, [isOpen, status, requestLocation]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      const { data } = await api.post<AISearchResult>('/ai-search', {
        query,
        lat: location?.lat,
        lng: location?.lng,
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.summary, results: data.results },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn\'t reach the server. Make sure the backend is running on port 5000.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
      >
        <Bot size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[420px] max-h-[70vh] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} />
                  <div>
                    <h3 className="font-semibold">AI PG Assistant</h3>
                    <p className="text-xs text-white/80">Smart location-aware search</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              {location ? (
                <div className="flex items-center gap-1.5 text-xs text-white/90 bg-white/10 rounded-lg px-2 py-1">
                  <span className="relative flex h-1.5 w-1.5">
                    {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />}
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-300" />
                  </span>
                  <MapPin size={11} />
                  {location.placeName || 'Your location'}
                </div>
              ) : status === 'loading' ? (
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <Loader2 size={11} className="animate-spin" /> Getting location...
                </div>
              ) : (
                <button
                  onClick={requestLocation}
                  className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 transition-colors"
                >
                  <LocateFixed size={11} /> Enable location for nearby PGs
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[50vh]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                    {msg.results && msg.results.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.results.slice(0, 3).map((pg) => (
                          <Link
                            key={pg.id}
                            to={`/pg/${pg.id}`}
                            onClick={() => setIsOpen(false)}
                            className="block p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                          >
                            <p className="font-medium text-xs">{pg.name}</p>
                            <p className="text-xs opacity-70">
                              ₹{pg.rent}/mo {pg.distance != null && `• ${pg.distance} km away`}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Searching PGs near you...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={location ? 'Try: "PG under 8000 with food"' : 'Enable location first...'}
                  className="input-field !py-2 text-sm flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="btn-primary !px-3 !py-2 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
