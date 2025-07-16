import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import {  Textarea } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { RatingService } from '../../services/rating.service';
import { AuthService } from '../../services/auth.service';
import { Hotel } from '../../models/hotel.model';
import { Rating, CreateRatingRequest } from '../../models/rating.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    RatingModule,
    TagModule,
    DialogModule,
    Textarea,
    ProgressSpinnerModule,
    SkeletonModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './hotels-details.component.html',
  styleUrls: ['./hotels-details.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class HotelDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  hotel: Hotel | null = null;
  ratings: Rating[] = [];
  currentUser: User | null = null;
  userRating: Rating | null = null;
  
  loading = true;
  ratingsLoading = false;
  submittingRating = false;
  
  showRatingDialog = false;
  showImageGallery = false;
  ratingForm: FormGroup;
  
  // Stats
  ratingStats = {
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0]
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private hotelService: HotelService,
    private ratingService: RatingService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.ratingForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const hotelId = +params['id'];
        if (hotelId) {
          this.loadHotelDetails(hotelId);
          this.loadHotelRatings(hotelId);
        }
      });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Add missing methods
  bookHotel() {
    this.messageService.add({
      severity: 'info',
      summary: 'Réservation',
      detail: 'Fonctionnalité de réservation à implémenter'
    });
  }

  shareHotel() {
    if (navigator.share && this.hotel) {
      navigator.share({
        title: this.hotel.name,
        text: this.hotel.description,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.messageService.add({
        severity: 'success',
        summary: 'Partagé',
        detail: 'Lien copié dans le presse-papier'
      });
    }
  }

  openImageGallery(index: number) {
    this.showImageGallery = true;
  }

  getAmenityIcon(amenity: string): string {
    const icons: { [key: string]: string } = {
      'wifi': 'pi-wifi',
      'piscine': 'pi-circle',
      'spa': 'pi-heart',
      'restaurant': 'pi-utensils',
      'parking': 'pi-car',
      'gym': 'pi-dumbbell',
      'bar': 'pi-glass'
    };
    return icons[amenity.toLowerCase()] || 'pi-check';
  }

  getRatingPercentage(stars: number): number {
    const total = this.ratingStats.total;
    return total > 0 ? (this.ratingStats.distribution[stars] / total) * 100 : 0;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  deleteRating() {
    if (this.userRating) {
      this.confirmationService.confirm({
        message: 'Êtes-vous sûr de vouloir supprimer votre évaluation ?',
        header: 'Confirmer la suppression',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          // Add delete logic here
          this.messageService.add({
            severity: 'success',
            summary: 'Supprimé',
            detail: 'Évaluation supprimée avec succès'
          });
        }
      });
    }
  }

  private loadHotelDetails(hotelId: number) {
    this.hotelService.getHotelById(hotelId).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hotel details:', error);
        this.loading = false;
        this.router.navigate(['/hotels']);
      }
    });
  }

  private loadHotelRatings(hotelId: number) {
    this.ratingsLoading = true;
    this.ratingService.getHotelRatings(hotelId).subscribe({
      next: (ratings) => {
        this.ratings = ratings.map(rating => ({
          ...rating,
          // ✅ Fix: Add user info for display
          userFirstname: rating.userFirstname || 'Utilisateur',
          userLastname: rating.userLastname || 'Anonyme'
        }));
        this.calculateRatingStats();
        this.checkUserRating();
        this.ratingsLoading = false;
      },
      error: (error) => {
        console.error('Error loading ratings:', error);
        this.ratingsLoading = false;
      }
    });
  }

  private calculateRatingStats() {
    if (this.ratings.length === 0) {
      this.ratingStats = {
        average: 0,
        total: 0,
        distribution: [0, 0, 0, 0, 0]
      };
      return;
    }

    const total = this.ratings.length;
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    const average = sum / total;
    
    const distribution = [0, 0, 0, 0, 0];
    this.ratings.forEach(rating => {
      distribution[rating.rating - 1]++;
    });

    this.ratingStats = {
      average: Math.round(average * 10) / 10,
      total,
      distribution
    };
  }

  private checkUserRating() {
    if (this.currentUser && this.ratings.length > 0) {
      this.userRating = this.ratings.find(
        rating => rating.userId === this.currentUser!.id
      ) || null;
    }
  }

  openRatingDialog() {
    if (!this.currentUser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Connexion requise',
        detail: 'Veuillez vous connecter pour noter cet hôtel'
      });
      return;
    }

    if (this.userRating) {
      this.ratingForm.patchValue({
        rating: this.userRating.rating,
        comment: this.userRating.comment
      });
    }

    this.showRatingDialog = true;
  }

  submitRating() {
    if (this.ratingForm.valid && this.hotel && this.currentUser) {
      this.submittingRating = true;
      
      const ratingData: CreateRatingRequest = {
        hotelId: this.hotel.id,
        rating: this.ratingForm.value.rating,
        comment: this.ratingForm.value.comment
      };

      this.ratingService.createRating(ratingData).subscribe({
        next: () => {
          this.submittingRating = false;
          this.showRatingDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Évaluation ajoutée avec succès'
          });
          this.loadHotelRatings(this.hotel!.id);
        },
        error: (error) => {
          console.error('Error submitting rating:', error);
          this.submittingRating = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de l\'enregistrement de votre évaluation'
          });
        }
      });
    }
  }

  getPriceCategory(price: number): string {
    if (price < 500) return 'Budget';
    if (price < 1500) return 'Moyen';
    return 'Luxe';
  }

  getPriceCategoryColor(price: number): string {
    if (price < 500) return 'success';
    if (price < 1500) return 'info';
    return 'warning';
  }

  goBack() {
    this.router.navigate(['/hotels']);
  }
}