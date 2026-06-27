import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs">
                PG
              </div>
              <span className="font-display font-bold text-lg">
                Smart<span className="gradient-text">PG</span>
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md">
              AI-powered PG finder helping students discover the perfect paying guest accommodation
              near colleges with smart search, maps, and secure payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Search PG</Link></li>
              <li><Link to="/register" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Register</Link></li>
              <li><Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2"><Mail size={14} /> support@smartpg.com</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Bangalore, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Smart PG Assistant. All rights reserved.</p>
          <div className="flex items-center gap-1 text-gray-400">
            <Home size={14} />
            <span>Find your perfect PG home</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
