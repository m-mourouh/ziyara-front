import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
  expiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();

  set(url: string, response: HttpResponse<any>, ttl: number = 300000): void {
    const entry: CacheEntry = {
      response: response.clone(),
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    
    this.cache.set(url, entry);
    this.cleanExpiredEntries();
  }

  get(url: string): HttpResponse<any> | null {
    const entry = this.cache.get(url);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(url);
      return null;
    }
    
    return entry.response.clone();
  }

  delete(url: string): void {
    this.cache.delete(url);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Clear cache entries matching a pattern
  clearPattern(pattern: string): void {
    for (const [key] of this.cache.entries()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}