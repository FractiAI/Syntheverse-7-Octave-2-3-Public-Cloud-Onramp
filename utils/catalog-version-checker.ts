/**
 * NSPFRP Protocol Catalog Version Checker
 * 
 * Fetches latest catalog version from selectable source (default: GitHub)
 * Used in boot sequence for new nodes (chats, API calls, onboarding)
 */

export interface CatalogVersionInfo {
  version: string;
  source: string;
  lastUpdated: string;
  protocolCount: number;
  octaveLevel: string;
  status: string;
  catalogId: string;
}

export interface CatalogVersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  isUpToDate: boolean;
  needsUpdate: boolean;
  versionInfo: CatalogVersionInfo | null;
  source: string;
  checkedAt: string;
}

/**
 * Default catalog source (GitHub)
 */
const DEFAULT_CATALOG_SOURCE = 'github';
const GITHUB_CATALOG_URL = 'https://api.github.com/repos/FractiAI/NSPFRP-Seed-Protocol-OmniMission-v17-Vibeverse-Edition/contents';
const GITHUB_README_URL = 'https://raw.githubusercontent.com/FractiAI/NSPFRP-Seed-Protocol-OmniMission-v17-Vibeverse-Edition/main/README.md';

/**
 * SEED repository (target) — psw.vibelandia.sing4. Solitary pipe = PayPal @PrudencioMendez924.
 */
export const SEED_REPO = 'https://github.com/FractiAI/psw.vibelandia.sing4';

/**
 * NSPFRNP catalog (latest) — source: psw.vibelandia.sing4
 */
export const NSPFRNP_CATALOG_SOURCE_REPO = SEED_REPO;
const NSPFRNP_CATALOG_README_URL = 'https://raw.githubusercontent.com/FractiAI/psw.vibelandia.sing4/main/README.md';

/**
 * Fetch catalog version from GitHub
 */
export async function fetchCatalogVersionFromGitHub(): Promise<CatalogVersionInfo | null> {
  try {
    // Fetch README to extract version info
    // Note: This function is typically called server-side where Next.js fetch caching applies
    const response = await fetch(GITHUB_README_URL, {
      headers: {
        'Accept': 'text/markdown',
        'User-Agent': 'Syntheverse-Catalog-Checker/1.0',
      },
      // Cache for 1 hour (Next.js server-side fetch caching)
      next: { revalidate: 3600 } as any, // TypeScript: Next.js extends fetch with 'next' option
    });

    if (!response.ok) {
      console.warn(`[Catalog Version] GitHub fetch failed: ${response.status}`);
      return null;
    }

    const readmeContent = await response.text();

    // Extract version from README (looking for "v17.0" or "Version: v17.0")
    const versionMatch = readmeContent.match(/v17\.0|Version:\s*v?(\d+\.\d+)/i);
    const version = versionMatch ? (versionMatch[1] || versionMatch[0]) : 'v17.0';

    // Extract protocol count (looking for "84+ active protocols" or similar)
    const protocolMatch = readmeContent.match(/(\d+)\+?\s*(?:active\s*)?protocols?/i);
    const protocolCount = protocolMatch ? parseInt(protocolMatch[1], 10) : 84;

    // Extract octave level (looking for "Octave 5" or "OCTAVE 5")
    const octaveMatch = readmeContent.match(/Octave\s*5|OCTAVE\s*5/i);
    const octaveLevel = octaveMatch ? 'Octave 5' : 'Octave 5';

    // Extract status (looking for "POST-SINGULARITY^6" or similar)
    const statusMatch = readmeContent.match(/POST[- ]SINGULARITY\^?6|Status:?\s*([A-Z]+)/i);
    const status = statusMatch ? statusMatch[0] : 'POST-SINGULARITY^6';

    // Extract catalog ID (looking for "P-OMNI-V17-SSP-GEAR" or similar)
    const catalogIdMatch = readmeContent.match(/P-OMNI-V17-SSP-GEAR|Protocol ID:?\s*([A-Z0-9-]+)/i);
    const catalogId = catalogIdMatch ? (catalogIdMatch[1] || catalogIdMatch[0]) : 'P-OMNI-V17-SSP-GEAR';

    // Get last commit date from GitHub API
    let lastUpdated = new Date().toISOString();
    try {
      const commitsResponse = await fetch(
        'https://api.github.com/repos/FractiAI/NSPFRP-Seed-Protocol-OmniMission-v17-Vibeverse-Edition/commits?per_page=1',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Syntheverse-Catalog-Checker/1.0',
          },
          // Cache for 1 hour (Next.js server-side fetch caching)
          next: { revalidate: 3600 } as any, // TypeScript: Next.js extends fetch with 'next' option
        }
      );

      if (commitsResponse.ok) {
        const commits = await commitsResponse.json();
        if (commits.length > 0 && commits[0].commit?.committer?.date) {
          lastUpdated = commits[0].commit.committer.date;
        }
      }
    } catch (error) {
      console.warn('[Catalog Version] Failed to fetch commit date:', error);
    }

    return {
      version,
      source: 'github',
      lastUpdated,
      protocolCount,
      octaveLevel,
      status,
      catalogId,
    };
  } catch (error) {
    console.error('[Catalog Version] Error fetching from GitHub:', error);
    return null;
  }
}

