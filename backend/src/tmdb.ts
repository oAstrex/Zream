import fetch from "node-fetch";
import { config } from "./config";

const headers = {
  Authorization: `Bearer ${config.tmdb.bearer}`,
  "Content-Type": "application/json;charset=utf-8"
};

async function get(url: string) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB ${res.status} ${text}`);
  }
  return res.json();
}

export const TMDB = {
  popularMovies: (page = 1) => get(`${config.tmdb.baseV3}/movie/popular?page=${page}`),
  nowPlayingMovies: (page = 1) => get(`${config.tmdb.baseV3}/movie/now_playing?page=${page}`),
  upcomingMovies: (page = 1) => get(`${config.tmdb.baseV3}/movie/upcoming?page=${page}`),
  topRatedMovies: (page = 1) => get(`${config.tmdb.baseV3}/movie/top_rated?page=${page}`),
  discoverMovies: (params: Record<string, string | number | undefined>) => {
    const usp = new URLSearchParams();
    for (const [k,v] of Object.entries(params)) if (v !== undefined) usp.set(k, String(v));
    return get(`${config.tmdb.baseV3}/discover/movie?${usp.toString()}`);
  },
  movieDetails: (id: number) => get(`${config.tmdb.baseV3}/movie/${id}`),

  popularTV: (page = 1) => get(`${config.tmdb.baseV3}/tv/popular?page=${page}`),
  onAirTV: (page = 1) => get(`${config.tmdb.baseV3}/tv/on_the_air?page=${page}`),
  topRatedTV: (page = 1) => get(`${config.tmdb.baseV3}/tv/top_rated?page=${page}`),
  discoverTV: (params: Record<string, string | number | undefined>) => {
    const usp = new URLSearchParams();
    for (const [k,v] of Object.entries(params)) if (v !== undefined) usp.set(k, String(v));
    return get(`${config.tmdb.baseV3}/discover/tv?${usp.toString()}`);
  },
  tvDetails: (id: number) => get(`${config.tmdb.baseV3}/tv/${id}`),

  listDetailsV4: (listId: number, page = 1) =>
    get(`${config.tmdb.baseV4}/list/${listId}?page=${page}`)
};
