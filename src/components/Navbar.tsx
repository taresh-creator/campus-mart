import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Store,
  X,
} from 'lucide-react';
import type { Category } from '@/types/supabase';
import { CATEGORIES } from '@/types/supabase';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: Category | 'All';
  onCategoryChange: (c: Category | 'All') => void;
}

export function Navbar({
  currentPage,
  onNavigate,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: NavbarProps) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'sell', label: 'Sell Item', icon: Plus },
    { id: 'my-listings', label: 'My Listings', icon: Package },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 hidden sm:block">
              Campus Mart
            </span>
          </button>

          {/* Search + filter - desktop */}
          {currentPage === 'marketplace' && (
            <div className="hidden md:flex flex-1 max-w-2xl items-center gap-3 mx-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search for books, electronics..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) =>
                  onCategoryChange(e.target.value as Category | 'All')
                }
                className="py-2.5 px-3 rounded-xl bg-slate-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nav items - desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User + logout - desktop */}
          <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-200 ml-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                {profile?.full_name ?? 'Student'}
              </p>
              <p className="text-xs text-slate-400">{profile?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {currentPage === 'marketplace' && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 text-sm"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) =>
                  onCategoryChange(e.target.value as Category | 'All')
                }
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-sm font-medium text-slate-700"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {profile?.full_name ?? 'Student'}
              </p>
              <p className="text-xs text-slate-400">{profile?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
