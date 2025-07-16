import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RatingService } from '../../services/rating.service';
import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../services/auth.service';
import { Rating, UpdateRatingRequest } from '../../models/rating.model';
import { Hotel } from '../../models/hotel.model';
import { User } from '../../models/user.model';

interface RatingWithHotel extends Rating {
  hotel?: Hotel;
}

@Component({
  selector: 'app-my-ratings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    RatingModule,
    DialogModule,
    TextareaModule,
    ConfirmDialogModule,
    TagModule,
    SkeletonModule,
    PaginatorModule,
    TooltipModule,
    ProgressSpinnerModule
  ],
  templateUrl: './my-ratings.component.html',
  styleUrls: ['./my-ratings.component.scss']
})
export class MyRatingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // User data
  currentUser: User | null = null;
  userRatings: RatingWithHotel[] = [];
  
  // Loading states
  loading = true;
  loadingHotelDetails = false;
  updatingRating = false;
  deletingRating = false;
  
  // Statistics
  totalRatings = 0;
  averageRating = 0;
  favoriteLocation = '';
  highestRatedHotel = '';
  lowestRatedHotel = '';
  
  // Pagination
  currentPage = 0;
  itemsPerPage = 9;
  totalPages = 0;

  // Edit Rating Dialog
  showEditDialog = false;
  selectedRating: RatingWithHotel | null = null;
  editForm: FormGroup;

  // Filter and Sort
  sortOptions = [
    { label: 'Plus récent', value: 'date_desc' },
    { label: 'Plus ancien', value: 'date_asc' },
    { label: 'Note croissante', value: 'rating_asc' },
    { label: 'Note décroissante', value: 'rating_desc' },
    { label: 'Nom A-Z', value: 'name_asc' },
    { label: 'Nom Z-A', value: 'name_desc' }
  ];
  
  selectedSort = 'date_desc';

  constructor(
    private ratingService: RatingService,
    private hotelService: HotelService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    public router: Router
  ) {
    this.editForm = this.createEditForm();
  }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadUserRatings();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createEditForm(): FormGroup {
    return this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  loadUserRatings() {
    this.loading = true;
    this.ratingService.getUserRatings().subscribe({
      next: (ratings) => {
        this.userRatings = ratings;
        this.totalRatings = ratings.length;
        this.totalPages = Math.ceil(this.totalRatings / this.itemsPerPage);
        this.calculateStatistics();
        this.loadHotelDetailsForRatings();
      },
      error: (error) => {
        console.error('Error loading user ratings:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger vos évaluations'
        });
      }
    });
  }

  private loadHotelDetailsForRatings() {
    if (this.userRatings.length === 0) {
      this.loading = false;
      return;
    }

    this.loadingHotelDetails = true;
    let loadedCount = 0;

    this.userRatings.forEach((rating, index) => {
      this.hotelService.getHotelById(rating.hotelId).subscribe({
        next: (hotel) => {
          this.userRatings[index].hotel = hotel;
          this.userRatings[index].hotelName = hotel.name; // Ensure hotelName is set
          loadedCount++;
          
          if (loadedCount === this.userRatings.length) {
            this.loading = false;
            this.loadingHotelDetails = false;
            this.sortRatings();
          }
        },
        error: (error) => {
          console.error(`Error loading hotel ${rating.hotelId}:`, error);
          loadedCount++;
          
          if (loadedCount === this.userRatings.length) {
            this.loading = false;
            this.loadingHotelDetails = false;
            this.sortRatings();
          }
        }
      });
    });
  }

  private calculateStatistics() {
    if (this.userRatings.length === 0) {
      this.averageRating = 0;
      this.favoriteLocation = '';
      this.highestRatedHotel = '';
      this.lowestRatedHotel = '';
      return;
    }

    // Calculate average rating
    this.averageRating = this.userRatings.reduce((sum, r) => sum + r.rating, 0) / this.userRatings.length;

    // Find favorite location (assuming all hotels are in Marrakech for now)
    this.favoriteLocation = 'Marrakech';

    // Find highest and lowest rated hotels
    const sortedByRating = [...this.userRatings].sort((a, b) => b.rating - a.rating);
    this.highestRatedHotel = sortedByRating[0]?.hotelName || '';
    this.lowestRatedHotel = sortedByRating[sortedByRating.length - 1]?.hotelName || '';
  }

  getRatingText(rating: number): string {
    const texts: { [key: number]: string } = {
      1: 'Très décevant',
      2: 'Décevant', 
      3: 'Correct',
      4: 'Très bien',
      5: 'Excellent'
    };
    return texts[rating] || 'Non noté';
  }

  getRatingColor(rating: number): string {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'info';
    if (rating >= 2) return 'warning';
    return 'danger';
  }

  getStatColor(value: number, type: 'rating' | 'count'): string {
    if (type === 'rating') {
      if (value >= 4) return 'text-green-600';
      if (value >= 3) return 'text-blue-600';
      if (value >= 2) return 'text-orange-600';
      return 'text-red-600';
    } else {
      if (value >= 10) return 'text-green-600';
      if (value >= 5) return 'text-blue-600';
      return 'text-orange-600';
    }
  }

  sortRatings() {
    switch (this.selectedSort) {
      case 'date_desc':
        this.userRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'date_asc':
        this.userRatings.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating_desc':
        this.userRatings.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_asc':
        this.userRatings.sort((a, b) => a.rating - b.rating);
        break;
      case 'name_asc':
        this.userRatings.sort((a, b) => (a.hotelName || '').localeCompare(b.hotelName || ''));
        break;
      case 'name_desc':
        this.userRatings.sort((a, b) => (b.hotelName || '').localeCompare(a.hotelName || ''));
        break;
    }
  }

  onSortChange(event: any) {
    this.selectedSort = event.value;
    this.sortRatings();
  }

  getPaginatedRatings(): RatingWithHotel[] {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.userRatings.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
  }

  editRating(rating: RatingWithHotel) {
    this.selectedRating = rating;
    this.editForm.patchValue({
      rating: rating.rating,
      comment: rating.comment
    });
    this.showEditDialog = true;
  }

  updateRating() {
    if (this.editForm.valid && this.selectedRating) {
      this.updatingRating = true;
      
      const updateData: UpdateRatingRequest = {
        rating: this.editForm.value.rating,
        comment: this.editForm.value.comment.trim()
      };

      this.ratingService.updateRating(this.selectedRating.id, updateData).subscribe({
        next: (response) => {
          this.updatingRating = false;
          this.showEditDialog = false;
          
          // Update the rating in the local array
          if (this.selectedRating && response.data) {
            const index = this.userRatings.findIndex(r => r.id === this.selectedRating!.id);
            if (index !== -1) {
              this.userRatings[index] = { 
                ...this.userRatings[index], 
                ...response.data,
                hotel: this.userRatings[index].hotel // Preserve hotel data
              };
              this.calculateStatistics();
            }
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Évaluation mise à jour avec succès'
          });
        },
        error: (error) => {
          this.updatingRating = false;
          console.error('Error updating rating:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour l\'évaluation'
          });
        }
      });
    }
  }

  confirmDeleteRating(rating: RatingWithHotel) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer votre évaluation de "${rating.hotelName}" ?`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteRating(rating);
      }
    });
  }

  deleteRating(rating: RatingWithHotel) {
    this.deletingRating = true;
    
    this.ratingService.deleteRating(rating.id).subscribe({
      next: () => {
        this.deletingRating = false;
        
        // Remove the rating from the local array
        this.userRatings = this.userRatings.filter(r => r.id !== rating.id);
        this.totalRatings = this.userRatings.length;
        this.totalPages = Math.ceil(this.totalRatings / this.itemsPerPage);
        
        // Adjust current page if necessary
        if (this.currentPage >= this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages - 1;
        }
        
        this.calculateStatistics();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Évaluation supprimée avec succès'
        });
      },
      error: (error) => {
        this.deletingRating = false;
        console.error('Error deleting rating:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer l\'évaluation'
        });
      }
    });
  }

  navigateToHotel(hotelId: number) {
    this.router.navigate(['/hotel', hotelId]);
  }

  navigateToHotels() {
    this.router.navigate(['/hotels']);
  }

  refreshRatings() {
    this.loadUserRatings();
  }

  getHotelImage(rating: RatingWithHotel): string {
    return rating.hotel?.image || '/assets/images/hotel-placeholder.jpg';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} an(s)`;
  }
}