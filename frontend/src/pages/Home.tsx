import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bot, MapPin, Shield, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import api from '../services/api';
import PGCard from '../components/PGCard';
import ChatBot from '../components/ChatBot';
import { getFeaturedPGs } from '../data/fallbackPGs';
import type { PG } from '../types';

export default function Home() {
  const [featuredPGs, setFeaturedPGs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PG[]>('/pgs?featured=true')
      .then(({ data }) => {
        // Remove duplicates from backend if any exist
        const uniqueData = data?.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i) || [];
        setFeaturedPGs(uniqueData.length > 0 ? uniqueData.slice(0, 4) : getFeaturedPGs().slice(0, 4));
      })
      .catch(() => setFeaturedPGs(getFeaturedPGs().slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: Bot, title: 'AI Assistant', desc: 'Natural language PG search powered by smart AI' },
    { icon: MapPin, title: 'Location Based', desc: 'Find nearby PGs with distance calculation' },
    { icon: CreditCard, title: 'Secure Payments', desc: 'Pay rent securely via Razorpay' },
    { icon: Shield, title: 'Verified Listings', desc: 'Trusted PG owners and verified reviews' },
  ];

  return (
    <div>
      <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-6">
              <Sparkles size={14} /> AI Powered PG Finder
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect
              <br />
              <span className="text-yellow-300">PG Home</span> Near You
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Smart PG Assistant helps students discover the best paying guest accommodations
              with AI search, live maps, and secure payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search" className="btn-primary !text-base !px-8 !py-4 !bg-primary-600 !text-white hover:!bg-primary-700 shadow-2xl">
                <Search size={20} /> Search PG Now
              </Link>
              <Link to="/register" className="btn-secondary !text-base !px-8 !py-4 !bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
                List Your PG <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
                <Icon size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold mb-2">Featured PGs</h2>
            <p className="text-gray-600 dark:text-gray-400">Top rated accommodations handpicked for you</p>
          </div>
          <Link to="/search" className="btn-secondary text-sm hidden sm:flex">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card h-80 animate-pulse !p-0">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPGs.map((pg, i) => (
              <PGCard key={pg.id} pg={pg} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-center py-12">
          <Bot size={48} className="mx-auto mb-4 text-primary-500" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
            Try Our AI Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">
            Just ask: "Find PG under 8000 near college with food" and get instant personalized recommendations.
          </p>
          <Link to="/search" className="btn-primary">
            <Sparkles size={18} /> Start AI Search
          </Link>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}