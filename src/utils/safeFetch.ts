/**
 * Safe Fetch & API Client Utility
 * Handles automatic JWT injection, base URL resolution (for Web and Native Capacitor platforms),
 * 401 interception, timeout abortion, JSON parsing resilience, and unified error responses.
 */

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
 * Returns the effective API base URL.
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_APP_URL;
  if (envUrl && typeof window !== 'undefined' && window.location.origin.includes('localhost') && (window as any).Capacitor?.isNativePlatform?.()) {
    return envUrl.replace(/\/+$/, '');
  }
  return '';
}

/**
 * Resolves a relative API path to a full endpoint URL.
 */
export function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
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
      const contentType = response.headers.get('content-type');
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

      const errorMsg = isTimeout
        ? `Request timeout after ${timeoutMs}ms`
        : (err.message || 'Network connection failed');

      return {
        ok: false,
        status: isTimeout ? 408 : 0,
        data: null,
        error: errorMsg
      };
    }
  }

  return {
    ok: false,
    status: 0,
    data: null,
    error: 'Maximum retry attempts exceeded'
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
