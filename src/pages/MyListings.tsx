import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Listing } from '@/types/supabase';
import { ListingCard } from '@/components/ListingCard';
import {
  AlertTriangle,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

interface MyListingsProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onEdit: (listing: Listing) => void;
}

export function MyListings({ onNavigate, onEdit }: MyListingsProps) {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchListings() {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setListings(data as Listing[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    // Delete the image from storage if it exists
    if (deleteTarget.image_url) {
      try {
        const url = new URL(deleteTarget.image_url);
        const path = url.pathname.split('/listing-images/')[1];
        if (path) {
          await supabase.storage.from('listing-images').remove([path]);
        }
      } catch {
        // Ignore image deletion errors
      }
    }

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      setError(error.message);
    } else {
      setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    }

    setDeleting(false);
    setDeleteTarget(null);
  }

  const listingsWithSeller = listings.map((l) => ({
    ...l,
    seller: { full_name: 'You', email: '' },
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your posted items
          </p>
        </div>
        <button
          onClick={() => onNavigate('sell')}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Sell New Item
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-slate-400">Loading your listings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium">
            Something went wrong loading your listings.
          </p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">You haven't posted yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Start selling your unused items
          </p>
          <button
            onClick={() => onNavigate('sell')}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Sell Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {listingsWithSeller.map((listing) => (
            <div key={listing.id} className="relative group">
              <ListingCard
                listing={listing}
                onClick={() =>
                  onNavigate('item-details', { id: listing.id })
                }
              />
              {/* Action buttons overlay */}
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(listings.find((l) => l.id === listing.id)!);
                  }}
                  className="bg-white shadow-md p-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(
                      listings.find((l) => l.id === listing.id)!
                    );
                  }}
                  className="bg-white shadow-md p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {/* Status badge */}
              <div className="absolute bottom-3 left-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    listing.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {listing.status === 'active' ? 'Active' : 'Sold'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Delete this listing?
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  "{deleteTarget.title}" will be permanently removed. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
