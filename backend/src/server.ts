import express from "express";
import cors from "cors";
import crypto from "crypto";

import { TMDB } from "./tmdb";
import { jackettSearch, rankResults } from "./jackett";
import { extractInfoHash } from "./magnet";
import { torboxCheckCachedBulk, torboxCheckCached, torboxCreateTorrent, torboxMyList } from "./torbox";
import { torrents, TorrentRecord } from "./state";
import { config } from "./config";

/* -------------------- Helpers -------------------- */

function getStr(qVal: unknown): string | undefined {
  if (typeof qVal === "string" && qVal.trim().length) return qVal;
  return undefined;
}

function getNum(qVal: unknown): number | undefined {
  if (typeof qVal === "string" && qVal.trim() !== "" && !isNaN(Number(qVal))) return Number(qVal);
  if (typeof qVal === "number") return qVal;
  return undefined;
}

interface TorrentListEntry {
  id?: number;
  hash?: string;
  status?: string;
  progress?: number;
  completed?: boolean;
  error?: any;
  [k: string]: any;
}

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------- Health -------------------- */
app.get("/api/health", (_req, res) => res.json({ ok: true, time: Date.now() }));

/* -------------------- TMDB Endpoints -------------------- */

app.get("/api/movies/popular", async (req, res, next) => {
  try {
    const page = getNum(req.query.page) || 1;
    res.json(await TMDB.popularMovies(page));
  } catch(e){ next(e); }
});

app.get("/api/movies/discover", async (req, res, next) => {
  try {
    const with_genres = getStr(req.query.with_genres);
    const sort_by = getStr(req.query.sort_by) || "release_date.desc";
    const page = getNum(req.query.page) || 1;
    const primary_release_year = getNum(req.query.primary_release_year);
    res.json(await TMDB.discoverMovies({
      with_genres,
      sort_by,
      page,
      primary_release_year
    }));
  } catch (e) { next(e); }
});

app.get("/api/tv/popular", async (req, res, next) => {
  try {
    const page = getNum(req.query.page) || 1;
    res.json(await TMDB.popularTV(page));
  } catch (e) { next(e); }
});

app.get("/api/tv/discover", async (req, res, next) => {
  try {
    const with_genres = getStr(req.query.with_genres);
    const sort_by = getStr(req.query.sort_by) || "first_air_date.desc";
    const page = getNum(req.query.page) || 1;
    const first_air_date_year = getNum(req.query.first_air_date_year);
    res.json(await TMDB.discoverTV({
      with_genres,
      sort_by,
      page,
      first_air_date_year
    }));
  } catch (e) { next(e); }
});

app.get("/api/tv/top-rated", async (req, res, next) => {
  try {
    const page = getNum(req.query.page) || 1;
    res.json(await TMDB.topRatedTV(page));
  } catch (e) { next(e); }
});

app.get("/api/tv/on-air", async (req, res, next) => {
  try {
    const page = getNum(req.query.page) || 1;
    res.json(await TMDB.onAirTV(page));
  } catch (e) { next(e); }
});


app.post("/api/sources/search", async (req, res) => {
  const { title, year, extra } = req.body || {};
  if (!title) return res.status(400).json({ error: "title required" });
  const query = [title, year, extra].filter(Boolean).join(" ");
  
  let raw: any;
  try {
    raw = await jackettSearch([title, year].filter(Boolean).join(" "));
  } catch (e:any) {
    return res.status(500).json({ error: e.message });
  }

  const ranked = rankResults(raw);
  // Limit to reduce load (adjust if desired)
  const slice = ranked.slice(0, 60);

  // Extract info hashes
  const magnetHashes: { index: number; hash: string }[] = [];
  slice.forEach((r, idx) => {
    if (r.MagnetUri) {
      const h = extractInfoHash(r.MagnetUri);
      if (h) magnetHashes.push({ index: idx, hash: h.toLowerCase() });
    }
  });

  let cacheMap: Record<string, boolean> = {};
  if (magnetHashes.length && config.torbox.token) {
    try {
      cacheMap = await torboxCheckCachedBulk(magnetHashes.map(m => m.hash));
    } catch (e:any) {
      console.warn("[TorBox bulk cache check] failed:", e.message);
    }
  }

  // Attach torboxCached property
  const annotated = slice.map(r => {
    let hash: string | null = null;
    if (r.MagnetUri) hash = extractInfoHash(r.MagnetUri);
    const cached = hash ? !!cacheMap[hash.toLowerCase()] : false;
    return { ...r, torboxCached: cached };
  });

  res.json({
    query: [title, year].filter(Boolean).join(" "),
    count: annotated.length,
    results: annotated
  });
});

