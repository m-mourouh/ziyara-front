import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        return true; // Allow access for guests
      } else {
        // Redirect authenticated users away from login/register pages
        router.navigate(['/home']);
        return false;
      }
    })
  );
};
