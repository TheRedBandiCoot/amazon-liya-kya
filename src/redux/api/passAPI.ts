import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  GetAllUserPassResponse,
  GetUserPassResponse,
  MsgResponse,
  NewPassRequestBody
} from '../../types/apiTypes';

export const passAPI = createApi({
  reducerPath: 'passApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/pass/`
  }),
  tagTypes: ['pass'],
  endpoints: builder => ({
    createPass: builder.mutation<MsgResponse, NewPassRequestBody>({
      query: ({ id, passBody }) => ({
        url: `new?id=${id}`,
        method: 'POST',
        body: passBody
      }),
      invalidatesTags: ['pass']
    }),
    getUserPass: builder.query<GetUserPassResponse, Date | string>({
      query: dob => {
        let base = `userPass`;
        if (dob) base += `?dob=${dob}`;
        return base;
      },
      providesTags: ['pass']
    }),
    getAllPass: builder.query<GetAllUserPassResponse, string>({
      query: id => `all?id=${id}`,
      providesTags: ['pass']
    })
  })
});

export const {
  useGetUserPassQuery,
  useGetAllPassQuery,
  useCreatePassMutation
} = passAPI;
