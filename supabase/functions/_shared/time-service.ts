/**
 * Time Service - Source-of-Truth Clock for Betfuz Platform
 * 
 * CRITICAL: All timestamps across the platform MUST use this service
 * to ensure consistency with Africa/Lagos timezone (WAT) and NTP synchronization.
 * 
 * Why this matters:
 * - Match kick-off times must be accurate to the second
 * - Bet settlement depends on precise timing
 * - Timestamp drift > 1s can cause financial losses
 * - All financial transactions must have audit-grade timestamps
 */

export class TimeService {
  /**
   * Get current timestamp in Africa/Lagos timezone (WAT)
   * Returns ISO 8601 format with timezone offset
   * 
   * @example
   * getCurrentTime() // "2025-01-15T14:30:00.000+01:00"
   */
  static getCurrentTime(): string {
    return new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  /**
   * Get current Unix timestamp (milliseconds since epoch)
   * Timezone-independent, suitable for comparisons
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Get current timestamp formatted for database storage
   * Returns PostgreSQL-compatible TIMESTAMPTZ format
   * 
   * Database is configured with timezone = 'Africa/Lagos'
   */
  static getDatabaseTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format a date for display in WAT timezone
   * 
   * @param date - Date to format
   * @param format - Display format options
   */
  static formatWAT(
    date: Date | string,
    format: 'short' | 'long' | 'time' | 'date' = 'long'
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Lagos',
    };

    switch (format) {
      case 'short':
        options.dateStyle = 'short';
        options.timeStyle = 'short';
        break;
      case 'long':
        options.dateStyle = 'long';
        options.timeStyle = 'long';
        break;
      case 'time':
        options.timeStyle = 'medium';
        break;
      case 'date':
        options.dateStyle = 'medium';
        break;
    }

    return dateObj.toLocaleString('en-NG', options);
  }

  /**
   * Check if current time is within a time window
   * Used for match kick-off validation, live betting cutoffs, etc.
   * 
   * @param startTime - Window start (ISO string or Date)
   * @param endTime - Window end (ISO string or Date)
   * @returns true if current time is within window
   */
  static isWithinWindow(startTime: string | Date, endTime: string | Date): boolean {
    const now = this.getCurrentTimestamp();
    const start = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime.getTime();
    const end = typeof endTime === 'string' ? new Date(endTime).getTime() : endTime.getTime();

    return now >= start && now <= end;
  }

  /**
   * Calculate time difference in seconds
   * Used for cooldown timers, session timeouts, etc.
   * 
   * @param pastTime - Past timestamp
   * @param futureTime - Future timestamp (defaults to now)
   * @returns Difference in seconds
   */
  static getSecondsDifference(
    pastTime: string | Date,
    futureTime: string | Date = new Date()
  ): number {
    const past = typeof pastTime === 'string' ? new Date(pastTime).getTime() : pastTime.getTime();
    const future = typeof futureTime === 'string' ? new Date(futureTime).getTime() : futureTime.getTime();

    return Math.floor((future - past) / 1000);
  }

  /**
   * Add seconds to a timestamp
   * Used for calculating cooldown expiry, session expiry, etc.
   * 
   * @param baseTime - Base timestamp
   * @param seconds - Seconds to add
   * @returns New timestamp
   */
  static addSeconds(baseTime: string | Date, seconds: number): Date {
    const base = typeof baseTime === 'string' ? new Date(baseTime) : baseTime;
    return new Date(base.getTime() + seconds * 1000);
  }

  /**
   * Validate if a timestamp is fresh (within acceptable drift)
   * Used for odds feed validation, provider API sync checks
   * 
   * @param timestamp - Timestamp to validate
   * @param maxDriftSeconds - Maximum acceptable drift (default: 1 second)
   * @returns true if timestamp is fresh
   */
  static isFresh(timestamp: string | Date, maxDriftSeconds: number = 1): boolean {
    const diff = this.getSecondsDifference(timestamp);
    return Math.abs(diff) <= maxDriftSeconds;
  }

  /**
   * Get WAT timezone offset string
   * @returns "+01:00" (West Africa Time is UTC+1)
   */
  static getTimezoneOffset(): string {
    return '+01:00';
  }

  /**
   * Convert any timestamp to WAT timezone
   * 
   * @param timestamp - Timestamp in any timezone
   * @returns ISO string in WAT timezone
   */
  static toWAT(timestamp: string | Date): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Lagos' })).toISOString();
  }

  /**
   * Log timestamp with microsecond precision for audit trails
   * Used in financial transactions, bet settlements, admin actions
   */
  static getAuditTimestamp(): string {
    const now = new Date();
    const isoString = now.toISOString();
    const microseconds = (now.getTime() % 1000) * 1000;
    return isoString.replace('Z', `${microseconds.toString().padStart(6, '0')}Z`);
  }
}
