import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';

import { AuthService } from '../../services/auth.service';
import { RatingService } from '../../services/rating.service';
import { User, UserProfileDto } from '../../models/user.model';
import { Rating } from '../../models/rating.model';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    AvatarModule,
    DividerModule,
    TabViewModule,
    FileUploadModule,
    ProgressBarModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  profileForm: FormGroup;
  updating = false;
  maxDate = new Date();

  // Statistics
  userStats = {
    totalRatings: 0,
    averageRating: 0,
    memberSince: ''
  };
  recentRatings: Rating[] = [];

  // Dropdown options
  genderOptions = [
    { label: 'Homme', value: 'homme' },
    { label: 'Femme', value: 'femme' },
    { label: 'Autre', value: 'autre' }
  ];

  versionOptions = [
    { label: 'Version 1', value: 1 },
    { label: 'Version 2', value: 2 },
    { label: 'Version 3', value: 3 }
  ];

  countryOptions = [
    { label: 'Maroc', value: 'Maroc' },
    { label: 'France', value: 'France' },
    { label: 'Espagne', value: 'Espagne' },
    { label: 'Allemagne', value: 'Allemagne' },
    { label: 'Royaume-Uni', value: 'Royaume-Uni' },
    { label: 'États-Unis', value: 'États-Unis' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ratingService: RatingService,
    private messageService: MessageService
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.populateForm(user);
          this.loadUserStats();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      birthdate: [''],
      gender: [''],
      address: [''],
      country: [''],
      hVersion: [2, Validators.required]
    });
  }

  private populateForm(user: User) {
    this.profileForm.patchValue({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      birthdate: user.birthdate ? new Date(user.birthdate) : null,
      gender: user.gender,
      address: user.address || '',
      country: user.country || '',
      hVersion: user.hVersion
    });
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.updating = true;
      
      const formValue = this.profileForm.value;
      const updateData: Partial<UserProfileDto> = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        birthdate: formValue.birthdate ? formValue.birthdate.toISOString().split('T')[0] : undefined,
        gender: formValue.gender,
        address: formValue.address,
        country: formValue.country,
        hVersion: formValue.hVersion
      };

      this.authService.updateProfile(updateData).subscribe({
        next: () => {
          this.updating = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Profil mis à jour avec succès'
          });
        },
        error: (error) => {
          this.updating = false;
          console.error('Error updating profile:', error);
        }
      });
    }
  }

  resetForm() {
    if (this.currentUser) {
      this.populateForm(this.currentUser);
    }
  }

  onImageSelect(event: any) {
    // Handle image upload logic here
    console.log('Image selected:', event);
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Fonctionnalité d\'upload d\'image à implémenter'
    });
  }

  getAvatarLabel(): string {
    if (this.currentUser) {
      return this.currentUser.firstname.charAt(0).toUpperCase() + 
             this.currentUser.lastname.charAt(0).toUpperCase();
    }
    return 'U';
  }

  private loadUserStats() {
    this.ratingService.getUserRatings().subscribe({
      next: (ratings) => {
        this.userStats.totalRatings = ratings.length;
        this.userStats.averageRating = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;
        
        if (this.currentUser?.createdAt) {
          this.userStats.memberSince = new Date(this.currentUser.createdAt).getFullYear().toString();
        }
        
        this.recentRatings = ratings.slice(0, 5); // Last 5 ratings
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });
  }
}
