import { Hotel } from "./hotel.model";

export interface RecommendationResponse {
    hotels: Hotel[];
    algorithm: string;
    timestamp: string;
  }
  
  export interface RecommendationRequest {
    count?: number;
    userId?: number;
  }