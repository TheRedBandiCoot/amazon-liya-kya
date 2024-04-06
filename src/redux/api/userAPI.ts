import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MsgResponse, UserResponse } from '../../types/apiTypes';
import axios from 'axios';
import { User } from '../../types/types';

export const userAPI = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/user/`
  }),
  endpoints: builder => ({
    createUser: builder.mutation<MsgResponse, User>({
      query: userData => ({
        url: 'new',
        method: 'POST',
        body: userData
      })
    })
  })
});

export const getUser = async (id: string) => {
  try {
    const { data }: { data: UserResponse } = await axios.get(
      `${import.meta.env.VITE_SERVER}/api/v1/user/${id}`
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const { useCreateUserMutation } = userAPI;