/* Add torrent to TorBox (existing) */
app.post("/api/torbox/add", async (req,res)=>{
  const { magnet, name } = req.body;
  if (!magnet) return res.status(400).json({ error:"magnet required" });
  const localId = crypto.randomUUID();
  const hash = extractInfoHash(magnet);
  let cached: any = null;
  if (hash && config.torbox.token) {
    try { cached = await torboxCheckCached(hash); } catch {}
  }
  let createResp: any;
  try {
    createResp = await torboxCreateTorrent(magnet, name);
  } catch (e:any) {
    return res.status(500).json({ error:"torbox create failed", detail:e.message });
  }
  const rec: TorrentRecord = {
    localId,
    magnet,
    hash,
    torboxId: createResp?.id || createResp?.torrent_id,
    status: "initializing",
    created: Date.now()
  };
  torrents.set(localId, rec);
  res.json({ localId, cached, torbox:createResp });
});

/* Status & SSE endpoints unchanged from earlier (shortened for brevity) */
app.get("/api/torbox/status/:localId", async (req,res)=>{
  const rec = torrents.get(req.params.localId);
  if (!rec) return res.status(404).json({ error:"not found" });
  try {
    const list: any = await torboxMyList();
    const possibleArrays: any[] = [];
    if (Array.isArray(list)) possibleArrays.push(list);
    if (Array.isArray(list?.results)) possibleArrays.push(list.results);
    if (Array.isArray(list?.torrents)) possibleArrays.push(list.torrents);
    let arr: TorrentListEntry[] = [];
    if (possibleArrays.length) arr = ([] as TorrentListEntry[]).concat(...possibleArrays);
    const found = arr.find(t =>
      (rec.torboxId && t.id === rec.torboxId) ||
      (rec.hash && t.hash && t.hash.toLowerCase() === rec.hash.toLowerCase())
    );
    if (found) {
      rec.lastSnapshot = found;
      if (found.progress === 100 || found.completed || found.status === "completed")
        rec.status = "completed";
      else if (found.error) rec.status = "error";
      else rec.status = found.status || "downloading";
      if (!rec.torboxId && found.id) rec.torboxId = found.id;
    }
  } catch {}
  res.json(rec);
});

app.get("/api/torbox/stream/:localId", (req,res)=>{
  const rec = torrents.get(req.params.localId);
  if (!rec) return res.status(404).end();

  res.setHeader("Content-Type","text/event-stream");
  res.setHeader("Cache-Control","no-cache");
  res.setHeader("Connection","keep-alive");

  let active = true;
  req.on("close", ()=>{ active=false; });

  const poll = async () => {
    if (!active) return;
    try {
      const r = await fetch(`${req.protocol}://${req.get("host")}/api/torbox/status/${rec.localId}`);
      const js: any = await r.json();
      res.write(`event: update\n`);
      res.write(`data: ${JSON.stringify(js)}\n\n`);
      if (js.status === "completed" || js.status === "error") {
        res.write(`event: done\ndata: {}\n\n`);
        active = false;
        res.end();
        return;
      }
    } catch {}
    setTimeout(poll, 5000);
  };
  poll();
});

/* -------------------- Debug: list locally tracked torrents -------------------- */

app.get("/api/torbox/local", (_req, res) => {
 res.json(Array.from(torrents.values()));
});

/* Error handler */
app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
  console.error("Error:", err);
  res.status(500).json({ error: err?.message || "Internal Server Error" });
});

app.listen(config.server.port, ()=>{
  console.log(`Backend listening on ${config.server.port}`);
});
