export type UserAndPassDataType = {
  name: string;
  dob: Date | string;
};

export type DataType = {
  name: string;
  dob: Date;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: 'admin' | 'user';
};

export type UserReducerInitialState = {
  user: User | null;
  loading: boolean;
};

export type CustomError = {
  status: number;
  data: {
    message: string;
    success: boolean;
  };
};
export type passType = {
  name: string;
  dob: Date;
};

export type Pass = {
  name: string;
  dob: Date | string;
};
