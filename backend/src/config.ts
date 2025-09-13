import 'dotenv/config';

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const config = {
  tmdb: {
    bearer: must("TMDB_BEARER"),
    baseV3: "https://api.themoviedb.org/3",
    baseV4: "https://api.themoviedb.org/4"
  },
  jackett: {
    host: process.env.JACKETT_HOST || "http://127.0.0.1:9117",
    apiKey: must("JACKETT_API_KEY")
  },
  torbox: {
    base: "https://api.torbox.app",
    token: process.env.TORBOX_API_TOKEN || ""
  },
  server: {
    port: parseInt(process.env.PORT || "4000", 10)
  }
};
