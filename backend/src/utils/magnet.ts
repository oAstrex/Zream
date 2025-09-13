export function extractInfoHash(magnet: string): string | null {
  const match = magnet.match(/xt=urn:btih:([^&]+)/i);
  if (!match) return null;
  return match[1].toLowerCase();
}
