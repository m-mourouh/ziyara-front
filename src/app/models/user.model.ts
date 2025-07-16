export interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    birthdate: string;
    gender: string;
    hVersion: number;
    address?: string;
    country?: string;
    profileImg?: string;
    createdAt?: string;
  }
  
  export interface UserRegistrationDto {
    firstname: string;
    lastname: string;
    email: string;
    birthdate: string;
    gender: string;
    password: string;
    hVersion: number;
    address?: string;
    country?: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
    message: string;
  }
  
  export interface UserProfileDto {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    birthdate: string;
    gender: string;
    hVersion: number;
    address?: string;
    country?: string;
    profileImg?: string;
  }