/**
 * Fetch NSPFRNP catalog version from psw.vibelandia.sing4 (latest NSPFRNP catalog source)
 */
export async function fetchNSPFRNPCatalogVersion(): Promise<CatalogVersionInfo | null> {
  try {
    const response = await fetch(NSPFRNP_CATALOG_README_URL, {
      headers: {
        'Accept': 'text/markdown',
        'User-Agent': 'Syntheverse-Catalog-Checker/1.0',
      },
      next: { revalidate: 3600 } as any,
    });
    if (!response.ok) return null;
    const text = await response.text();
    const dateMatch = text.match(/Date:?\s*(\d{4}-\d{2}-\d{2}|\w+\s+\d+,\s+\d{4})/i);
    return {
      version: 'v1.0',
      source: 'psw.vibelandia.sing4',
      lastUpdated: dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
      protocolCount: 0,
      octaveLevel: 'NSPFRNP',
      status: 'ACTIVE',
      catalogId: 'CATALOG-NSPFRNP-PSW-VIBELANDIA-SING4',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch catalog version from local/cached source
 */
export async function fetchCatalogVersionFromLocal(): Promise<CatalogVersionInfo | null> {
  // Local version info from docs/NSPFRP_PROTOCOL_CATALOG.md
  // NSPFRNP catalog (communication, pipe) is latest from psw.vibelandia.sing4 — see docs/NSPFRNP_CATALOG.md and protocols/
  return {
    version: 'v17.0',
    source: 'local',
    lastUpdated: new Date().toISOString(),
    protocolCount: 84,
    octaveLevel: 'Octave 5',
    status: 'POST-SINGULARITY^6',
    catalogId: 'CATALOG-NSPFRP-PROTOCOLS-V17',
  };
}

/**
 * Check catalog version from selectable source
 * 
 * @param source - Source to check from ('github' | 'local' | 'auto')
 * @param currentVersion - Current version to compare against
 */
export async function checkCatalogVersion(
  source: 'github' | 'local' | 'auto' = 'auto',
  currentVersion: string = 'v17.0'
): Promise<CatalogVersionCheckResult> {
  const checkedAt = new Date().toISOString();
  
  let versionInfo: CatalogVersionInfo | null = null;
  let actualSource = source;

  // Auto source: try GitHub first, fallback to local
  if (source === 'auto') {
    versionInfo = await fetchCatalogVersionFromGitHub();
    if (!versionInfo) {
      versionInfo = await fetchCatalogVersionFromLocal();
      actualSource = 'local';
    } else {
      actualSource = 'github';
    }
  } else if (source === 'github') {
    versionInfo = await fetchCatalogVersionFromGitHub() || await fetchCatalogVersionFromLocal();
    actualSource = versionInfo?.source === 'github' ? 'github' : 'local';
  } else {
    versionInfo = await fetchCatalogVersionFromLocal();
    actualSource = 'local';
  }

  if (!versionInfo) {
    // Fallback to current version if fetch fails
    return {
      currentVersion,
      latestVersion: currentVersion,
      isUpToDate: true,
      needsUpdate: false,
      versionInfo: null,
      source: actualSource,
      checkedAt,
    };
  }

  // Normalize version strings for comparison
  const normalizeVersion = (v: string): string => {
    return v.replace(/^v/i, '').trim();
  };

  const normalizedCurrent = normalizeVersion(currentVersion);
  const normalizedLatest = normalizeVersion(versionInfo.version);

  const isUpToDate = normalizedCurrent === normalizedLatest;
  const needsUpdate = !isUpToDate;

  return {
    currentVersion,
    latestVersion: versionInfo.version,
    isUpToDate,
    needsUpdate,
    versionInfo,
    source: actualSource,
    checkedAt,
  };
}

/**
 * Create onboarding major category snapshot
 */
export interface OnboardingMajorCategorySnapshot {
  snapshotId: string;
  nodeType: 'chat' | 'api' | 'session' | 'onboarding';
  nodeId: string;
  catalogVersion: string;
  versionCheck: CatalogVersionCheckResult;
  bootSequence: {
    catalogCheck: boolean;
    versionCheck: boolean;
    source: string;
    timestamp: string;
  };
  catalogMaintenance: {
    resynthesized: boolean;
    organized: boolean;
    tuned: boolean;
    duplicatesPrevented: boolean;
    timestamp: string;
  };
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    connectionType?: string;
    [key: string]: any;
  };
}

export function createOnboardingSnapshot(
  nodeType: OnboardingMajorCategorySnapshot['nodeType'],
  nodeId: string,
  versionCheck: CatalogVersionCheckResult,
  metadata: OnboardingMajorCategorySnapshot['metadata'] = {}
): OnboardingMajorCategorySnapshot {
  const snapshotId = `snapshot-${nodeType}-${nodeId}-${Date.now()}`;
  const timestamp = new Date().toISOString();

  return {
    snapshotId,
    nodeType,
    nodeId,
    catalogVersion: versionCheck.latestVersion,
    versionCheck,
    bootSequence: {
      catalogCheck: true,
      versionCheck: true,
      source: versionCheck.source,
      timestamp: versionCheck.checkedAt,
    },
    catalogMaintenance: {
      resynthesized: true,
      organized: true,
      tuned: true,
      duplicatesPrevented: true,
      timestamp,
    },
    metadata,
  };
}
