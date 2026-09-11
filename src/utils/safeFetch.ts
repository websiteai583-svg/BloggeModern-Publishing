import { Capacitor } from '@capacitor/core';

// Public Production API Endpoint (Defaults to empty; must be configured via VITE_API_URL or runtime override)
export const DEFAULT_PRODUCTION_API_URL = '';

/**
 * Detects whether the code is executing inside a native Capacitor mobile runtime.
 */
export function isNativeMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    Capacitor.isNativePlatform() ||
    Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:' ||
    (window.location.hostname === 'localhost' && window.location.port === '' && window.location.protocol === 'https:')
  );
}

/**
 * Detects whether device has an active network connection.
 */
export function isDeviceOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Returns stored custom API URL override if configured by the user/tester.
 */
export function getStoredApiUrl(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const custom = localStorage.getItem('blogge_api_url');
    if (custom && typeof custom === 'string' && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    console.warn('[API Config] Error reading stored API URL:', e);
  }
  return null;
}

/**
 * Sets or clears a custom API URL override (stored in localStorage).
 */
export function setCustomApiUrl(url: string | null): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem('blogge_api_url');
    } else {
      localStorage.setItem('blogge_api_url', url.trim().replace(/\/+$/, ''));
    }
  } catch (e) {
    console.warn('[API Config] Error setting custom API URL:', e);
  }
}

/**
 * Validates a potential API URL against production security and correctness rules:
 * 1. Must be non-empty.
 * 2. In production / native mobile, must start with https://.
 * 3. In production / native mobile, must reject localhost and 127.0.0.1.
 * 4. Must reject unresolved placeholder domains (e.g. api.blogge.io, example.com, your-api.com).
 * 5. Must reject AI Studio preview gateway URLs (ais-pre-*, ais-dev-*, *.run.app with ais-).
 * 6. Explicit development localhost only permitted in development mode when not native mobile.
 */
export function validateApiUrl(url: string | null | undefined): { valid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { valid: false, error: 'Production API has not been configured. Please configure VITE_API_URL.' };
  }
  const cleanUrl = url.trim().toLowerCase();
  
  // Rejection of AI Studio preview gateway domains
  if (
    cleanUrl.includes('ais-pre-') || 
    cleanUrl.includes('ais-dev-') || 
    cleanUrl.includes(['ais', 'pre'].join('-')) ||
    cleanUrl.includes(['ais', 'dev'].join('-'))
  ) {
    return { valid: false, error: 'Production API configuration is invalid. AI Studio preview URLs cannot be used as native mobile production APIs.' };
  }

  // Rejection of unresolved placeholder domains
  if (
    cleanUrl.includes('api.blogge.io') || 
    cleanUrl.includes('example.com') || 
    cleanUrl.includes('your-domain') || 
    cleanUrl.includes('placeholder')
  ) {
    return { valid: false, error: 'Production API configuration is invalid. Unresolved placeholder domain cannot be used.' };
  }

  const isProd = Boolean(
    (import.meta as any).env?.PROD || 
    (import.meta as any).env?.MODE === 'production' || 
    isNativeMobile()
  );

  if (isProd) {
    if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
      return { valid: false, error: 'Production API configuration is invalid. Localhost is not supported in production mobile builds.' };
    }
    if (!cleanUrl.startsWith('https://')) {
      return { valid: false, error: 'Production API configuration is invalid. Production backend must use HTTPS.' };
    }
  } else {
    // Development mode
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return { valid: false, error: 'API URL must start with http:// or https://.' };
    }
  }

  return { valid: true };
}

/**
 * Returns the effective API base URL across Web and Native Capacitor platforms.
 * Priority:
 * 1. Stored custom API URL override (localStorage 'blogge_api_url')
 * 2. VITE_API_URL environment variable
 * 3. VITE_API_BASE_URL environment variable
 * 4. VITE_APP_URL environment variable
 * 5. Web fallback: '' (relative paths for same-origin server deployment)
 * 6. Native Capacitor fallback: DEFAULT_PRODUCTION_API_URL (if configured & valid)
 */
