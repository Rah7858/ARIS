export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Status = "ACTIVE" | "RESPONDING" | "RESOLVED" | "PENDING";

export interface Camera {
  id: string;
  name: string;
  city: string;
  location: string;
  lat: number;
  lng: number;
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  resolution: string;
  uptime: string;
  /** Public HLS (.m3u8) or MP4 stream URL used to render a real live tile. */
  streamUrl?: string;
}


export interface Accident {
  id: string;
  cameraId: string;
  camera: string;
  city: string;
  location: string;
  lat: number;
  lng: number;
  severity: Severity;
  status: Status;
  timestamp: string;
  confidence: number;
  vehicles: number;
  injuries: number;
  description: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  type: "POLICE" | "HOSPITAL" | "AMBULANCE" | "FIRE";
  city: string;
  phone: string;
  address: string;
  responseTime: string;
}

export interface AlertRecord {
  id: string;
  accidentId: string;
  contactName: string;
  type: string;
  city: string;
  sentAt: string;
  status: "SENT" | "FAILED" | "PENDING";
  method: "SMS" | "CALL" | "EMAIL";
}

export const cameras: Camera[] = [
  { id: "CAM-001", name: "Western Express Hwy", city: "Mumbai",    location: "Bandra Junction",     lat: 19.0596, lng: 72.8295, status: "ONLINE",      resolution: "4K",    uptime: "99.8%", streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
  { id: "CAM-002", name: "Ring Road North",     city: "Delhi",     location: "Connaught Place",     lat: 28.6315, lng: 77.2167, status: "ONLINE",      resolution: "4K",    uptime: "99.2%", streamUrl: "https://stream.mux.com/v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM.m3u8" },
  { id: "CAM-003", name: "Outer Ring Road",     city: "Bangalore", location: "Marathahalli Bridge", lat: 12.9591, lng: 77.6974, status: "ONLINE",      resolution: "1080p", uptime: "98.5%", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
  { id: "CAM-004", name: "OMR Corridor",        city: "Chennai",   location: "Sholinganallur",      lat: 12.9010, lng: 80.2279, status: "ONLINE",      resolution: "4K",    uptime: "97.1%", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  { id: "CAM-005", name: "Mumbai-Pune Expy",    city: "Pune",      location: "Lonavla Exit",        lat: 18.7546, lng: 73.4062, status: "MAINTENANCE", resolution: "4K",    uptime: "95.3%" },
];


// Lazy timestamp computation: Date.now() evaluated at READ time (browser
// render), not module init time.
function withTimestamp<T extends { _offsetMs: number }>(obj: T): T & { timestamp: string } {
  Object.defineProperty(obj, "timestamp", {
    enumerable: true,
    get() { return new Date(Date.now() - this._offsetMs).toISOString(); },
  });
  return obj as T & { timestamp: string };
}
function withSentAt<T extends { _offsetMs: number }>(obj: T): T & { sentAt: string } {
  Object.defineProperty(obj, "sentAt", {
    enumerable: true,
    get() { return new Date(Date.now() - this._offsetMs).toISOString(); },
  });
  return obj as T & { sentAt: string };
}
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// 15 accidents, distributed per spec (today=6 within 24h, then 7 days back).
// Severity tally: CRITICAL=4, HIGH=5, MEDIUM=4, LOW=2
// City tally:     Mumbai=4, Delhi=4, Bangalore=3, Chennai=2, Pune=2
// Active+Responding=9 (first 9), Resolved=6 (last 6)
const accidentSeed: Array<Omit<Accident, "timestamp"> & { _offsetMs: number }> = [
  { _offsetMs: 7 * MIN,             id: "ACC-0015", cameraId: "CAM-001", camera: "Western Express Hwy", city: "Mumbai",    location: "Bandra Junction",     lat: 19.0596, lng: 72.8295, severity: "CRITICAL", status: "ACTIVE",     confidence: 97.4, vehicles: 3, injuries: 4, description: "Multi-vehicle collision with overturned truck" },
  { _offsetMs: 31 * MIN,            id: "ACC-0014", cameraId: "CAM-002", camera: "Ring Road North",     city: "Delhi",     location: "Connaught Place",     lat: 28.6315, lng: 77.2167, severity: "HIGH",     status: "RESPONDING", confidence: 92.1, vehicles: 2, injuries: 2, description: "Head-on collision at intersection" },
  { _offsetMs: 1 * HOUR,            id: "ACC-0013", cameraId: "CAM-003", camera: "Outer Ring Road",     city: "Bangalore", location: "Marathahalli Bridge", lat: 12.9591, lng: 77.6974, severity: "MEDIUM",   status: "RESPONDING", confidence: 88.6, vehicles: 2, injuries: 1, description: "Rear-end collision, lane blocked" },
  { _offsetMs: 2 * HOUR,            id: "ACC-0012", cameraId: "CAM-004", camera: "OMR Corridor",        city: "Chennai",   location: "Sholinganallur",      lat: 12.9010, lng: 80.2279, severity: "HIGH",     status: "ACTIVE",     confidence: 94.0, vehicles: 2, injuries: 3, description: "Motorcycle and SUV collision" },
  { _offsetMs: 5 * HOUR,            id: "ACC-0011", cameraId: "CAM-001", camera: "Western Express Hwy", city: "Mumbai",    location: "Bandra Junction",     lat: 19.0596, lng: 72.8295, severity: "LOW",      status: "RESPONDING", confidence: 79.2, vehicles: 1, injuries: 0, description: "Single vehicle skid, no injuries" },
  { _offsetMs: 8 * HOUR,            id: "ACC-0010", cameraId: "CAM-002", camera: "Ring Road North",     city: "Delhi",     location: "Connaught Place",     lat: 28.6315, lng: 77.2167, severity: "CRITICAL", status: "ACTIVE",     confidence: 96.8, vehicles: 4, injuries: 6, description: "Pile-up during fog conditions" },
  { _offsetMs: 1 * DAY,             id: "ACC-0009", cameraId: "CAM-005", camera: "Mumbai-Pune Expy",    city: "Pune",      location: "Lonavla Exit",        lat: 18.7546, lng: 73.4062, severity: "MEDIUM",   status: "RESPONDING", confidence: 85.5, vehicles: 2, injuries: 1, description: "Side collision at exit ramp" },
  { _offsetMs: 1 * DAY + 2 * HOUR,  id: "ACC-0008", cameraId: "CAM-003", camera: "Outer Ring Road",     city: "Bangalore", location: "Marathahalli Bridge", lat: 12.9591, lng: 77.6974, severity: "HIGH",     status: "ACTIVE",     confidence: 91.3, vehicles: 3, injuries: 2, description: "Multi-car pileup" },
  { _offsetMs: 2 * DAY,             id: "ACC-0007", cameraId: "CAM-002", camera: "Ring Road North",     city: "Delhi",     location: "Connaught Place",     lat: 28.6315, lng: 77.2167, severity: "LOW",      status: "RESPONDING", confidence: 82.0, vehicles: 1, injuries: 0, description: "Vehicle breakdown obstructing lane" },
  { _offsetMs: 50 * HOUR,           id: "ACC-0006", cameraId: "CAM-001", camera: "Western Express Hwy", city: "Mumbai",    location: "Bandra Junction",     lat: 19.0596, lng: 72.8295, severity: "MEDIUM",   status: "RESOLVED",   confidence: 87.7, vehicles: 2, injuries: 1, description: "Lane change collision" },
  { _offsetMs: 72 * HOUR,           id: "ACC-0005", cameraId: "CAM-002", camera: "Ring Road North",     city: "Delhi",     location: "Connaught Place",     lat: 28.6315, lng: 77.2167, severity: "HIGH",     status: "RESOLVED",   confidence: 93.4, vehicles: 2, injuries: 3, description: "T-bone intersection collision" },
  { _offsetMs: 74 * HOUR,           id: "ACC-0004", cameraId: "CAM-005", camera: "Mumbai-Pune Expy",    city: "Pune",      location: "Lonavla Exit",        lat: 18.7546, lng: 73.4062, severity: "CRITICAL", status: "RESOLVED",   confidence: 98.1, vehicles: 5, injuries: 8, description: "Major pile-up, multiple casualties" },

  { _offsetMs: 4 * DAY,             id: "ACC-0003", cameraId: "CAM-003", camera: "Outer Ring Road",     city: "Bangalore", location: "Marathahalli Bridge", lat: 12.9591, lng: 77.6974, severity: "CRITICAL", status: "RESOLVED",   confidence: 95.6, vehicles: 3, injuries: 5, description: "High-speed collision at flyover" },
  { _offsetMs: 5 * DAY,             id: "ACC-0002", cameraId: "CAM-004", camera: "OMR Corridor",        city: "Chennai",   location: "Sholinganallur",      lat: 12.9010, lng: 80.2279, severity: "MEDIUM",   status: "RESOLVED",   confidence: 84.9, vehicles: 2, injuries: 1, description: "Rear-end at signal" },
  { _offsetMs: 6 * DAY,             id: "ACC-0001", cameraId: "CAM-001", camera: "Western Express Hwy", city: "Mumbai",    location: "Bandra Junction",     lat: 19.0596, lng: 72.8295, severity: "HIGH",     status: "RESOLVED",   confidence: 90.5, vehicles: 3, injuries: 2, description: "Chain collision in heavy traffic" },
];

export const accidents: Accident[] = accidentSeed.map(s => withTimestamp(s)) as unknown as Accident[];

// 20 emergency contacts spanning all 5 cities × 4 service types
export const contacts: EmergencyContact[] = [
  { id: "C1",  name: "Mumbai Police Control Room",  type: "POLICE",    city: "Mumbai",    phone: "+91 100",          address: "Crawford Market HQ",  responseTime: "4 min" },
  { id: "C2",  name: "KEM Hospital Emergency",      type: "HOSPITAL",  city: "Mumbai",    phone: "+91 22 2410 7000", address: "Parel, Mumbai",        responseTime: "8 min" },
  { id: "C3",  name: "Mumbai Ambulance Service",    type: "AMBULANCE", city: "Mumbai",    phone: "+91 108",          address: "Citywide",             responseTime: "6 min" },
  { id: "C4",  name: "Mumbai Fire Brigade",         type: "FIRE",      city: "Mumbai",    phone: "+91 101",          address: "Byculla HQ",           responseTime: "5 min" },
  { id: "C5",  name: "Delhi Police HQ",             type: "POLICE",    city: "Delhi",     phone: "+91 100",          address: "ITO, New Delhi",       responseTime: "5 min" },
  { id: "C6",  name: "AIIMS Trauma Center",         type: "HOSPITAL",  city: "Delhi",     phone: "+91 11 2658 8500", address: "Ansari Nagar",         responseTime: "7 min" },
  { id: "C7",  name: "Delhi Ambulance CATS",        type: "AMBULANCE", city: "Delhi",     phone: "+91 102",          address: "Citywide",             responseTime: "5 min" },
  { id: "C8",  name: "Delhi Fire Service",          type: "FIRE",      city: "Delhi",     phone: "+91 101",          address: "Connaught Place",      responseTime: "6 min" },
  { id: "C9",  name: "Bangalore Traffic Police",    type: "POLICE",    city: "Bangalore", phone: "+91 100",          address: "Infantry Road",        responseTime: "6 min" },
  { id: "C10", name: "Manipal Hospital ER",         type: "HOSPITAL",  city: "Bangalore", phone: "+91 80 2502 4444", address: "HAL Airport Road",     responseTime: "9 min" },
  { id: "C11", name: "Bangalore Ambulance 108",     type: "AMBULANCE", city: "Bangalore", phone: "+91 108",          address: "Citywide",             responseTime: "7 min" },
  { id: "C12", name: "Bangalore Fire & Rescue",     type: "FIRE",      city: "Bangalore", phone: "+91 101",          address: "Cubbon Park HQ",       responseTime: "7 min" },
  { id: "C13", name: "Chennai Police Emergency",    type: "POLICE",    city: "Chennai",   phone: "+91 100",          address: "Egmore HQ",            responseTime: "5 min" },
  { id: "C14", name: "Apollo Chennai Trauma",       type: "HOSPITAL",  city: "Chennai",   phone: "+91 44 2829 3333", address: "Greams Road",          responseTime: "8 min" },
  { id: "C15", name: "Chennai Ambulance 108",       type: "AMBULANCE", city: "Chennai",   phone: "+91 108",          address: "Citywide",             responseTime: "6 min" },
  { id: "C16", name: "Chennai Fire Service",        type: "FIRE",      city: "Chennai",   phone: "+91 101",          address: "Anna Salai HQ",        responseTime: "6 min" },
  { id: "C17", name: "Pune City Police",            type: "POLICE",    city: "Pune",      phone: "+91 100",          address: "Shivajinagar",         responseTime: "6 min" },
  { id: "C18", name: "Ruby Hall Clinic ER",         type: "HOSPITAL",  city: "Pune",      phone: "+91 20 2616 3391", address: "Sassoon Road",         responseTime: "10 min" },
  { id: "C19", name: "Pune Ambulance Service",      type: "AMBULANCE", city: "Pune",      phone: "+91 108",          address: "Citywide",             responseTime: "7 min" },
  { id: "C20", name: "Pune Fire Brigade",           type: "FIRE",      city: "Pune",      phone: "+91 101",          address: "Camp HQ",              responseTime: "6 min" },
];

// 7 alerts: 5 SENT, 1 FAILED, 1 PENDING
const alertSeed: Array<Omit<AlertRecord, "sentAt"> & { _offsetMs: number }> = [
  { _offsetMs: 4 * MIN,            id: "ALT-0042", accidentId: "ACC-0015", contactName: "Mumbai Police Control Room", type: "POLICE",    city: "Mumbai",    status: "SENT",    method: "SMS"  },
  { _offsetMs: 5 * MIN,            id: "ALT-0041", accidentId: "ACC-0015", contactName: "KEM Hospital Emergency",     type: "HOSPITAL",  city: "Mumbai",    status: "SENT",    method: "CALL" },
  { _offsetMs: 6 * MIN,            id: "ALT-0040", accidentId: "ACC-0015", contactName: "Mumbai Ambulance Service",   type: "AMBULANCE", city: "Mumbai",    status: "PENDING", method: "SMS"  },
  { _offsetMs: 28 * MIN,           id: "ALT-0039", accidentId: "ACC-0014", contactName: "Delhi Police HQ",            type: "POLICE",    city: "Delhi",     status: "SENT",    method: "CALL" },
  { _offsetMs: 29 * MIN,           id: "ALT-0038", accidentId: "ACC-0014", contactName: "AIIMS Trauma Center",        type: "HOSPITAL",  city: "Delhi",     status: "FAILED",  method: "SMS"  },
  { _offsetMs: 1 * HOUR + 2 * MIN, id: "ALT-0037", accidentId: "ACC-0013", contactName: "Bangalore Traffic Police",   type: "POLICE",    city: "Bangalore", status: "SENT",    method: "SMS"  },
  { _offsetMs: 2 * HOUR + 5 * MIN, id: "ALT-0036", accidentId: "ACC-0012", contactName: "Chennai Police Emergency",   type: "POLICE",    city: "Chennai",   status: "SENT",    method: "CALL" },
];

export const alertHistory: AlertRecord[] = alertSeed.map(s => withSentAt(s)) as unknown as AlertRecord[];

// Analytics — hourly accidents peak 6am-10pm, quiet overnight
export const hourlyAccidents = Array.from({ length: 24 }, (_, h) => {
  let n = 0;
  if (h >= 6 && h <= 22) {
    // Morning rush 8-10, evening rush 17-20
    const morning = h >= 8 && h <= 10 ? 6 : 0;
    const evening = h >= 17 && h <= 20 ? 9 : 0;
    const base = 3 + Math.round(Math.sin((h - 6) / 16 * Math.PI) * 3);
    n = base + morning + evening;
  } else {
    n = h >= 23 || h <= 2 ? 2 : 1;
  }
  return { hour: `${h.toString().padStart(2, "0")}:00`, accidents: n };
});

// Severity distribution — matches the 15-accident dataset
export const severityDistribution = [
  { name: "CRITICAL", value: 4, color: "#FF2D2D" },
  { name: "HIGH",     value: 5, color: "#FFB800" },
  { name: "MEDIUM",   value: 4, color: "#00E5FF" },
  { name: "LOW",      value: 2, color: "#00FF87" },
];

// Response times 8-25 minutes, mean ~12.4
export const responseTimeTrend = [
  { day: "D1",  time: 14.2 },
  { day: "D2",  time: 11.8 },
  { day: "D3",  time: 15.6 },
  { day: "D4",  time: 9.4  },
  { day: "D5",  time: 12.1 },
  { day: "D6",  time: 16.3 },
  { day: "D7",  time: 10.5 },
  { day: "D8",  time: 13.7 },
  { day: "D9",  time: 8.9  },
  { day: "D10", time: 16.2 },
  { day: "D11", time: 11.4 },
  { day: "D12", time: 12.8 },
  { day: "D13", time: 9.7  },
  { day: "D14", time: 11.0 },
];

export const cityAccidents = [
  { city: "Mumbai",    count: 4 },
  { city: "Delhi",     count: 4 },
  { city: "Bangalore", count: 3 },
  { city: "Chennai",   count: 2 },
  { city: "Pune",      count: 2 },
];

export const weeklyComparison = [
  { day: "Mon", thisWeek: 14, lastWeek: 11 },
  { day: "Tue", thisWeek: 17, lastWeek: 13 },
  { day: "Wed", thisWeek: 12, lastWeek: 15 },
  { day: "Thu", thisWeek: 19, lastWeek: 16 },
  { day: "Fri", thisWeek: 22, lastWeek: 18 },
  { day: "Sat", thisWeek: 16, lastWeek: 14 },
  { day: "Sun", thisWeek: 10, lastWeek: 9  },
];

// Helpers for stat cards. "Today" = last 24 hours so the count is
// deterministic regardless of current wall-clock hour (target: 6).
export function getAccidentsTodayCount(): number {
  const cutoff = Date.now() - 24 * HOUR;
  return accidents.filter(a => new Date(a.timestamp).getTime() >= cutoff).length;
}
export function getActiveEmergencyCount(): number {
  return accidents.filter(a => a.status === "ACTIVE" || a.status === "RESPONDING").length;
}
export function getOnlineCameraCount(): number {
  return cameras.filter(c => c.status === "ONLINE").length;
}
export function getAvgResponseMinutes(): number {
  const times = responseTimeTrend.map(d => d.time);
  return +(times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
}
