
import { baseApi } from '@/core/api/baseApi';

import type {
  ApiMessageResponse,
  ApiUserResponse,
  AuthTokensResponse,
  AuthUser,
  LoginCredentials,
  RefreshTokensResponse,
  RegisterCredentials,
} from '@/features/auth/types/auth.types';

export function normalizeUser(user: ApiUserResponse): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isActive: user.is_active,
    isVerified: user.is_verified,
    createdAt: user.created_at,
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthTokensResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: 'auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    login: builder.mutation<AuthTokensResponse, LoginCredentials>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    refresh: builder.mutation<RefreshTokensResponse, string>({
      query: (refreshToken) => ({
        url: 'auth/refresh',
        method: 'POST',
        body: {
          refresh_token: refreshToken,
        },
      }),
    }),

    logout: builder.mutation<ApiMessageResponse, string>({
      query: (refreshToken) => ({
        url: 'auth/logout',
        method: 'POST',
        body: {
          refresh_token: refreshToken,
        },
      }),
    }),

    me: builder.query<AuthUser, void>({
      query: () => 'auth/me',
      transformResponse: (response: ApiUserResponse) =>
        normalizeUser(response),
      providesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useMeQuery,
} = authApi;
