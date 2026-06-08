import Dexie, { type Table } from "dexie";
import type { Video } from "../types/video";

export interface HistoryItem {
  id: string; // video.id
  video: Video;
  viewedAt: number;
}

export interface WatchLaterItem {
  id: string; // video.id
  video: Video;
  addedAt: number;
}

export interface DownloadItem {
  id: string; // video.id
  video: Video;
  downloadedAt: number;
  data?: Blob;
}

export interface SubscriptionItem {
  id: string; // channel id
  name: string;
  thumbnail: string;
  subscribedAt: number;
}

export interface SettingItem {
  key: string;
  value: any;
}

export class NyanTubeDB extends Dexie {
  history!: Table<HistoryItem>;
  watchlist!: Table<WatchLaterItem>;
  downloads!: Table<DownloadItem>;
  subscriptions!: Table<SubscriptionItem>;
  settings!: Table<SettingItem>;

  constructor() {
    super("NyanTubeDB");
    this.version(3).stores({
      history: "id, viewedAt",
      watchlist: "id, addedAt",
      downloads: "id, downloadedAt",
      subscriptions: "id, subscribedAt",
      settings: "key",
    });
  }
}

export const db = new NyanTubeDB();

// Helper functions
export async function addToHistory(video: Video) {
  await db.history.put({
    id: video.id,
    video,
    viewedAt: Date.now(),
  });
}

export async function addToWatchlist(video: Video) {
  await db.watchlist.put({
    id: video.id,
    video,
    addedAt: Date.now(),
  });
}

export async function removeFromWatchlist(id: string) {
  await db.watchlist.delete(id);
}

export async function addToDownloads(video: Video) {
  // First save metadata to show progress/status
  await db.downloads.put({
    id: video.id,
    video,
    downloadedAt: Date.now(),
  });

  try {
    const response = await fetch(`/api/stream/${video.id}`);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    await db.downloads.update(video.id, { data: blob });
  } catch (e) {
    console.error("Download error:", e);
    // Maybe show error in UI later
  }
}

export async function removeFromDownloads(id: string) {
  await db.downloads.delete(id);
}

export async function subscribeToChannel(channel: { id: string; name: string; thumbnail: string }) {
  await db.subscriptions.put({
    ...channel,
    subscribedAt: Date.now(),
  });
}

export async function unsubscribeFromChannel(id: string) {
  await db.subscriptions.delete(id);
}

export async function getSetting(key: string, defaultValue: any) {
  const setting = await db.settings.get(key);
  return setting ? setting.value : defaultValue;
}

export async function setSetting(key: string, value: any) {
  await db.settings.put({ key, value });
}
