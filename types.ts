export interface PriceHistory {
  date: string;
  price: number;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  listingPrice: number;
  marketValue: number;
  bedrooms: number;
  bathrooms: number;
  livingAreaSqft: number;
  lotSizeSqft: number;
  imageUrl: string;
  investmentScore: number;
  priceHistory: PriceHistory[];
  philosophy: string;
  isActive: boolean;
}