export function getApiBaseUrl(): string {
  // 1. Check user/tester custom override
  const storedUrl = getStoredApiUrl();
  if (storedUrl) {
    const val = validateApiUrl(storedUrl);
    if (val.valid) return storedUrl;
  }

  // 2. Check build-time environment variables in order of priority
  const env = (import.meta as any).env || {};
  const envApiUrl = env.VITE_API_URL || env.VITE_API_BASE_URL || env.VITE_APP_URL;
  if (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.trim()) {
    const trimmed = envApiUrl.trim().replace(/\/+$/, '');
    const val = validateApiUrl(trimmed);
    if (val.valid) return trimmed;
  }

  // 3. For Web execution, default to relative paths so same-origin requests work seamlessly
  if (!isNativeMobile()) {
    return '';
  }

  // 4. Native Capacitor fallback
  if (DEFAULT_PRODUCTION_API_URL && validateApiUrl(DEFAULT_PRODUCTION_API_URL).valid) {
    return DEFAULT_PRODUCTION_API_URL;
  }

  return '';
}

/**
 * Resolves any relative API or media path to a full endpoint URL.
 */
export function resolveApiUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('data:') || 
    path.startsWith('blob:')
  ) {
    return path;
  }
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalizedPath}` : normalizedPath;
}

export interface ApiConnectivityResult {
  ok: boolean;
  status: number;
  latencyMs: number;
  url: string;
  online: boolean;
  isInvalidApi?: boolean;
  error?: string;
  service?: string;
  version?: string;
}

/**
 * Verifies live server connectivity by pinging /api/health.
 * Validates that endpoint returns valid JSON rather than 302 redirect or HTML.
 */
export async function checkApiConnectivity(timeoutMs: number = 6000): Promise<ApiConnectivityResult> {
  const online = isDeviceOnline();

  // In native mobile, if no API URL has been configured at build time or runtime
  if (isNativeMobile() && !getApiBaseUrl()) {
    return {
      ok: false,
      status: 0,
      latencyMs: 0,
      url: '',
      online,
      isInvalidApi: true,
      error: 'Production API has not been configured. Please configure VITE_API_URL.'
    };
  }

  const endpoint = resolveApiUrl('/api/health');

  // Hard rejection: never allow old AI Studio preview domain
  const isBlockedGateway = endpoint.includes(['ais', 'pre'].join('-')) || endpoint.includes(['ais', 'dev'].join('-'));
  if (isBlockedGateway) {
    return {
      ok: false,
      status: 302,
      latencyMs: 0,
      url: endpoint,
      online,
      isInvalidApi: true,
      error: 'Production API configuration is invalid.'
    };
  }

  if (!online) {
    return {
      ok: false,
      status: 0,
      latencyMs: 0,
      url: endpoint,
      online: false,
      error: 'Device is offline. Please check your network connection.'
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');
    const isRedirect = response.status === 302 || response.redirected || response.type === 'opaqueredirect';

    // Critical Requirement: If API returns 302 or text/html instead of JSON from /api/health
    if (isRedirect || response.status === 302 || isHtml) {
      return {
        ok: false,
        status: response.status || 302,
        latencyMs,
        url: endpoint,
        online: true,
        isInvalidApi: true,
        error: 'Production API configuration is invalid.'
      };
    }

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      return {
        ok: false,
        status: response.status,
        latencyMs,
        url: endpoint,
        online: true,
        isInvalidApi: true,
        error: 'Production API configuration is invalid.'
      };
    }

    if (!response.ok || (data && data.success === false)) {
      return {
        ok: false,
        status: response.status,
        latencyMs,
        url: endpoint,
        online: true,
        isInvalidApi: false,
        error: data?.error || `HTTP ${response.status}: Server returned error`
      };
    }

    return {
      ok: true,
      status: response.status,
      latencyMs,
      url: endpoint,
      online: true,
      service: data?.service,
      version: data?.version,
      error: undefined
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const isTimeout = err?.name === 'AbortError';

    return {
      ok: false,
      status: isTimeout ? 408 : 0,
      latencyMs,
      url: endpoint,
      online: isDeviceOnline(),
      error: isTimeout 
        ? `Connection timed out after ${timeoutMs}ms` 
        : (err?.message || 'Cannot reach API server')
    };
  }
}

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * Core safe fetch function that never throws unhandled network exceptions and parses JSON safely.
 */
export async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult<T>> {
  const { 
    timeoutMs = 15000, 
    skipAuth = false, 
    retries = 0, 
    retryDelayMs = 1000,
    ...fetchOptions 
  } = options;

  // Immediate offline check
  if (!isDeviceOnline()) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Device is offline. Please check your internet connection.'
    };
  }

  // Immediate check for unconfigured API on native mobile
  if (isNativeMobile() && !getApiBaseUrl() && !url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Production API has not been configured. Please configure VITE_API_URL.'
    };
  }

  const fullUrl = resolveApiUrl(url);

  let attempt = 0;
  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers = new Headers(fetchOptions.headers || {});
      if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
        headers.set('Content-Type', 'application/json');
      }

      // Attach auth token if available
      if (!skipAuth && typeof localStorage !== 'undefined') {
        const authToken = localStorage.getItem('blogge_auth_token');
        if (authToken && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${authToken}`);
        }
      }

      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      const isRedirect = response.status === 302 || response.redirected || response.type === 'opaqueredirect';
      const isHtml = contentType.includes('text/html');

      // Critical Startup & Request Guard: If API returns 302 or HTML instead of JSON
      const isApiRoute = url.startsWith('/api/') || fullUrl.includes('/api/');
      if (isApiRoute && (isRedirect || response.status === 302 || isHtml)) {
        return {
          ok: false,
          status: response.status === 200 ? 302 : response.status,
          data: null,
          error: 'Production API configuration is invalid.'
        };
      }

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        try {
          data = await response.text();
        } catch {
          data = null;
        }
      }

      // Handle 401 Unauthorized globally
      if (response.status === 401 && !skipAuth) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('blogge:unauthorized', { detail: { url: fullUrl } }));
        }
      }

      if (!response.ok) {
        const errorMessage =
          (data && typeof data === 'object' && (data.error || data.message)) ||
          `Request failed with status ${response.status}`;

        return {
          ok: false,
          status: response.status,
          data: data as T,
          error: errorMessage
        };
      }

      return {
        ok: true,
        status: response.status,
        data: data as T
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';

      if (attempt < retries && !isTimeout) {
        attempt++;
        await new Promise((res) => setTimeout(res, retryDelayMs));
        continue;
      }

      const isRedirectError = 
        Boolean(err?.message?.toLowerCase().includes('redirect') || 
        err?.cause?.message?.toLowerCase().includes('redirect'));

      const errorMsg = isRedirectError
        ? 'Production API configuration is invalid.'
        : isTimeout
          ? `Request timed out after ${timeoutMs}ms. Please try again.`
          : 'Unable to connect to the server. Please check your internet connection.';

      return {
        ok: false,
        status: isRedirectError ? 302 : (isTimeout ? 408 : 0),
        data: null,
        error: errorMsg
      };
    }
  }

  return {
    ok: false,
    status: 0,
    data: null,
    error: 'Unable to connect to the server. Please check your internet connection.'
  };
}

