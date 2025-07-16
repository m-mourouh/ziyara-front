export interface Rating {
  id: number;
  userId: number;
  hotelId: number;
  rating: number;
  comment: string;
  createdAt: string;
  userFirstname?: string;
  userLastname?: string;
  hotelName?: string;
}

export interface CreateRatingRequest {
  hotelId: number;
  rating: number;
  comment: string;
}

export interface UpdateRatingRequest {
  rating: number;
  comment: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: number[];
}
