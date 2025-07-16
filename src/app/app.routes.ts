import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'hotels',
    loadComponent: () => import('./pages/hotels/hotels.component')
      .then(m => m.HotelsComponent)
  },
  {
    path: 'hotel/:id',
    loadComponent: () => import('./pages/hotels-details/hotels-details.component')
      .then(m => m.HotelDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component')
      .then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-ratings',
    loadComponent: () => import('./pages/my-ratings/my-ratings.component')
      .then(m => m.MyRatingsComponent),
    canActivate: [authGuard]
  },
  // Comment out missing routes temporarily
  // {
  //   path: 'recommendations',
  //   loadComponent: () => import('./pages/recommendations/recommendations.component')
  //     .then(m => m.RecommendationsComponent),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'admin',
  //   loadComponent: () => import('./pages/admin/admin.component')
  //     .then(m => m.AdminComponent),
  //   canActivate: [adminGuard]
  // },
  {
    path: '**',
    redirectTo: '/home'
  }
];