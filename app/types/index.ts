export type Credentials = {
  token: string;
  refreshToken: string;
  expiresIn: number;
  lastRefreshed: string; // date obj as string for serialization
};


export type PersistedData = {
  credentials: Credentials;
  [key: string]: any;
};

// JSON type
// https://github.com/microsoft/TypeScript/issues/1897#issuecomment-580962081

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [prop: string]: Json };

export type JsonCompatible<T> = {
  [P in keyof T]: T[P] extends Json
    ? T[P]
    : Pick<T, P> extends Required<Pick<T, P>>
    ? never
    : T[P] extends (() => any) | undefined
    ? never
    : JsonCompatible<T[P]>;
};

