import axios from 'axios';

// Get or generate a persistent Device ID stored in localStorage & cookies
export function getDeviceId() {
  let deviceId = localStorage.getItem('dr_device_id');
  if (!deviceId) {
    // Generate UUID v4 format
    const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    deviceId = `dev_${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`;
    localStorage.setItem('dr_device_id', deviceId);
  }
  
  // Set cookie fallback (expires in 10 years)
  try {
    document.cookie = `dr_device_id=${deviceId}; path=/; max-age=315360000; SameSite=Lax`;
  } catch (e) {
    // Ignore cookie write errors if blocked by privacy settings
  }

  return deviceId;
}

// Gather device telemetry and browser metadata
export function getDeviceMetadata() {
  const userAgent = navigator.userAgent || '';
  let os = 'Unknown OS';

  if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/Macintosh|Mac OS X/i.test(userAgent)) os = 'macOS';
  else if (/Windows/i.test(userAgent)) os = 'Windows';
  else if (/Linux/i.test(userAgent)) os = 'Linux';

  return {
    os,
    screenWidth: window.screen ? window.screen.width : 0,
    screenHeight: window.screen ? window.screen.height : 0,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    userAgent: userAgent.substring(0, 150),
    language: navigator.language || 'en-US',
    timeZone: Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  };
}

// Automatically ping backend activity on app startup
export async function pingUserActivity() {
  try {
    const deviceId = getDeviceId();
    const deviceMeta = getDeviceMetadata();
    const res = await axios.post('/api/user/activity', {
      deviceId,
      deviceMeta
    });
    return res.data;
  } catch (err) {
    console.warn("Device activity ping warning:", err);
    return null;
  }
}
