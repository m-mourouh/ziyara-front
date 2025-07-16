import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Imports - ALL REQUIRED
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { UserRegistrationDto } from '../../../models/user.model';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,           // ✅ For *ngIf, *ngFor
    ReactiveFormsModule,    // ✅ For [formGroup]
    RouterModule,           // ✅ For routerLink
    CardModule,             // ✅ For p-card
    ButtonModule,           // ✅ For p-button
    InputTextModule,        // ✅ For pInputText
    CalendarModule,         // ✅ For p-calendar
    DropdownModule,         // ✅ For p-dropdown
    PasswordModule,         // ✅ For p-password
    ToastModule             // ✅ For p-toast
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [MessageService]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  genderOptions = [
    { label: 'Homme', value: 'homme' },
    { label: 'Femme', value: 'femme' },
    { label: 'Autre', value: 'autre' }
  ];

  hotelVersionOptions = [
    { label: 'Version 1', value: 1 },
    { label: 'Version 2', value: 2 },
    { label: 'Version 3', value: 3 }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      birthdate: [''],
      gender: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      hVersion: [2, Validators.required],
      address: [''],
      country: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      const userData: UserRegistrationDto = {
        ...this.registerForm.value,
        birthdate: this.registerForm.value.birthdate ? 
          this.registerForm.value.birthdate.toISOString().split('T')[0] : ''
      };
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Inscription réussie'
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de l\'inscription'
          });
        }
      });
    }
  }
}