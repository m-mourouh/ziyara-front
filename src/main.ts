import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { errorInterceptor } from './app/interceptors/error.interceptor';
import { loadingInterceptor } from './app/interceptors/loading.interceptor';
import { cacheInterceptor } from './app/interceptors/cache.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideHttpClient(
      withInterceptors([
        authInterceptor, // Add JWT token to requests
        errorInterceptor, // Handle HTTP errors globally
        loadingInterceptor, // Show/hide loading indicator
        cacheInterceptor, // Cache GET requests
      ])
    ),
    provideAnimations(),
    MessageService,
    ConfirmationService,
  ],
}).catch((err) => console.error(err));
