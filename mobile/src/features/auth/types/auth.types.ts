export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface ApiUserResponse {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: ApiUserResponse;
}

export interface RefreshTokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}


export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ApiMessageResponse {
  message: string;
}
