export interface ApiResponse<T> {
  data?: T;
  message: string;
  success: boolean;
  timestamp?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  status: number;
}
