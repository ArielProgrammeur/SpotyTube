
import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

import type {
  BaseQueryApi,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { tokenStorage } from '@/core/storage/tokenStorage';
import { clearAuth } from '@/features/auth/slices/authSlice';

import type {
  RefreshTokensResponse,
} from '@/features/auth/types/auth.types';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:8000/api/v1';


const AUTH_ENDPOINTS_WITHOUT_REAUTH = new Set([
  'login',
  'register',
  'refresh',
  'logout',
]);

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,

  prepareHeaders: async (headers) => {
    const accessToken = await tokenStorage.getAccessToken();

    headers.set('Accept', 'application/json');

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

type BaseQueryExtraOptions = Parameters<typeof rawBaseQuery>[2];
type RefreshOutcome =
  | { kind: 'success' }
  | { kind: 'invalid'; error?: FetchBaseQueryError }
  | { kind: 'failed'; error: FetchBaseQueryError };

let refreshPromise: Promise<RefreshOutcome> | null = null;

function isAuthenticationFailure(
  status: FetchBaseQueryError['status'],
): boolean {
  return status === 401 || status === 403;
}

function createCustomError(message: string): FetchBaseQueryError {
  return {
    status: 'CUSTOM_ERROR',
    error: message,
  };
}

async function clearLocalSession(api: BaseQueryApi): Promise<void> {
  try {
    await tokenStorage.clearTokens();
  } finally {
    api.dispatch(clearAuth());
  }
}

async function performTokenRefresh(
  api: BaseQueryApi,
  extraOptions: BaseQueryExtraOptions,
): Promise<RefreshOutcome> {
  try {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!refreshToken) {
      await clearLocalSession(api);
      return { kind: 'invalid' };
    }

    const refreshResult = await rawBaseQuery(
      {
        url: 'auth/refresh',
        method: 'POST',
        body: {
          refresh_token: refreshToken,
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data !== undefined) {
      const tokens = refreshResult.data as RefreshTokensResponse;

      if (
        typeof tokens.access_token !== 'string' ||
        typeof tokens.refresh_token !== 'string'
      ) {
        return {
          kind: 'failed',
          error: createCustomError(
            'The refresh response contains invalid tokens.',
          ),
        };
      }

      await tokenStorage.saveTokens(
        tokens.access_token,
        tokens.refresh_token,
      );

      return { kind: 'success' };
    }

    if (refreshResult.error) {
      if (isAuthenticationFailure(refreshResult.error.status)) {
        await clearLocalSession(api);

        return {
          kind: 'invalid',
          error: refreshResult.error,
        };
      }

      return {
        kind: 'failed',
        error: refreshResult.error,
      };
    }

    return {
      kind: 'failed',
      error: createCustomError(
        'The refresh request returned no token data.',
      ),
    };
  } catch (error: unknown) {
    return {
      kind: 'failed',
      error: createCustomError(
        error instanceof Error
          ? error.message
          : 'Unable to refresh the authentication session.',
      ),
    };
  }
}


function refreshOnce(
  api: BaseQueryApi,
  extraOptions: BaseQueryExtraOptions,
): Promise<RefreshOutcome> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh(
      api,
      extraOptions,
    ).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

const baseQueryWithReauth: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status !== 401 ||
    AUTH_ENDPOINTS_WITHOUT_REAUTH.has(api.endpoint)
  ) {
    return result;
  }

  const refreshOutcome = await refreshOnce(api, extraOptions);

  if (refreshOutcome.kind === 'success') {
    result = await rawBaseQuery(args, api, extraOptions);
    return result;
  }

  if (refreshOutcome.error) {
    return { error: refreshOutcome.error };
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    'Auth',
    'Server',
    'Media',
    'Stream',
    'Transcoding',
  ],

  endpoints: () => ({}),
});
