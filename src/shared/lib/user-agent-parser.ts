/**
 * Enhanced User Agent parsing for analytics
 * Provides more accurate device, browser, and OS detection
 */

export interface ParsedUserAgent {
  device: string;
  browser: string; 
  browserVersion?: string;
  os: string;
  osVersion?: string;
}

/**
 * Parse user agent string with enhanced accuracy
 */
export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const ua = userAgent.toLowerCase();
  
  return {
    device: detectDevice(ua),
    browser: detectBrowser(ua).name,
    browserVersion: detectBrowser(ua).version,
    os: detectOS(ua).name,
    osVersion: detectOS(ua).version,
  };
}

/**
 * Detect device type with more accuracy
 */
function detectDevice(ua: string): string {
  // Tablet detection (check before mobile as tablets often contain "mobile")
  if (
    /ipad/.test(ua) ||
    (/android/.test(ua) && !/mobile/.test(ua)) ||
    /tablet/.test(ua) ||
    /kindle/.test(ua) ||
    /silk/.test(ua) ||
    /playbook/.test(ua) ||
    /bb10/.test(ua)
  ) {
    return "tablet";
  }
  
  // Mobile detection
  if (
    /mobile/.test(ua) ||
    /iphone/.test(ua) ||
    /ipod/.test(ua) ||
    /android.*mobile/.test(ua) ||
    /blackberry/.test(ua) ||
    /bb\d+/.test(ua) ||
    /opera mini/.test(ua) ||
    /opera mobi/.test(ua) ||
    /iemobile/.test(ua) ||
    /windows phone/.test(ua) ||
    /windows mobile/.test(ua) ||
    /symbian/.test(ua) ||
    /webos/.test(ua) ||
    /palm/.test(ua) ||
    /bada/.test(ua) ||
    /tizen/.test(ua) ||
    /kaios/.test(ua)
  ) {
    return "mobile";
  }

  // Smart TV detection
  if (
    /smart-tv/.test(ua) ||
    /tv/.test(ua) ||
    /roku/.test(ua) ||
    /chromecast/.test(ua) ||
    /appletv/.test(ua) ||
    /googletv/.test(ua) ||
    /hbbtv/.test(ua) ||
    /pov_tv/.test(ua) ||
    /netcast/.test(ua)
  ) {
    return "tv";
  }

  // Default to desktop
  return "desktop";
}

/**
 * Detect browser with version
 */
function detectBrowser(ua: string): { name: string; version?: string } {
  // Edge (check before Chrome as it contains "chrome")
  if (/edg\//.test(ua)) {
    const match = ua.match(/edg\/([0-9.]+)/);
    return { name: "edge", version: match?.[1] };
  }

  // Chrome (check before Safari as Chrome contains "safari")
  if (/chrome\//.test(ua) && !/edg\//.test(ua)) {
    const match = ua.match(/chrome\/([0-9.]+)/);
    return { name: "chrome", version: match?.[1] };
  }

  // Firefox
  if (/firefox\//.test(ua)) {
    const match = ua.match(/firefox\/([0-9.]+)/);
    return { name: "firefox", version: match?.[1] };
  }

  // Safari (check after Chrome)
  if (/safari\//.test(ua) && !/chrome/.test(ua) && !/edg\//.test(ua)) {
    const match = ua.match(/version\/([0-9.]+)/);
    return { name: "safari", version: match?.[1] };
  }

  // Opera
  if (/opr\//.test(ua) || /opera/.test(ua)) {
    const match = ua.match(/(?:opr|opera)\/([0-9.]+)/) || ua.match(/version\/([0-9.]+)/);
    return { name: "opera", version: match?.[1] };
  }

  // Internet Explorer
  if (/msie/.test(ua) || /trident/.test(ua)) {
    const match = ua.match(/(?:msie |rv:)([0-9.]+)/);
    return { name: "internet explorer", version: match?.[1] };
  }

  // Samsung Internet
  if (/samsungbrowser/.test(ua)) {
    const match = ua.match(/samsungbrowser\/([0-9.]+)/);
    return { name: "samsung internet", version: match?.[1] };
  }

  // UC Browser
  if (/ucbrowser/.test(ua)) {
    const match = ua.match(/ucbrowser\/([0-9.]+)/);
    return { name: "uc browser", version: match?.[1] };
  }

  // Brave (difficult to detect as it mimics Chrome)
  if (/brave/.test(ua)) {
    return { name: "brave" };
  }

  // Vivaldi
  if (/vivaldi/.test(ua)) {
    const match = ua.match(/vivaldi\/([0-9.]+)/);
    return { name: "vivaldi", version: match?.[1] };
  }

  return { name: "unknown" };
}

/**
 * Detect operating system with version
 */
function detectOS(ua: string): { name: string; version?: string } {
  // Windows
  if (/windows nt/.test(ua)) {
    const versionMap: Record<string, string> = {
      "10.0": "10",
      "6.3": "8.1",
      "6.2": "8", 
      "6.1": "7",
      "6.0": "Vista",
      "5.1": "XP",
    };
    const match = ua.match(/windows nt ([0-9.]+)/);
    const version = match ? versionMap[match[1]] || match[1] : undefined;
    return { name: "windows", version };
  }

  // macOS
  if (/mac os x/.test(ua)) {
    const match = ua.match(/mac os x ([0-9_]+)/);
    const version = match?.[1]?.replace(/_/g, ".");
    return { name: "macos", version };
  }

  // iOS
  if (/iphone os/.test(ua) || /ipad/.test(ua) || /ipod/.test(ua)) {
    const match = ua.match(/(?:iphone os|os) ([0-9_]+)/);
    const version = match?.[1]?.replace(/_/g, ".");
    return { name: "ios", version };
  }

  // Android
  if (/android/.test(ua)) {
    const match = ua.match(/android ([0-9.]+)/);
    return { name: "android", version: match?.[1] };
  }

  // Linux distributions
  if (/linux/.test(ua)) {
    if (/ubuntu/.test(ua)) return { name: "ubuntu" };
    if (/fedora/.test(ua)) return { name: "fedora" };
    if (/debian/.test(ua)) return { name: "debian" };
    if (/centos/.test(ua)) return { name: "centos" };
    if (/red hat/.test(ua)) return { name: "red hat" };
    return { name: "linux" };
  }

  // Chrome OS
  if (/cros/.test(ua)) {
    const match = ua.match(/cros [a-z0-9_]+ ([0-9.]+)/);
    return { name: "chrome os", version: match?.[1] };
  }

  // FreeBSD
  if (/freebsd/.test(ua)) {
    return { name: "freebsd" };
  }

  // Windows Phone
  if (/windows phone/.test(ua)) {
    const match = ua.match(/windows phone (?:os )?([0-9.]+)/);
    return { name: "windows phone", version: match?.[1] };
  }

  // BlackBerry
  if (/blackberry/.test(ua) || /bb10/.test(ua)) {
    return { name: "blackberry" };
  }

  // webOS
  if (/webos/.test(ua)) {
    return { name: "webos" };
  }

  // Tizen
  if (/tizen/.test(ua)) {
    return { name: "tizen" };
  }

  // KaiOS
  if (/kaios/.test(ua)) {
    return { name: "kaios" };
  }

  return { name: "unknown" };
}