import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Imports
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { RatingModule } from 'primeng/rating';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { Hotel, HotelSearchParams } from '../../models/hotel.model';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    RatingModule,
    MultiSelectModule,
    CardModule,
    TagModule,
    ChipModule,
    SkeletonModule,
    PaginatorModule,
    ToastModule,
    TooltipModule,
  ],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss'],
  providers: [MessageService],
})
export class HotelsComponent implements OnInit {
  searchForm: FormGroup;
  hotels: Hotel[] = [];
  loading = false;
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;
  searchControl = new FormControl('');

  // Pagination
  currentPage = 0;
  pageSize = 18;
  totalRecords = 0;

  // Filter options
  sortOptions = [
    { label: 'Prix croissant', value: 'price_asc' },
    { label: 'Prix décroissant', value: 'price_desc' },
    { label: 'Note', value: 'score_desc' },
    { label: 'Popularité', value: 'review_desc' },
  ];

  priceRanges = [
    { label: 'Budget (< 500 MAD)', value: 'budget' },
    { label: 'Moyen (500-1500 MAD)', value: 'medium' },
    { label: 'Luxe (> 1500 MAD)', value: 'luxury' },
  ];

  hotelVersionOptions = [
    { label: 'Version 1', value: 1 },
    { label: 'Version 2', value: 2 },
    { label: 'Version 3', value: 3 },
  ];

  amenityOptions = [
    { label: 'Wi-Fi', value: 'wifi' },
    { label: 'Piscine', value: 'piscine' },
    { label: 'Spa', value: 'spa' },
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Parking', value: 'parking' },
  ];

  cities = [
    { label: 'Toutes les villes', value: null },
    { label: 'Marrakech', value: 'Marrakech' },
    { label: 'Casablanca', value: 'Casablanca' },
    { label: 'Rabat', value: 'Rabat' }
  ];

  
  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private messageService: MessageService,
    public router: Router
  ) {
    this.searchForm = this.fb.group({
      searchQuery: [''],
      city: [null],
      sortBy: [''],
      priceRange: [''],
      hotelVersion: [''],
      minRating: [0],
      amenities: [[]],
      minPrice: [null],
      maxPrice: [null],
    });
  }
  filteredHotels: Hotel[] = [];
  ngOnInit() {
    this.loadHotels();

    this.searchForm.valueChanges.subscribe(() => {
      this.filterHotels();
    });
  }

  loadHotels() {
    this.loading = true;
    const formValue = this.searchForm.value;

    // Build search parameters
    const searchParams: HotelSearchParams = {
      page: this.currentPage,
      size: this.pageSize,
    };

    // Add search query if present
    if (formValue.searchQuery && formValue.searchQuery.trim()) {
      searchParams.search = formValue.searchQuery.trim();
    }

    // Add sort parameters
    if (formValue.sortBy) {
      const [sortField, direction] = formValue.sortBy.split('_');
      searchParams.sortBy = sortField;
      searchParams.sortDirection = direction as 'asc' | 'desc';
    }

    // Add price range filter
    if (formValue.priceRange) {
      switch (formValue.priceRange) {
        case 'budget':
          searchParams.maxPrice = 500;
          break;
        case 'medium':
          searchParams.minPrice = 500;
          searchParams.maxPrice = 1500;
          break;
        case 'luxury':
          searchParams.minPrice = 1500;
          break;
      }
    }

    // Add rating filter
    if (formValue.minRating > 0) {
      searchParams.minRating = formValue.minRating;
    }

    this.hotelService.getHotels(searchParams).subscribe({
      next: (response) => {
        this.hotels = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les hôtels',
        });
      },
    });
  }

  onSearch() {
    this.currentPage = 0;
    this.loadHotels();
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.loadHotels();
  }

  clearFilters() {
    this.searchForm.reset();
    this.currentPage = 0;
    this.loadHotels();
  }

  viewHotelDetails(hotel: Hotel) {
    this.router.navigate(['/hotel', hotel.id]);
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

  filterHotels() {
    const formValue = this.searchForm.value;
    this.filteredHotels = this.hotels.filter((hotel) => {
      const matchesSearch =
        !formValue.searchQuery ||
        hotel.name
          .toLowerCase()
          .includes(formValue.searchQuery.toLowerCase()) ||
        hotel.description
          .toLowerCase()
          .includes(formValue.searchQuery.toLowerCase());

      const matchesCity = !formValue.city || hotel.city === formValue.city;
      const matchesMinPrice =
        !formValue.minPrice || hotel.price >= formValue.minPrice;
      const matchesMaxPrice =
        !formValue.maxPrice || hotel.price <= formValue.maxPrice;

      return matchesSearch && matchesCity && matchesMinPrice && matchesMaxPrice;
    });
  }
}
