/**
 * Global API configuration.
 * In development, VITE_API_BASE_URL is empty ('') and requests are proxied via Vite.
 * In production, if a separate backend URL is provided via .env, it will prefix all API calls.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
