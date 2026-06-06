import { BetterFetchResponse } from 'better-auth/react';
import { AuthMutationError } from 'kitcn/react';

const SESSION_TOKEN_FALLBACK_KEY = 'kitcn.auth.session-token';
const SESSION_DATA_FALLBACK_KEY = 'kitcn.auth.session-data';
const getSessionStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};
// const readAuthSessionFallbackToken = () => {
//   const storage = getSessionStorage();
//   if (!storage) return null;
//   const token = storage.getItem(SESSION_TOKEN_FALLBACK_KEY);
//   return token && token.length > 0 ? token : null;
// };
const writeAuthSessionFallbackToken = (token: string | null) => {
  const storage = getSessionStorage();
  if (!storage) return;
  if (token && token.length > 0) {
    storage.setItem(SESSION_TOKEN_FALLBACK_KEY, token);
    return;
  }
  storage.removeItem(SESSION_TOKEN_FALLBACK_KEY);
};
// const readAuthSessionFallbackData = () => {
//   const storage = getSessionStorage();
//   if (!storage) return null;
//   const value = storage.getItem(SESSION_DATA_FALLBACK_KEY);
//   if (!value) return null;
//   try {
//     return JSON.parse(value);
//   } catch {
//     return null;
//   }
// };
const writeAuthSessionFallbackData = (data: object | null) => {
  const storage = getSessionStorage();
  if (!storage) return;
  if (data === null || data === void 0) {
    storage.removeItem(SESSION_DATA_FALLBACK_KEY);
    return;
  }
  storage.setItem(SESSION_DATA_FALLBACK_KEY, JSON.stringify(data));
};
export const clearAuthSessionFallback = () => {
  writeAuthSessionFallbackToken(null);
  writeAuthSessionFallbackData(null);
};

export const toAuthMutationError = (
  error: BetterFetchResponse<unknown>['error'] & { code?: string }
) =>
  new AuthMutationError({
    code: error.code,
    message: error.message,
    status: error.status ?? 500,
    statusText: error.statusText ?? 'AUTH_ERROR',
  });
