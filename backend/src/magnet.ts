export function extractInfoHash(magnet: string): string | null {
  // magnet:?xt=urn:btih:<40hex or 32base32>
  const match = magnet.match(/xt=urn:btih:([^&]+)/i);
  if (!match) return null;
  return match[1].toLowerCase();
}
