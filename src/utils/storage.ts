/**
 * Safe LocalStorage Utilities with runtime schema validation and corrupt-data fallback
 */

export function safeParseStorage<T>(
  key: string,
  fallback: T,
  validator?: (data: any) => boolean
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) {
      return fallback;
    }

    if (validator && !validator(parsed)) {
      console.warn(`[Storage] Corrupted data for key "${key}", using fallback.`);
      return fallback;
    }

    return parsed as T;
  } catch (err) {
    console.warn(`[Storage] Failed to parse localStorage key "${key}":`, err);
    return fallback;
  }
}

export function safeSetStorage<T>(key: string, value: T): boolean {
  try {
    if (value === undefined) {
      localStorage.removeItem(key);
      return true;
    }
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[Storage] Failed to save key "${key}" to localStorage:`, err);
    return false;
  }
}

export function clearCorruptedStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('blogge_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.error('[Storage] Failed to clear storage:', err);
  }
}
