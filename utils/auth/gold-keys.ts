/**
 * Golden Fractal Key (gold keys) validation for API calls
 * NSPFRNP catalog: protocols/GOLDEN_FRACTAL_KEY_API_CALLS.md
 *
 * Accepts keys via:
 * - X-Golden-Fractal-Key: <key>
 * - Authorization: Golden <key>
 */

import { NextRequest } from 'next/server';

const ENV_KEYS = 'GOLDEN_FRACTAL_API_KEYS';
const ENV_KEYS_ALT = 'NSPFRNP_GOLD_KEYS';

/** Comma-separated list of valid keys (no spaces); empty = none. */
function getConfiguredKeys(): string[] {
  const raw =
    (typeof process.env[ENV_KEYS] !== 'undefined' && process.env[ENV_KEYS] !== ''
      ? process.env[ENV_KEYS]
      : process.env[ENV_KEYS_ALT]) ?? '';
  if (!raw.trim()) return [];
  return raw.split(',').map((k) => k.trim()).filter(Boolean);
}

/**
 * Extract Golden Fractal Key from request (header X-Golden-Fractal-Key or Authorization: Golden <key>).
 * Returns the raw value sent by the client, or null if not present.
 */
export function getGoldenFractalKeyFromRequest(request: NextRequest): string | null {
  const headerKey = request.headers.get('x-golden-fractal-key');
  if (headerKey && headerKey.trim()) return headerKey.trim();

  const auth = request.headers.get('authorization');
  if (auth && auth.toLowerCase().startsWith('golden ')) {
    const key = auth.slice(7).trim();
    if (key) return key;
  }

  return null;
}

/**
 * Check if the request has a valid Golden Fractal Key (present and matching configured keys).
 * Use this to authorize API access (e.g. paywall bypass) per NSPFRNP catalog.
 */
export function hasValidGoldenFractalKey(request: NextRequest): boolean {
  const sent = getGoldenFractalKeyFromRequest(request);
  if (!sent) return false;

  const validKeys = getConfiguredKeys();
  if (validKeys.length === 0) return false;

  return validKeys.includes(sent);
}

/**
 * Returns the validated key if the request has a valid Golden Fractal Key; otherwise null.
 * Use when you need to record which key was used (e.g. in metadata), without exposing it.
 */
export function getValidGoldenFractalKey(request: NextRequest): string | null {
  const sent = getGoldenFractalKeyFromRequest(request);
  if (!sent) return null;

  const validKeys = getConfiguredKeys();
  if (validKeys.length === 0) return null;
  if (!validKeys.includes(sent)) return null;

  return sent;
}
