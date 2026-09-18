import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ListingWithSeller } from '@/types/supabase';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  User,
} from 'lucide-react';

interface ItemDetailsProps {
  listingId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function ItemDetails({ listingId, onNavigate }: ItemDetailsProps) {
  const [listing, setListing] = useState<ListingWithSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      setError(null);

      try {
        const data = await api.listings.getById(listingId);
        if (!data) {
          setError('Listing not found.');
        } else {
          setListing(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Listing not found.');
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-slate-400">Loading listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-red-500 font-medium">
          {error ?? 'Listing not found.'}
        </p>
        <button
          onClick={() => onNavigate('marketplace')}
          className="mt-4 text-emerald-600 font-medium hover:underline"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const postedDate = new Date(listing.created_at).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => onNavigate('marketplace')}
        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square border border-slate-200">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-slate-300 text-6xl font-bold">
                {listing.category[0]}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
              {listing.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              {listing.condition}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {listing.title}
          </h1>

          <p className="text-3xl font-bold text-emerald-600 mb-1">
            Rs {Number(listing.price).toFixed(2)}
          </p>
          <p className="text-sm text-slate-500 mb-6">
            {listing.price_type === 'Negotiable'
              ? 'Price is negotiable'
              : 'Fixed price'}
          </p>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">
              Description
            </h2>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Seller info */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">
              Seller Information
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-medium">
                {listing.seller?.full_name ?? 'Unknown seller'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{listing.contact}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Posted on {postedDate}</span>
            </div>
          </div>

          {/* Contact button */}
          <a
            href={`tel:${listing.contact}`}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Seller
          </a>
        </div>
      </div>
    </div>
  );
}
