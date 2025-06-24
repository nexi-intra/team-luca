import type { IFeatureStorage } from './types';
import { FeatureRing } from './types';
import { FEATURE_RING_STORAGE_KEY, parseFeatureRing } from './constants';

/**
 * Browser localStorage implementation of feature storage
 */
export class LocalStorageFeatureStorage implements IFeatureStorage {
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getRing(): FeatureRing | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const stored = window.localStorage.getItem(FEATURE_RING_STORAGE_KEY);
      return parseFeatureRing(stored);
    } catch {
      return null;
    }
  }

  setRing(ring: FeatureRing): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      window.localStorage.setItem(FEATURE_RING_STORAGE_KEY, ring.toString());
    } catch (error) {
      console.error('Failed to save feature ring:', error);
    }
  }

  clearRing(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      window.localStorage.removeItem(FEATURE_RING_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear feature ring:', error);
    }
  }
}

/**
 * In-memory storage implementation for testing or SSR
 */
export class MemoryFeatureStorage implements IFeatureStorage {
  private ring: FeatureRing | null = null;

  getRing(): FeatureRing | null {
    return this.ring;
  }

  setRing(ring: FeatureRing): void {
    this.ring = ring;
  }

  clearRing(): void {
    this.ring = null;
  }
}

/**
 * Create the appropriate storage implementation
 */
export function createFeatureStorage(): IFeatureStorage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return new LocalStorageFeatureStorage();
  }
  return new MemoryFeatureStorage();
}