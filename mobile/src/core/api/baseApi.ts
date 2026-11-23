import { tokenStorage } from './../storage/tokenStorage';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:8000/api/v1';

export const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,

    prepareHeaders: async (headers) => {
      const accessToken = await tokenStorage.getAccessToken();

      headers.set('Accept', 'application/json');

      if (accessToken) {
        headers.set(
          'Authorization',
          `Bearer ${accessToken}`,
        );
      }

      return headers;
    },
  }),

  tagTypes: [
    'Auth',
    'Server',
    'Media',
    'Stream',
    'Transcoding',
  ],

  endpoints: () => ({}),
});
