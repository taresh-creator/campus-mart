import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Category, Condition, PriceType, Listing } from '@/types/supabase';
import { CATEGORIES, CONDITIONS, PRICE_TYPES } from '@/types/supabase';
import {
  ArrowLeft,
  ImageUp,
  Loader2,
  Tag,
  X,
} from 'lucide-react';

interface SellFormProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  editingListing?: Listing | null;
}

export function SellForm({ onNavigate, editingListing }: SellFormProps) {
  const { user } = useAuth();
  const isEdit = !!editingListing;

  const [title, setTitle] = useState(editingListing?.title ?? '');
  const [description, setDescription] = useState(editingListing?.description ?? '');
  const [category, setCategory] = useState<Category>(
    editingListing?.category ?? 'Books'
  );
  const [condition, setCondition] = useState<Condition>(
    editingListing?.condition ?? 'Good'
  );
  const [price, setPrice] = useState(
    editingListing ? String(editingListing.price) : ''
  );
  const [priceType, setPriceType] = useState<PriceType>(
    editingListing?.price_type ?? 'Fixed'
  );
  const [contact, setContact] = useState(editingListing?.contact ?? '');
  const [location, setLocation] = useState(editingListing?.location ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingListing?.image_url ?? null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image must be under 5MB.',
      }));
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      newErrors.price = 'Enter a valid price.';
    if (!contact.trim()) newErrors.contact = 'Contact number is required.';
    if (!location.trim()) newErrors.location = 'Location is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile || !user) return editingListing?.image_url ?? null;
    const res = await api.upload.uploadImage(imageFile);
    return res.url;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      let imageUrl = editingListing?.image_url ?? null;

      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        price: Number(price),
        price_type: priceType,
        contact: contact.trim(),
        location: location.trim(),
        image_url: imageUrl,
        status: 'active' as const,
      };

      if (isEdit && editingListing) {
        await api.listings.update(editingListing.id, payload);
        onNavigate('my-listings');
      } else {
        await api.listings.create(payload);
        onNavigate('marketplace');
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => onNavigate(isEdit ? 'my-listings' : 'marketplace')}
        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {isEdit ? 'Back to My Listings' : 'Back to Marketplace'}
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="w-6 h-6 text-emerald-500" />
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Listing' : 'Sell an Item'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Item Image
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden w-full h-48 bg-slate-100">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer transition-colors">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImageUp className="w-8 h-8" />
                  <span className="text-sm font-medium">
                    Click to upload an image
                  </span>
                  <span className="text-xs text-slate-400">Max 5MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Organic Chemistry Textbook"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the item, its condition, what's included..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Price type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Price Type
              </label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as PriceType)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              >
                {PRICE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contact Number
              </label>
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {errors.contact && (
                <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                College / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., UCLA, Los Angeles"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                onNavigate(isEdit ? 'my-listings' : 'marketplace')
              }
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
