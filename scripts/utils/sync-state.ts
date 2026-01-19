/**
 * Sync state manager for tracking last sync timestamps per source
 * Enables incremental updates to avoid reprocessing unchanged books
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SyncState {
  [source: string]: {
    lastSync: string; // ISO timestamp
    lastBookCount: number;
    lastBookIds?: string[]; // For change detection
  };
}

const SYNC_STATE_PATH = join(process.cwd(), 'src/data/.sync-state.json');

/**
 * Load sync state from file
 */
export function loadSyncState(): SyncState {
  if (!existsSync(SYNC_STATE_PATH)) {
    return {};
  }

  try {
    const content = readFileSync(SYNC_STATE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load sync state, starting fresh:', error);
    return {};
  }
}

/**
 * Save sync state to file
 */
export function saveSyncState(state: SyncState): void {
  try {
    writeFileSync(SYNC_STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save sync state:', error);
  }
}

/**
 * Get last sync timestamp for a source
 */
export function getLastSync(source: string): Date | null {
  const state = loadSyncState();
  const sourceState = state[source];
  
  if (!sourceState?.lastSync) {
    return null;
  }

  return new Date(sourceState.lastSync);
}

/**
 * Update sync state for a source
 */
export function updateSyncState(
  source: string,
  bookCount: number,
  bookIds?: string[]
): void {
  const state = loadSyncState();
  
  state[source] = {
    lastSync: new Date().toISOString(),
    lastBookCount: bookCount,
    lastBookIds: bookIds,
  };

  saveSyncState(state);
}

/**
 * Get last book count for a source
 */
export function getLastBookCount(source: string): number {
  const state = loadSyncState();
  return state[source]?.lastBookCount || 0;
}

/**
 * Check if source has new books based on count
 */
export function hasNewBooks(source: string, currentCount: number): boolean {
  const lastCount = getLastBookCount(source);
  return currentCount > lastCount;
}
