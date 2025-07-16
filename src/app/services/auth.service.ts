import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

import { 
  User, 
  UserRegistrationDto, 
  LoginRequest, 
  AuthResponse,
  UserProfileDto
} from '../models/user.model';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

interface JwtPayload {
  userId: number;
  email: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'ziyara_token';

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      this.loadUserProfile().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  register(userData: UserRegistrationDto): Observable<ApiResponse<UserProfileDto>> {
    return this.http.post<ApiResponse<UserProfileDto>>(`${this.apiUrl}/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            this.currentUserSubject.next(response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

  getProfile(): Observable<ApiResponse<UserProfileDto>> {
    return this.http.get<ApiResponse<UserProfileDto>>(`${this.apiUrl}/profile`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateProfile(userData: Partial<UserProfileDto>): Observable<ApiResponse<UserProfileDto>> {
    return this.http.put<ApiResponse<UserProfileDto>>(`${this.apiUrl}/profile`, userData)
      .pipe(
        tap(response => {
          if (response.data) {
            this.currentUserSubject.next(response.data as User);
          }
        }),
        catchError(this.handleError)
      );
  }

  private loadUserProfile(): Observable<User> {
    return new Observable(observer => {
      this.getProfile().subscribe({
        next: (response) => {
          if (response.data) {
            observer.next(response.data as User);
            observer.complete();
          } else {
            observer.error('No user data received');
          }
        },
        error: (error) => observer.error(error)
      });
    });
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!(token && this.isTokenValid(token));
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth Service Error:', error);
    return throwError(() => error);
  }
}