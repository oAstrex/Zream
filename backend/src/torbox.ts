import fetch from "node-fetch";
import FormData from "form-data";
import { config } from "./config";

function authHeaders() {
  if (!config.torbox.token) throw new Error("No TORBOX_API_TOKEN set");
  return { Authorization: `Bearer ${config.torbox.token}` };
}

export async function torboxStartDevice(appName = "StreamHub") {
  const url = `${config.torbox.base}/v1/api/user/auth/device/start?app=${encodeURIComponent(appName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TorBox device start ${res.status}`);
  return res.json();
}
export async function torboxPollDevice(device_code: string) {
  const url = `${config.torbox.base}/v1/api/user/auth/device/token`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_code })
  });
  if (!res.ok) throw new Error(`TorBox device token ${res.status}`);
  return res.json();
}
export async function torboxRefresh(session_token: string) {
  const url = `${config.torbox.base}/v1/api/user/refreshtoken`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ session_token })
  });
  if (!res.ok) throw new Error(`TorBox refresh ${res.status}`);
  return res.json();
}

export async function torboxCheckCached(hash: string) {
  const url = `${config.torbox.base}/v1/api/torrents/checkcached?hash=${hash}&format=object&list_files=false`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`TorBox checkcached ${res.status}`);
  return res.json();
}

/**
 * Bulk check cached hashes.
 * Returns a map: { <lowercaseHash>: boolean }
 *
 * TorBox checkcached can accept repeated hash params:
 *   /checkcached?hash=HASH1&hash=HASH2&format=object
 *
 * The response structure isn't fully documented here; we try to interpret
 * common patterns:
 * - Object keyed by hash
 * - Or { results: { <hash>: {...} } }
 * We treat truthy .cached / .is_cached / .cache / .found as "cached".
 */
export async function torboxCheckCachedBulk(hashes: string[]): Promise<Record<string, boolean>> {
  if (!config.torbox.token) return {};
  const uniq = [...new Set(hashes.filter(Boolean).map(h => h.toLowerCase()))];
  if (uniq.length === 0) return {};

  const url = new URL(`${config.torbox.base}/v1/api/torrents/checkcached`);
  for (const h of uniq) url.searchParams.append("hash", h);
  url.searchParams.set("format", "object");
  url.searchParams.set("list_files", "false");

  let data: any = null;
  try {
    const res = await fetch(url.toString(), { headers: authHeaders() });
    const text = await res.text();
    if (!res.ok) {
      console.warn("[TorBox Bulk] HTTP", res.status, text.slice(0,200));
      return {};
    }
    try { data = JSON.parse(text); } catch {
      console.warn("[TorBox Bulk] Non-JSON response");
      return {};
    }
  } catch (e:any) {
    console.warn("[TorBox Bulk] fetch error:", e.message);
    return {};
  }

  const out: Record<string, boolean> = {};

  function interpretEntry(hash: string, obj: any) {
    if (!obj) return false;
    return !!(
      obj.cached ||
      obj.is_cached ||
      obj.isCached ||
      obj.cache ||
      obj.found ||
      obj.status === "cached" ||
      obj.available === true
    );
  }

  if (data && typeof data === "object") {
    // Try direct hash keys
    for (const k of Object.keys(data)) {
      if (/^[a-f0-9]{32,40}$/.test(k)) {
        out[k.toLowerCase()] = interpretEntry(k, data[k]);
      }
    }
    // Try results container
    if (data.results && typeof data.results === "object") {
      for (const k of Object.keys(data.results)) {
        if (/^[a-f0-9]{32,40}$/.test(k)) {
          out[k.toLowerCase()] = interpretEntry(k, data.results[k]);
        }
      }
    }
    // Sometimes an array with { hash, cached }
    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        const h = item?.hash;
        if (typeof h === "string") {
          out[h.toLowerCase()] = interpretEntry(h, item);
        }
      }
    }
  }

  return out;
}

export async function torboxCreateTorrent(magnet: string, name?: string, addOnlyIfCached = false) {
  const fd = new FormData();
  fd.append("magnet", magnet);
  fd.append("allow_zip", "true");
  if (name) fd.append("name", name);
  if (addOnlyIfCached) fd.append("add_only_if_cached", "true");
  const res = await fetch(`${config.torbox.base}/v1/api/torrents/createtorrent`, {
    method: "POST",
    headers: authHeaders() as any,
    body: fd as any
  });
  if (!res.ok) throw new Error(`TorBox createtorrent ${res.status}`);
  return res.json();
}

export async function torboxMyList(offset = 0, limit = 1000) {
  const url = `${config.torbox.base}/v1/api/torrents/mylist?offset=${offset}&limit=${limit}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`TorBox mylist ${res.status}`);
  return res.json();
}

export async function torboxRequestDownload(token: string, torrentId: number, fileId?: number) {
  const url = new URL(`${config.torbox.base}/v1/api/torrents/requestdl`);
  url.searchParams.set("token", token);
  url.searchParams.set("torrent_id", String(torrentId));
  url.searchParams.set("redirect", "false");
  url.searchParams.set("zip_link", "false");
  if (fileId != null) url.searchParams.set("file_id", String(fileId));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TorBox requestdl ${res.status}`);
  return res.json();
}
