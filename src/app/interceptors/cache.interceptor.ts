import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);

  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Check if request should be cached
  const shouldCache =
    req.url.includes('/hotels') &&
    !req.url.includes('/ratings') &&
    !req.headers.has('X-Skip-Cache');

  if (!shouldCache) {
    return next(req);
  }

  // Check cache first
  const cachedResponse = cacheService.get(req.url);
  if (cachedResponse) {
    return of(cachedResponse);
  }

  // Make request and cache response
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cacheService.set(req.url, event, 300000); // Cache for 5 minutes
      }
    })
  );
};
