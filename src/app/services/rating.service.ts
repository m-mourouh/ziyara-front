import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { 
  Rating, 
  CreateRatingRequest, 
  UpdateRatingRequest,
  RatingStats 
} from '../models/rating.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = `${environment.apiUrl}/ratings`;

  constructor(private http: HttpClient) {}

  // Create a new rating
  createRating(ratingData: CreateRatingRequest): Observable<ApiResponse<Rating>> {
    return this.http.post<ApiResponse<Rating>>(this.apiUrl, ratingData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update existing rating
  updateRating(ratingId: number, ratingData: UpdateRatingRequest): Observable<ApiResponse<Rating>> {
    return this.http.put<ApiResponse<Rating>>(`${this.apiUrl}/${ratingId}`, ratingData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete rating
  deleteRating(ratingId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${ratingId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get user's ratings
  getUserRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/user`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get ratings for a specific hotel
  getHotelRatings(hotelId: number, page: number = 0, size: number = 10): Observable<Rating[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Rating[]>(`${this.apiUrl}/hotel/${hotelId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get rating statistics for a hotel
  getHotelRatingStats(hotelId: number): Observable<RatingStats> {
    return this.http.get<RatingStats>(`${this.apiUrl}/hotel/${hotelId}/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get user's rating for a specific hotel
  getUserHotelRating(hotelId: number): Observable<Rating | null> {
    return this.http.get<Rating>(`${this.apiUrl}/user/hotel/${hotelId}`)
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            return throwError(() => null); // User hasn't rated this hotel
          }
          return this.handleError(error);
        })
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Rating Service Error:', error);
    return throwError(() => error);
  }
}