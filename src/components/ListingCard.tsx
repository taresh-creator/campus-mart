import { MapPin } from 'lucide-react';
import type { ListingWithSeller } from '@/types/supabase';
import { CATEGORIES } from '@/types/supabase';

interface ListingCardProps {
  listing: ListingWithSeller;
  onClick: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Books: 'bg-blue-50 text-blue-600',
  Electronics: 'bg-amber-50 text-amber-600',
  Stationery: 'bg-pink-50 text-pink-600',
  Calculators: 'bg-purple-50 text-purple-600',
  'Lab Equipment': 'bg-teal-50 text-teal-600',
  Other: 'bg-slate-100 text-slate-600',
};

const CONDITION_BADGE: Record<string, string> = {
  New: 'bg-emerald-100 text-emerald-700',
  'Like New': 'bg-green-100 text-green-700',
  Good: 'bg-yellow-100 text-yellow-700',
  Used: 'bg-orange-100 text-orange-700',
};

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const categoryColor =
    CATEGORY_COLORS[listing.category] ?? 'bg-slate-100 text-slate-600';
  const conditionColor =
    CONDITION_BADGE[listing.condition] ?? 'bg-slate-100 text-slate-600';

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all text-left flex flex-col"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-300 text-4xl font-bold">
              {CATEGORIES.indexOf(listing.category) >= 0
                ? listing.category[0]
                : '?'}
            </span>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColor}`}
        >
          {listing.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${conditionColor}`}
          >
            {listing.condition}
          </span>
          <span className="text-xs text-slate-400">
            {listing.price_type === 'Negotiable' ? 'Negotiable' : 'Fixed'}
          </span>
        </div>

        <p className="text-2xl font-bold text-slate-900 mb-3">
          ${Number(listing.price).toFixed(2)}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-600 truncate">
            {listing.seller?.full_name ?? 'Unknown seller'}
          </span>
          <span className="flex items-center gap-0.5 shrink-0">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{listing.location}</span>
          </span>
        </div>
      </div>
    </button>
  );
}
