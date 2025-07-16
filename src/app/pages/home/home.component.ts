import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';

import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    SkeletonModule,
    TagModule,
    RatingModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredHotels: Hotel[] = [];
  loading = true;
  searchQuery = '';

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFeaturedHotels();
  }

  loadFeaturedHotels() {
    this.loading = true;
    // ✅ Fix: Use getFeaturedHotels method instead of getWeightedAverageHotels
    this.hotelService.getFeaturedHotels(6).subscribe({
      next: (hotels: Hotel[]) => {  // ✅ Fix: Add type annotation
        this.featuredHotels = hotels;
        this.loading = false;
      },
      error: (error: any) => {  // ✅ Fix: Add type annotation
        console.error('Error loading featured hotels:', error);
        this.featuredHotels = [];
        this.loading = false;
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/hotels'], { 
        queryParams: { search: this.searchQuery.trim() } 
      });
    }
  }

  navigateToHotels() {
    this.router.navigate(['/hotels']);
  }
}