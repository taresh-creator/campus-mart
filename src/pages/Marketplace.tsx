import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ListingWithSeller, Category } from '@/types/supabase';
import { ListingCard } from '@/components/ListingCard';
import { Loader2, PackageSearch, Plus, SearchX } from 'lucide-react';

interface MarketplaceProps {
  searchQuery: string;
  selectedCategory: Category | 'All';
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function Marketplace({
  searchQuery,
  selectedCategory,
  onNavigate,
}: MarketplaceProps) {
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('listings')
        .select(
          'id, seller_id, title, description, category, condition, price, price_type, contact, location, image_url, status, created_at, seller:profiles!listings_seller_id_fkey(full_name, email)'
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        setListings([]);
      } else {
        // Normalize the join result (supabase returns seller as array in some cases)
        const normalized = (data ?? []).map((item) => ({
          ...item,
          seller:
            item.seller && Array.isArray(item.seller)
              ? item.seller[0]
              : item.seller,
        })) as unknown as ListingWithSeller[];
        setListings(normalized);
      }

      setLoading(false);
    }

    fetchListings();
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse items from fellow students
          </p>
        </div>
        <button
          onClick={() => onNavigate('sell')}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Sell Item
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-slate-400">Loading listings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium">
            Something went wrong loading listings.
          </p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          {searchQuery || selectedCategory !== 'All' ? (
            <>
              <SearchX className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                No listings match your search
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Try a different keyword or category
              </p>
            </>
          ) : (
            <>
              <PackageSearch className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                No listings yet
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Be the first to sell something!
              </p>
              <button
                onClick={() => onNavigate('sell')}
                className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Sell Item
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {listings.length} {listings.length === 1 ? 'item' : 'items'} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() =>
                  onNavigate('item-details', { id: listing.id })
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
