export type HandleError = {
  message: string;
};

export type DecodedToken = {
  username: string;
  user_id: number;
  iat: number;
  exp: number;
};
