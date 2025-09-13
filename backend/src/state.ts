export interface TorrentRecord {
  localId: string;
  magnet: string;
  hash: string | null;
  torboxId?: number;
  status: string;
  lastSnapshot?: any;
  created: number;
}
export const torrents = new Map<string, TorrentRecord>();
