import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthPage } from '@/components/AuthPage';
import { Navbar } from '@/components/Navbar';
import { Marketplace } from '@/pages/Marketplace';
import { ItemDetails } from '@/pages/ItemDetails';
import { SellForm } from '@/pages/SellForm';
import { MyListings } from '@/pages/MyListings';
import type { Category, Listing } from '@/types/supabase';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('marketplace');
  const [params, setParams] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>(
    'All'
  );
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  function navigate(newPage: string, newParams?: Record<string, string>) {
    setPage(newPage);
    setParams(newParams ?? {});

    if (newPage !== 'sell') {
      setEditingListing(null);
    }

    if (newPage === 'marketplace') {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }

  function handleEdit(listing: Listing) {
    setEditingListing(listing);
    setPage('sell');
    window.scrollTo(0, 0);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Loading Campus Mart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        currentPage={page}
        onNavigate={navigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <main>
        {page === 'marketplace' && (
          <Marketplace
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onNavigate={navigate}
          />
        )}
        {page === 'item-details' && params.id && (
          <ItemDetails listingId={params.id} onNavigate={navigate} />
        )}
        {page === 'sell' && (
          <SellForm
            onNavigate={navigate}
            editingListing={editingListing}
          />
        )}
        {page === 'my-listings' && (
          <MyListings onNavigate={navigate} onEdit={handleEdit} />
        )}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-400">
          Campus Mart — Student marketplace for buying and selling educational
          items
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
