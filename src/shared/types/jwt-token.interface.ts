export interface JwtTokenPayload {
  userId: string;
  firmId: string;
  iat?: number;
  exp?: number;
}
