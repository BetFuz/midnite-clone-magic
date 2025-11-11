interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Store in localStorage for persistence across sessions
  persist(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (e) {
        console.warn('Failed to persist cache:', e);
      }
    }
  }

  // Load from localStorage
  restore(key: string): boolean {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const entry = JSON.parse(stored) as CacheEntry<any>;
        const isExpired = Date.now() - entry.timestamp > entry.ttl;
        
        if (!isExpired) {
          this.cache.set(key, entry);
          return true;
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (e) {
      console.warn('Failed to restore cache:', e);
    }
    return false;
  }
}

export const dataCache = new DataCache();
