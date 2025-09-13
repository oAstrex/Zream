import fetch from "node-fetch";
import { config } from "./config";

export interface JackettResult {
  Title: string;
  Link: string;
  MagnetUri?: string;
  Seeders?: number;
  Peers?: number;
  Size?: number;
  Tracker?: string;
  CategoryDesc?: string[];
  [k: string]: any;
}

interface JackettResponse {
  Results?: JackettResult[];
  [k: string]: any;
}

export async function jackettSearch(query: string): Promise<JackettResult[]> {
  const url =
    `${config.jackett.host}/api/v2.0/indexers/all/results` +
    `?apikey=${config.jackett.apiKey}&Query=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jackett ${res.status} ${text}`);
  }

  // Cast JSON to our response interface
  const data = (await res.json()) as JackettResponse;

  if (!data || !Array.isArray(data.Results)) {
    return [];
  }
  return data.Results;
}

/* Quality scoring heuristic */
function scoreQuality(title: string): number {
  let score = 0;
  if (/2160p|4k/i.test(title)) score += 60;
  else if (/1080p/i.test(title)) score += 35;
  else if (/720p/i.test(title)) score += 15;

  if (/remux/i.test(title)) score += 18;
  if (/bluray|b[dr]rip/i.test(title)) score += 10;
  if (/\b(h265|x265|hevc)\b/i.test(title)) score += 6;
  if (/\b(x264|h264|avc)\b/i.test(title)) score += 3;

  // Penalty for cam / ts / telesync etc.
  if (/\b(cam|telesync|ts|hdcam)\b/i.test(title)) score -= 40;

  return score;
}

/**
 * Rank results by (seeders * weight) + quality + minor size preference.
 * You can tune the weights easily.
 */
export function rankResults(list: JackettResult[]) {
  return list
    .filter(r => r.MagnetUri) // only keep entries with magnets
    .map(r => {
      const seeders = r.Seeders ?? 0;
      const quality = scoreQuality(r.Title || "");
      const sizeGB = r.Size ? r.Size / 1024 / 1024 / 1024 : 0;
      // Slight preference for > 0.7GB if it's a movie (avoid tiny fakes)
      const sizeScore = sizeGB > 0.7 ? Math.min(sizeGB, 8) : -10;
      const score = seeders * 2 + quality + sizeScore;
      return { ...r, _score: score };
    })
    .sort((a, b) => b._score - a._score);
}

/* (Optional) helper if you want readable sizes somewhere */
export function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}
