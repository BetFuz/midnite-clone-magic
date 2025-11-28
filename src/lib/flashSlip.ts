import { crc32 } from 'crc';
import QRCode from 'qrcode';

export interface BetSelection {
  match_id: string;
  home_team: string;
  away_team: string;
  selection_type: string;
  selection_value: string;
  odds: number;
}

export interface FlashSlip {
  code: string;
  qr: string; // base64 data URL
  selections: BetSelection[];
}

/**
 * Compresses bet selections into a 6-character CRC32-based code
 * Format: CRC32(JSON.stringify(selections)).toString(36).substring(0, 6).toUpperCase()
 */
export function generateFlashSlip(selections: BetSelection[]): Promise<FlashSlip> {
  return new Promise(async (resolve, reject) => {
    try {
      // Serialize selections to deterministic JSON
      const serialized = JSON.stringify(selections, Object.keys(selections[0]).sort());
      
      // Generate CRC32 checksum
      const checksum = crc32(serialized);
      
      // Convert to base36 and take first 6 chars (uppercase for readability)
      const code = Math.abs(checksum).toString(36).substring(0, 6).toUpperCase();
      
      // Generate QR code as base64 data URL
      const qr = await QRCode.toDataURL(code, {
        errorCorrectionLevel: 'H',
        width: 256,
        margin: 2,
      });
      
      // Store mapping in IndexedDB for decoding
      await storeFlashSlipMapping(code, selections);
      
      resolve({ code, qr, selections });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Decodes a flash slip code back to bet selections
 */
export async function decodeFlashSlip(code: string): Promise<BetSelection[] | null> {
  try {
    const db = await openFlashSlipDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('flashSlips', 'readonly');
      const store = tx.objectStore('flashSlips');
      const request = store.get(code.toUpperCase());
      
      request.onsuccess = () => {
        resolve(request.result?.selections || null);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to decode flash slip:', error);
    return null;
  }
}

/**
 * Store flash slip mapping in IndexedDB
 */
async function storeFlashSlipMapping(code: string, selections: BetSelection[]): Promise<void> {
  const db = await openFlashSlipDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('flashSlips', 'readwrite');
    const store = tx.objectStore('flashSlips');
    
    const request = store.put({
      code: code.toUpperCase(),
      selections,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
    });
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Open IndexedDB for flash slip storage
 */
function openFlashSlipDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('betfuz-flashslips', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('flashSlips')) {
        const store = db.createObjectStore('flashSlips', { keyPath: 'code' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

/**
 * Clean up expired flash slips (runs on app init)
 */
export async function cleanupExpiredFlashSlips(): Promise<void> {
  try {
    const db = await openFlashSlipDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('flashSlips', 'readwrite');
      const store = tx.objectStore('flashSlips');
      const index = store.index('expiresAt');
      
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to cleanup expired flash slips:', error);
  }
}
