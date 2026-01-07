import fetch from 'node-fetch';

const geoCache = new Map();

export async function getIPGeolocation(ip) {
  if (geoCache.has(ip)) {
    return geoCache.get(ip);
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,lat,lon`, {
      timeout: 5000
    });

    if (!response.ok) {
      return getDefaultGeoData();
    }

    const data = await response.json();

    if (data.status === 'success') {
      const geoData = {
        country: data.country,
        countryCode: data.countryCode,
        latitude: data.lat,
        longitude: data.lon
      };

      geoCache.set(ip, geoData);

      if (geoCache.size > 10000) {
        const firstKey = geoCache.keys().next().value;
        geoCache.delete(firstKey);
      }

      return geoData;
    }
  } catch (error) {
    console.error(`Geolocation lookup failed for ${ip}:`, error.message);
  }

  return getDefaultGeoData();
}

function getDefaultGeoData() {
  return {
    country: 'Unknown',
    countryCode: 'XX',
    latitude: 0,
    longitude: 0
  };
}
