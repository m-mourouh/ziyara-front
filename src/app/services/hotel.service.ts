import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Hotel,
  HotelSearchParams,
  HotelSearchResponse,
} from '../models/hotel.model';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private apiUrl = `${environment.apiUrl}/hotels`;

  constructor(private http: HttpClient) {}

  // Get all hotels with pagination and filtering
  getHotels(params: HotelSearchParams = {}): Observable<HotelSearchResponse> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach((key) => {
      const value = params[key as keyof HotelSearchParams];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.append(key, value.toString());
      }
    });

    return this.http
      .get<HotelSearchResponse>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Get hotel by ID
  getHotelById(id: number): Observable<Hotel> {
    return this.http
      .get<Hotel>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Search hotels
  searchHotels(
    query: string,
    page: number = 0,
    size: number = 18
  ): Observable<HotelSearchResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<HotelSearchResponse>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get hotels by location
  getHotelsByLocation(
    location: string,
    page: number = 0,
    size: number = 18
  ): Observable<HotelSearchResponse> {
    const params = new HttpParams()
      .set('location', location)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<HotelSearchResponse>(`${this.apiUrl}/location`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get hotels by price range
  getHotelsByPriceRange(
    minPrice: number,
    maxPrice: number,
    page: number = 0,
    size: number = 18
  ): Observable<HotelSearchResponse> {
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<HotelSearchResponse>(`${this.apiUrl}/price-range`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get featured hotels (mock for homepage)
  getFeaturedHotels(count: number = 6): Observable<Hotel[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', count.toString())
      .set('sortBy', 'score')
      .set('sortDirection', 'desc');

    return this.getHotels({
      page: 0,
      size: count,
      sortBy: 'score',
      sortDirection: 'desc',
    }).pipe(map((response) => response.content));
  }

  // Get popular hotels
  getPopularHotels(count: number = 10): Observable<Hotel[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', count.toString())
      .set('sortBy', 'review')
      .set('sortDirection', 'desc');

    return this.http.get<HotelSearchResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError),
      map((response) => response.content)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Hotel Service Error:', error);
    return throwError(() => error);
  }
}
