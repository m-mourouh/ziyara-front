import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Données invalides';
          break;
          
        case 401:
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          authService.logout();
          router.navigate(['/login']);
          break;
          
        case 403:
          errorMessage = 'Accès refusé. Permissions insuffisantes.';
          break;
          
        case 404:
          errorMessage = 'Ressource introuvable';
          break;
          
        case 409:
          errorMessage = error.error?.message || 'Conflit de données';
          break;
          
        case 422:
          errorMessage = error.error?.message || 'Données de validation incorrectes';
          break;
          
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
          
        case 502:
          errorMessage = 'Service temporairement indisponible';
          break;
          
        case 503:
          errorMessage = 'Service en maintenance';
          break;
          
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }

      // Show error message (except for 401 which is handled by logout)
      if (error.status !== 401) {
        messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage,
          life: 5000
        });
      }

      return throwError(() => error);
    })
  );
};