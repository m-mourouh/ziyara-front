export interface Hotel {
    id: number;
    name: string;
    description: string;
    review: number;
    score: number;
    price: number;
    country: string;
    city: string;
    location: string;
    image: string;
    amenities: string;
  }
  
  export interface HotelDto {
    id: number;
    name: string;
    description: string;
    review: number;
    score: number;
    price: number;
    country: string;
    city: string;
    location: string;
    image: string;
    amenities: string;
    averageRating?: number;
    totalRatings?: number;
  }
  
  export interface HotelSearchParams {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    minRating?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
  
  export interface HotelSearchResponse {
    content: Hotel[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }