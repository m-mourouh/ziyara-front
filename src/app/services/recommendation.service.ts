import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { Hotel } from '../models/hotel.model';
import { RecommendationResponse, RecommendationRequest } from '../models/recommendation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) {}

  // Get personalized recommendations
  getRecommendations(count: number = 10): Observable<Hotel[]> {
    const params = new HttpParams().set('count', count.toString());
    
    return this.http.get<Hotel[]>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get popular hotels (non-personalized)
  getPopularHotels(count: number = 10): Observable<Hotel[]> {
    const params = new HttpParams().set('count', count.toString());
    
    return this.http.get<Hotel[]>(`${this.apiUrl}/popular`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get budget-friendly recommendations
  getBudgetRecommendations(count: number = 10): Observable<Hotel[]> {
    const params = new HttpParams().set('count', count.toString());
    
    return this.http.get<Hotel[]>(`${this.apiUrl}/budget`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get luxury recommendations
  getLuxuryRecommendations(count: number = 10): Observable<Hotel[]> {
    const params = new HttpParams().set('count', count.toString());
    
    return this.http.get<Hotel[]>(`${this.apiUrl}/luxury`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Recommendation Service Error:', error);
    return throwError(() => error);
  }
}