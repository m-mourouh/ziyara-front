import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        messageService.add({
          severity: 'warn',
          summary: 'Accès restreint',
          detail: 'Veuillez vous connecter pour accéder à cette page'
        });
        router.navigate(['/login']);
        return false;
      }
    })
  );
};