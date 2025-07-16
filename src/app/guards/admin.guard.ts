import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      // Check if user is authenticated and has admin role
      if (user && user.email.includes('admin')) {
        // Simple admin check - improve in production
        return true;
      } else {
        messageService.add({
          severity: 'error',
          summary: 'Accès refusé',
          detail: "Vous n'avez pas les permissions administrateur",
        });
        router.navigate(['/home']);
        return false;
      }
    })
  );
};
