import { Pass, User, passType } from './types';

export type GetUserPassResponse = {
  success: boolean;
};

export type GetAllUserPassResponse = {
  success: boolean;
  pass: passType[];
};

export type UserResponse = {
  success: boolean;
  user: User;
};

export type MsgResponse = {
  success: boolean;
  message: string;
};

export type NewPassRequestBody = {
  id: string;
  passBody: Pass;
};
