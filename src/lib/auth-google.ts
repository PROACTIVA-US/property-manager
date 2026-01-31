/**
 * Google OAuth Configuration and Utilities
 * 
 * This module handles Google OAuth authentication flow.
 * In development, falls back to mock login if no client ID is configured.
 */

// OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const REDIRECT_URI = window.location.origin + '/auth/callback';

// Google OAuth endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Scopes we request from Google
const SCOPES = [
  'openid',
  'email',
  'profile',
].join(' ');

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
}

/**
 * Check if Google OAuth is configured
 */
export function isGoogleOAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID);
}

/**
 * Generate a random state parameter for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a code verifier for PKCE
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate code challenge from verifier (for PKCE)
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encode (used for PKCE)
 */
function base64UrlEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/**
 * Initiate Google OAuth flow
 * Redirects the user to Google's authorization page
 */
export async function initiateGoogleLogin(): Promise<void> {
  if (!isGoogleOAuthConfigured()) {
    throw new Error('Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.');
  }

  // Generate PKCE challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Generate state for CSRF protection
  const state = generateState();

  // Store verifier and state in sessionStorage for the callback
  sessionStorage.setItem('oauth_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  // Build the authorization URL
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  });

  // Redirect to Google
  window.location.href = GOOGLE_AUTH_URL + '?' + params.toString();
}

/**
 * Handle the OAuth callback
 * Exchanges the authorization code for tokens
 */
export async function handleOAuthCallback(code: string, state: string): Promise<GoogleUserInfo> {
  // Verify state to prevent CSRF attacks
  const storedState = sessionStorage.getItem('oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid OAuth state. Possible CSRF attack.');
  }

  // Get the code verifier
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
  if (!codeVerifier) {
    throw new Error('Missing code verifier. Please try logging in again.');
  }

  // Clean up sessionStorage
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_code_verifier');

  // Exchange code for tokens
  const userInfo = await simulateTokenExchange(code, codeVerifier);
  
  return userInfo;
}

/**
 * Simulate token exchange (for demo purposes)
 * In production, this would be handled by your backend
 */
async function simulateTokenExchange(_code: string, _verifier: string): Promise<GoogleUserInfo> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo, return simulated user info
  return {
    id: 'google-' + Math.random().toString(36).substr(2, 9),
    email: 'demo@example.com',
    verified_email: true,
    name: 'Demo User',
    given_name: 'Demo',
    family_name: 'User',
    picture: '',
  };
}

/**
 * Fetch user info from Google using access token
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google');
  }

  return response.json();
}

/**
 * Store OAuth tokens securely
 */
export function storeOAuthTokens(tokens: OAuthTokens): void {
  localStorage.setItem('oauth_tokens', JSON.stringify({
    ...tokens,
    stored_at: Date.now(),
  }));
}

/**
 * Get stored OAuth tokens
 */
export function getStoredOAuthTokens(): (OAuthTokens & { stored_at: number }) | null {
  const stored = localStorage.getItem('oauth_tokens');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear stored OAuth tokens
 */
export function clearOAuthTokens(): void {
  localStorage.removeItem('oauth_tokens');
}

/**
 * Check if stored tokens are expired
 */
export function areTokensExpired(): boolean {
  const tokens = getStoredOAuthTokens();
  if (!tokens) return true;
  
  const expiresAt = tokens.stored_at + (tokens.expires_in * 1000);
  return Date.now() >= expiresAt;
}
