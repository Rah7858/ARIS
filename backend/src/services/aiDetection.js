'use strict';

const MIN_DELAY      = parseInt(process.env.AI_MIN_DELAY_MS      || '300', 10);
const MAX_DELAY      = parseInt(process.env.AI_MAX_DELAY_MS      || '800', 10);
const MIN_CONFIDENCE = parseInt(process.env.AI_MIN_CONFIDENCE    || '75',  10);
const MAX_CONFIDENCE = parseInt(process.env.AI_MAX_CONFIDENCE    || '99',  10);

// Weighted severity distribution to mimic a realistic model
const SEVERITY_WEIGHTS = [
  { value: 'critical', weight: 15 },
  { value: 'high',     weight: 25 },
  { value: 'medium',   weight: 35 },
  { value: 'low',      weight: 25 },
];

const DESCRIPTIONS = {
  critical: [
    'Multi-vehicle pile-up detected. Multiple lanes blocked. Emergency response required immediately.',
    'Head-on collision with overturned vehicle. Potential fatalities. Deploy all emergency units.',
    'Major truck accident blocking entire carriageway. Hazmat spillage risk detected.',
  ],
  high: [
    'Two-vehicle collision with significant impact. Airbag deployment detected on at least one vehicle.',
    'Rear-end collision involving heavy vehicle and passenger car. Injuries likely.',
    'Vehicle rolled over after hitting median. Occupant assistance required.',
  ],
  medium: [
    'Moderate collision between two vehicles. Traffic disruption in right lane.',
    'Side-swipe incident involving multiple vehicles. Minor injuries possible.',
    'Vehicle struck stationary object. Driver appears mobile.',
  ],
  low: [
    'Minor fender-bender at signal. Vehicles are driveable.',
    'Single vehicle skid with no apparent injuries. Road surface assessment advised.',
    'Parking lot collision with minimal damage detected.',
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 4) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pickSeverity() {
  const total = SEVERITY_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let rand = Math.random() * total;
  for (const { value, weight } of SEVERITY_WEIGHTS) {
    rand -= weight;
    if (rand <= 0) return value;
  }
  return 'medium';
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function simulateDelay() {
  const delay = randomInt(MIN_DELAY, MAX_DELAY);
  return new Promise((res) => setTimeout(res, delay));
}

function generateBoundingBoxes(vehicleCount) {
  const boxes = [];
  for (let i = 0; i < vehicleCount; i++) {
    boxes.push({
      id: i + 1,
      label: pickRandom(['car', 'truck', 'bus', 'motorcycle', 'suv']),
      confidence: randomFloat(0.70, 0.99, 2),
      bbox: {
        x: randomInt(0, 800),
        y: randomInt(0, 600),
        width: randomInt(80, 220),
        height: randomInt(50, 150),
      },
    });
  }
  return boxes;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyse a (mock) image and return accident detection results.
 * @param {object} options
 * @param {string} [options.filename]  - Original filename (unused by mock)
 * @param {string} [options.frameId]   - Frame identifier
 * @returns {Promise<object>}
 */
async function detectAccident({ filename = null, frameId = null } = {}) {
  await simulateDelay();

  const severity     = pickSeverity();
  const confidence   = randomFloat(MIN_CONFIDENCE / 100, MAX_CONFIDENCE / 100, 4);
  const vehicleCount = randomInt(1, 5);
  const description  = pickRandom(DESCRIPTIONS[severity]);
  const accidentDetected = confidence > 0.78; // simulate ~78%+ = accident found

  return {
    accident_detected: accidentDetected,
    severity:          accidentDetected ? severity : null,
    confidence:        parseFloat(confidence.toFixed(4)),
    confidence_pct:    Math.round(confidence * 100),
    vehicle_count:     accidentDetected ? vehicleCount : 0,
    description:       accidentDetected ? description : 'No accident detected in frame.',
    bounding_boxes:    accidentDetected ? generateBoundingBoxes(vehicleCount) : [],
    model_version:     'aris-mock-v1.0',
    processing_time_ms: randomInt(MIN_DELAY, MAX_DELAY),
    frame_id:          frameId,
    source_file:       filename,
    analysed_at:       new Date().toISOString(),
  };
}

/**
 * Return AI service health status.
 */
function getHealth() {
  return {
    status:        'operational',
    model_version: 'aris-mock-v1.0',
    mode:          'mock',
    capabilities:  ['image_analysis', 'frame_analysis', 'severity_classification'],
    uptime_seconds: process.uptime(),
    timestamp:     new Date().toISOString(),
  };
}

module.exports = { detectAccident, getHealth };