/**
 * Convenience methods for HTTP verbs
 */
safeFetch.get = function<T = any>(url: string, options?: Omit<SafeFetchOptions, 'method' | 'body'>) {
  return safeFetch<T>(url, { ...options, method: 'GET' });
};

safeFetch.post = function<T = any>(url: string, body?: any, options?: Omit<SafeFetchOptions, 'method' | 'body'>) {
  return safeFetch<T>(url, {
    ...options,
    method: 'POST',
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  });
};

safeFetch.put = function<T = any>(url: string, body?: any, options?: Omit<SafeFetchOptions, 'method' | 'body'>) {
  return safeFetch<T>(url, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  });
};

safeFetch.patch = function<T = any>(url: string, body?: any, options?: Omit<SafeFetchOptions, 'method' | 'body'>) {
  return safeFetch<T>(url, {
    ...options,
    method: 'PATCH',
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  });
};

safeFetch.delete = function<T = any>(url: string, options?: Omit<SafeFetchOptions, 'method'>) {
  return safeFetch<T>(url, { ...options, method: 'DELETE' });
};

/**
 * High-level API fetcher that unwraps data or throws an explicit Error with the server response message.
 */
export async function apiFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<T> {
  const result = await safeFetch<T>(url, options);
  if (!result.ok) {
    throw new Error(result.error || `HTTP ${result.status}`);
  }
  return result.data as T;
}
