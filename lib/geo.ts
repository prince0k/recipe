/**
 * Geolocation & User-Agent parsing utilities
 * Used by the subscriber tracking system to capture full device/location intelligence.
 */

// ─── User-Agent Parsing ─────────────────────────────────────────────────────

interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: "Desktop" | "Mobile" | "Tablet";
}

/**
 * Lightweight regex-based User-Agent parser.
 * Extracts browser name, version, OS, and device type from the raw UA string.
 * No external dependencies.
 */
export function parseUserAgent(ua: string): ParsedUA {
  const result: ParsedUA = {
    browser: "Unknown",
    browserVersion: "",
    os: "Unknown",
    deviceType: "Desktop",
  };

  if (!ua) return result;

  // ─── Browser Detection ────────────────────────────────────
  // Order matters: check specific browsers before generic ones
  if (/Edg\//i.test(ua)) {
    result.browser = "Microsoft Edge";
    result.browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || "";
  } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    result.browser = "Opera";
    result.browserVersion = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || "";
  } else if (/Vivaldi/i.test(ua)) {
    result.browser = "Vivaldi";
    result.browserVersion = ua.match(/Vivaldi\/([\d.]+)/)?.[1] || "";
  } else if (/YaBrowser/i.test(ua)) {
    result.browser = "Yandex";
    result.browserVersion = ua.match(/YaBrowser\/([\d.]+)/)?.[1] || "";
  } else if (/SamsungBrowser/i.test(ua)) {
    result.browser = "Samsung Internet";
    result.browserVersion = ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] || "";
  } else if (/UCBrowser/i.test(ua)) {
    result.browser = "UC Browser";
    result.browserVersion = ua.match(/UCBrowser\/([\d.]+)/)?.[1] || "";
  } else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    result.browser = "Chrome";
    result.browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
  } else if (/Firefox\//i.test(ua)) {
    result.browser = "Firefox";
    result.browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    result.browser = "Safari";
    result.browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || "";
  } else if (/MSIE|Trident/i.test(ua)) {
    result.browser = "Internet Explorer";
    result.browserVersion = ua.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || "";
  }

  // ─── OS Detection ─────────────────────────────────────────
  if (/Windows NT 10/i.test(ua)) {
    result.os = "Windows 10/11";
  } else if (/Windows NT 6\.3/i.test(ua)) {
    result.os = "Windows 8.1";
  } else if (/Windows NT 6\.2/i.test(ua)) {
    result.os = "Windows 8";
  } else if (/Windows NT 6\.1/i.test(ua)) {
    result.os = "Windows 7";
  } else if (/Windows/i.test(ua)) {
    result.os = "Windows";
  } else if (/Mac OS X/i.test(ua)) {
    const version = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
    result.os = version ? `macOS ${version}` : "macOS";
  } else if (/Android ([\d.]+)/i.test(ua)) {
    const version = ua.match(/Android ([\d.]+)/)?.[1] || "";
    result.os = `Android ${version}`;
  } else if (/iPhone OS ([\d_]+)/i.test(ua)) {
    const version = ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
    result.os = `iOS ${version}`;
  } else if (/iPad/i.test(ua)) {
    result.os = "iPadOS";
  } else if (/CrOS/i.test(ua)) {
    result.os = "Chrome OS";
  } else if (/Linux/i.test(ua)) {
    result.os = "Linux";
  }

  // ─── Device Type Detection ────────────────────────────────
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    result.deviceType = "Tablet";
  } else if (/Mobile|iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    result.deviceType = "Mobile";
  } else {
    result.deviceType = "Desktop";
  }

  return result;
}

// ─── IP Geolocation ─────────────────────────────────────────────────────────

interface GeoData {
  country: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
  lat: number;
  lon: number;
}

/**
 * Resolve IP address to geographic location using ip-api.com (free tier).
 * Rate limit: 45 requests/minute (more than sufficient for subscription events).
 * Falls back gracefully on error or rate-limit.
 */
export async function geolocateIP(ip: string): Promise<GeoData> {
  const fallback: GeoData = {
    country: "Unknown",
    city: "Unknown",
    region: "Unknown",
    timezone: "Unknown",
    isp: "Unknown",
    lat: 0,
    lon: 0,
  };

  // Skip geolocation for localhost / private IPs
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { ...fallback, country: "Localhost", city: "Local" };
  }

  // If IP contains multiple (comma-separated from proxy chain), use the first (client) IP
  const cleanIP = ip.split(",")[0].trim();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`http://ip-api.com/json/${cleanIP}?fields=status,country,city,regionName,timezone,isp,lat,lon`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return fallback;

    const data = await res.json();

    if (data.status === "fail") return fallback;

    return {
      country: data.country || "Unknown",
      city: data.city || "Unknown",
      region: data.regionName || "Unknown",
      timezone: data.timezone || "Unknown",
      isp: data.isp || "Unknown",
      lat: data.lat || 0,
      lon: data.lon || 0,
    };
  } catch (error) {
    console.error("[geo] IP geolocation failed:", error);
    return fallback;
  }
}
