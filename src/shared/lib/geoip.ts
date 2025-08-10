/**
 * GeoIP service for getting location data from IP addresses
 * Uses multiple fallback services for reliability
 */

interface GeoIPResponse {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  continent?: string;
}

interface GeoIPResult {
  success: boolean;
  data?: GeoIPResponse;
  error?: string;
}

// Cache for IP lookups to avoid hitting rate limits
const geoCache = new Map<string, { data: GeoIPResponse; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

// Helper function for cross-runtime fetch with timeout
async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 5000): Promise<Response> {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal && typeof AbortSignal.timeout === 'function') {
    return fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
  }
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Simple LRU eviction to prevent memory leaks
function evictOldCacheEntries() {
  if (geoCache.size <= MAX_CACHE_SIZE) return;
  
  const now = Date.now();
  const entries = Array.from(geoCache.entries());
  
  // Remove expired entries first
  for (const [key, value] of entries) {
    if (now - value.timestamp > CACHE_DURATION) {
      geoCache.delete(key);
    }
  }
  
  // If still too large, remove oldest entries based on current state
  if (geoCache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(geoCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, geoCache.size - MAX_CACHE_SIZE);
    
    for (const [key] of sortedEntries) {
      geoCache.delete(key);
    }
  }
}

/**
 * Get geographic information for an IP address
 */
export async function getGeoInfo(ip: string): Promise<GeoIPResult> {
  // Skip local IPs
  if (isLocalIP(ip)) {
    return {
      success: true,
      data: {
        country: "Unknown",
        countryCode: "XX",
        region: "Unknown",
        city: "Unknown",
        continent: "Unknown",
      },
    };
  }

  // Check cache first
  const cached = geoCache.get(ip);
  if (cached) {
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      // Refresh LRU timestamp and insertion order on cache hit
      geoCache.delete(ip);
      geoCache.set(ip, { data: cached.data, timestamp: Date.now() });
      return { success: true, data: cached.data };
    } else {
      // Remove stale entry
      geoCache.delete(ip);
    }
  }

  // Try multiple services in order of preference
  const services = [
    () => getFromIPAPI(ip),
    () => getFromIPInfo(ip),
    () => getFromIPGeolocation(ip),
  ];

  for (const service of services) {
    try {
      const result = await service();
      if (result.success && result.data) {
        // Cache the result with memory management
        evictOldCacheEntries();
        geoCache.set(ip, {
          data: result.data,
          timestamp: Date.now(),
        });
        return result;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`GeoIP service failed:`, error);
      }
      continue;
    }
  }

  // All services failed, return error with fallback data
  const defaultData = {
    country: "Unknown",
    countryCode: "XX",
    region: "Unknown",
    city: "Unknown",
    continent: "Unknown",
  };

  return { 
    success: false, 
    data: defaultData,
    error: "All GeoIP providers failed" 
  };
}

/**
 * Check if IP is local/private
 */
function isLocalIP(ip: string): boolean {
  const localPatterns = [
    // IPv4 patterns
    /^127\./,           // 127.0.0.0/8 (localhost)
    /^192\.168\./,      // 192.168.0.0/16 (private)
    /^10\./,            // 10.0.0.0/8 (private)
    /^172\.(1[6-9]|2\d|3[01])\./,  // 172.16.0.0/12 (private)
    /^169\.254\./,      // 169.254.0.0/16 (IPv4 link-local)
    
    // IPv6 patterns
    /^::1$/,            // IPv6 localhost
    /^fe80:/i,          // IPv6 link-local
    /^fc[0-9a-f][0-9a-f]:/i,  // IPv6 Unique Local Addresses (fc00::/7)
    /^fd[0-9a-f][0-9a-f]:/i,  // IPv6 Unique Local Addresses (fd00::/8)
    /^::ffff:127\./i,   // IPv4-mapped localhost (::ffff:127.0.0.1)
  ];

  return localPatterns.some(pattern => pattern.test(ip)) || ip === "localhost";
}

/**
 * Get data from ipapi.co (1000 requests/day free)
 */
