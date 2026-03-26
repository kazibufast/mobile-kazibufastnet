/**
 * Centralized API configuration for Kazibufast mobile app.
 *
 * The base URL is dynamic — stored in AsyncStorage and switchable
 * at runtime via the hidden developer menu in Profile (tap logo 10x).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_ENVIRONMENTS = {
  development: "https://sys.kazibufastnet.test",
  production: "https://sys.kazibufastnet.com",
} as const;

const STORAGE_KEY = "api_base_url";
const DEFAULT_URL = API_ENVIRONMENTS.production;

// In-memory cache so we don't hit AsyncStorage on every API call
let _baseUrl: string = DEFAULT_URL;

/** Load saved base URL from AsyncStorage into memory. Call once on app start. */
export async function initApiBaseUrl(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) _baseUrl = saved;
  } catch {}
}

/** Get the current base URL (synchronous, from memory). */
export function getApiBaseUrl(): string {
  return _baseUrl;
}

/** Switch the base URL and persist to AsyncStorage. */
export async function setApiBaseUrl(url: string): Promise<void> {
  _baseUrl = url;
  await AsyncStorage.setItem(STORAGE_KEY, url);
}

/** Get the label for the current environment. */
export function getCurrentEnvironment(): string {
  if (_baseUrl === API_ENVIRONMENTS.production) return "Production";
  if (_baseUrl === API_ENVIRONMENTS.development) return "Development";
  return "Custom";
}

/**
 * API endpoint builders — all read getApiBaseUrl() at call time,
 * so they always use the current environment.
 */
export const API = {
  // Client auth
  get verifyNumber() { return `${getApiBaseUrl()}/api/app/client/verify-number`; },
  get otp() { return `${getApiBaseUrl()}/api/app/client/otp`; },
  get setupPin() { return `${getApiBaseUrl()}/api/app/client/setup-pin`; },
  get login() { return `${getApiBaseUrl()}/api/app/client/login`; },

  // Client data
  get subscriptions() { return `${getApiBaseUrl()}/api/app/client/subscriptions`; },

  // Technician auth (OTP-based, 30-day token)
  get techVerifyNumber() { return `${getApiBaseUrl()}/api/app/tech/verify-number`; },
  get techOtp() { return `${getApiBaseUrl()}/api/app/tech/otp`; },

  // Technician endpoints
  tech: {
    home: () => `${getApiBaseUrl()}/api/app/tech/home`,
    tickets: () => `${getApiBaseUrl()}/api/app/tech/tickets`,
    team: () => `${getApiBaseUrl()}/api/app/tech/team`,
    timeIn: () => `${getApiBaseUrl()}/api/app/tech/time-in`,
    timeOut: () => `${getApiBaseUrl()}/api/app/tech/time-out`,
    viewTicket: (ticketId: string) =>
      `${getApiBaseUrl()}/api/app/tech/tickets/${ticketId}`,
    acceptTicket: (ticketId: string) =>
      `${getApiBaseUrl()}/api/app/tech/tickets/${ticketId}/accept`,
    inProgressTicket: (ticketId: string) =>
      `${getApiBaseUrl()}/api/app/tech/tickets/${ticketId}/in-progress`,
    completeTicket: (ticketId: string) =>
      `${getApiBaseUrl()}/api/app/tech/tickets/${ticketId}/complete`,
    rejectTicket: (ticketId: string) =>
      `${getApiBaseUrl()}/api/app/tech/tickets/${ticketId}/reject`,
    rescheduleTicket: (ticketId: string) =>
      `${getApiBaseUrl()}/api/app/tech/tickets/${ticketId}/reschedule`,
    updatePassword: () =>
      `${getApiBaseUrl()}/api/app/tech/profile/update-password`,
    naps: () => `${getApiBaseUrl()}/api/app/tech/naps`,
    storeNap: () => `${getApiBaseUrl()}/api/app/tech/naps`,
    napTags: (napId: number | string) =>
      `${getApiBaseUrl()}/api/app/tech/naps/${napId}/tags`,
    clientMap: (lat: string, lon: string) =>
      `${getApiBaseUrl()}/client/map/${lat}/${lon}`,
  },

  // Storage URLs
  storage: (path: string) => `${getApiBaseUrl()}/storage/${path}`,
};
