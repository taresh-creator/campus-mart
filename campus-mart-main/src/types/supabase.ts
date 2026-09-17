export type Category =
  | 'Books'
  | 'Electronics'
  | 'Stationery'
  | 'Calculators'
  | 'Lab Equipment'
  | 'Other';

export type Condition = 'New' | 'Like New' | 'Good' | 'Used';

export type PriceType = 'Fixed' | 'Negotiable';

export type ListingStatus = 'active' | 'sold';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  price: number;
  price_type: PriceType;
  contact: string;
  location: string;
  image_url: string | null;
  status: ListingStatus;
  created_at: string;
}

export interface ListingWithSeller extends Listing {
  seller: Pick<Profile, 'full_name' | 'email'> | null;
}

export const CATEGORIES: Category[] = [
  'Books',
  'Electronics',
  'Stationery',
  'Calculators',
  'Lab Equipment',
  'Other',
];

export const CONDITIONS: Condition[] = ['New', 'Like New', 'Good', 'Used'];

export const PRICE_TYPES: PriceType[] = ['Fixed', 'Negotiable'];