async function getFromIPAPI(ip: string): Promise<GeoIPResult> {
  try {
    const response = await fetchWithTimeout(`https://ipapi.co/${ip}/json/`, {
      headers: {
        // e.g. "Dup Analytics (+https://github.com/acme/dup)" or "Dup Analytics (ops@acme.com)"
        'User-Agent': process.env.GEOIP_USER_AGENT || 'Dup Analytics (dev)',
      },
    }, 5000);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.reason || 'API error');
    }

    return {
      success: true,
      data: {
        country: data.country_name || "Unknown",
        countryCode: data.country_code || "XX",
        region: data.region || "Unknown",
        city: data.city || "Unknown",
        continent: data.continent_code ? mapContinentCode(data.continent_code) : "Unknown",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get data from ipinfo.io (50,000 requests/month free)
 */
async function getFromIPInfo(ip: string): Promise<GeoIPResult> {
  try {
    const response = await fetchWithTimeout(`https://ipinfo.io/${ip}/json`, {}, 5000);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Use first component or full string for better accuracy
    const regionParts = (data.region || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const region = regionParts[0] || 'Unknown';

    return {
      success: true,
      data: {
        country: data.country ? getCountryName(data.country) : "Unknown",
        countryCode: data.country || "XX",
        region: region || data.region || "Unknown",
        city: data.city || "Unknown",
        continent: data.country ? getContinentFromCountryCode(data.country) : "Unknown",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fallback service - ip-geolocation.io (1000 requests/day free)
 */
async function getFromIPGeolocation(ip: string): Promise<GeoIPResult> {
  try {
    const apiKey = process.env.IPGEO_API_KEY;
    if (!apiKey) {
      // Skip this provider if not configured
      return { success: false, error: 'IPGEO_API_KEY not configured' };
    }
    const response = await fetchWithTimeout(`https://api.ip-geolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`, {}, 5000);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        country: data.country_name || "Unknown",
        countryCode: data.country_code2 || "XX",
        region: data.state_prov || "Unknown",
        city: data.city || "Unknown",
        continent: data.continent_name || "Unknown",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Map continent codes to full names
 */
function mapContinentCode(code: string): string {
  const continentMap: Record<string, string> = {
    'AF': 'Africa',
    'AN': 'Antarctica', 
    'AS': 'Asia',
    'EU': 'Europe',
    'NA': 'North America',
    'OC': 'Oceania',
    'SA': 'South America',
  };

  return continentMap[code] || "Unknown";
}

/**
 * Get country name from country code using Intl.DisplayNames
 */
function getCountryName(countryCode: string): string {
  try {
    const countryDisplay = new Intl.DisplayNames(['en'], { type: 'region' });
    return countryDisplay.of(countryCode.toUpperCase()) || countryCode;
  } catch {
    return countryCode;
  }
}

/**
 * Get continent from country code
 */
function getContinentFromCountryCode(countryCode: string): string {
  const continentMap: Record<string, string> = {
    // North America
    'US': 'North America', 'CA': 'North America', 'MX': 'North America',
    
    // Europe  
    'GB': 'Europe', 'DE': 'Europe', 'FR': 'Europe', 'IT': 'Europe',
    'ES': 'Europe', 'NL': 'Europe', 'SE': 'Europe', 'NO': 'Europe',
    'CH': 'Europe', 'AT': 'Europe', 'BE': 'Europe', 'DK': 'Europe',
    
    // Asia
    'JP': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'KR': 'Asia',
    'TH': 'Asia', 'SG': 'Asia', 'ID': 'Asia', 'MY': 'Asia',
    
    // South America
    'BR': 'South America', 'AR': 'South America', 'CL': 'South America',
    'CO': 'South America', 'PE': 'South America', 'VE': 'South America',
    
    // Africa
    'ZA': 'Africa', 'NG': 'Africa', 'EG': 'Africa', 'MA': 'Africa',
    'KE': 'Africa', 'GH': 'Africa', 'ET': 'Africa', 'TN': 'Africa',
    
    // Oceania
    'AU': 'Oceania', 'NZ': 'Oceania', 'FJ': 'Oceania', 'PG': 'Oceania',
  };

  return continentMap[countryCode.toUpperCase()] || "Unknown";
}