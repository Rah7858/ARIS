/* eslint-disable no-console */
'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const log = (msg) => console.log(`[SEED] ${msg}`);
const err = (msg) => console.error(`[SEED ERROR] ${msg}`);

async function runSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
  log('Schema applied successfully.');
}

async function clearData(client) {
  await client.query('DELETE FROM incidents');
  await client.query('DELETE FROM alerts');
  await client.query('DELETE FROM accidents');
  await client.query('DELETE FROM cameras');
  await client.query('DELETE FROM emergency_contacts');
  await client.query('DELETE FROM users');
  log('Existing data cleared.');
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const USERS = [
  {
    name: 'Admin User',
    email: 'admin@aris.com',
    password: 'Admin@1234',
    role: 'admin',
    phone: '+91-9000000001',
  },
  {
    name: 'Operator One',
    email: 'operator@aris.com',
    password: 'Operator@1234',
    role: 'operator',
    phone: '+91-9000000002',
  },
  {
    name: 'Viewer Guest',
    email: 'viewer@aris.com',
    password: 'Viewer@1234',
    role: 'viewer',
    phone: '+91-9000000003',
  },
];

const CAMERAS = [
  {
    name: 'Mumbai Highway Cam 1',
    location: 'Eastern Express Highway, Kurla',
    city: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    status: 'active',
    stream_url: 'rtsp://stream.aris.local/cam/mumbai-1',
  },
  {
    name: 'Delhi Ring Road Cam',
    location: 'NH-44, Mukarba Chowk',
    city: 'Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
    status: 'active',
    stream_url: 'rtsp://stream.aris.local/cam/delhi-1',
  },
  {
    name: 'Bangalore Outer Ring Cam',
    location: 'Outer Ring Road, Marathahalli',
    city: 'Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    status: 'active',
    stream_url: 'rtsp://stream.aris.local/cam/bangalore-1',
  },
  {
    name: 'Chennai Anna Salai Cam',
    location: 'Anna Salai, Guindy',
    city: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    status: 'maintenance',
    stream_url: 'rtsp://stream.aris.local/cam/chennai-1',
  },
  {
    name: 'Pune Expressway Cam',
    location: 'Mumbai-Pune Expressway, Khandala',
    city: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    status: 'active',
    stream_url: 'rtsp://stream.aris.local/cam/pune-1',
  },
];

const EMERGENCY_CONTACTS = [
  // Mumbai
  { name: 'Mumbai Traffic Police HQ', type: 'police',    phone: '022-22621855', email: 'traffic@mumbaipolice.gov.in', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777, response_time_avg: 8 },
  { name: 'KEM Hospital Mumbai',      type: 'hospital',  phone: '022-24136051', email: 'kem@mcgm.gov.in',             city: 'Mumbai', latitude: 19.0013, longitude: 72.8382, response_time_avg: 12 },
  { name: 'Mumbai Ambulance 108',     type: 'ambulance', phone: '108',          email: null,                          city: 'Mumbai', latitude: 19.0760, longitude: 72.8777, response_time_avg: 10 },
  { name: 'Mumbai Fire Brigade',      type: 'fire',      phone: '101',          email: 'fire@mcgm.gov.in',            city: 'Mumbai', latitude: 19.0430, longitude: 72.8590, response_time_avg: 7 },
  // Delhi
  { name: 'Delhi Traffic Police',     type: 'police',    phone: '011-23490155', email: 'dtp@delhipolice.nic.in',      city: 'Delhi',  latitude: 28.7041, longitude: 77.1025, response_time_avg: 10 },
  { name: 'AIIMS Emergency Delhi',    type: 'hospital',  phone: '011-26588500', email: 'aiims@emergency.in',          city: 'Delhi',  latitude: 28.5672, longitude: 77.2100, response_time_avg: 15 },
  { name: 'Delhi Ambulance 102',      type: 'ambulance', phone: '102',          email: null,                          city: 'Delhi',  latitude: 28.7041, longitude: 77.1025, response_time_avg: 11 },
  { name: 'Delhi Fire Service',       type: 'fire',      phone: '101',          email: 'fire@delhi.gov.in',           city: 'Delhi',  latitude: 28.6692, longitude: 77.2247, response_time_avg: 9 },
  // Bangalore
  { name: 'Bangalore Traffic Police', type: 'police',    phone: '080-22943300', email: 'btp@karnataka.gov.in',        city: 'Bangalore', latitude: 12.9716, longitude: 77.5946, response_time_avg: 12 },
  { name: 'Victoria Hospital',        type: 'hospital',  phone: '080-26703000', email: 'victoria@kims.ac.in',         city: 'Bangalore', latitude: 12.9630, longitude: 77.5740, response_time_avg: 14 },
  { name: 'Bangalore 108 Ambulance',  type: 'ambulance', phone: '108',          email: null,                          city: 'Bangalore', latitude: 12.9716, longitude: 77.5946, response_time_avg: 13 },
  { name: 'Bangalore Fire Station',   type: 'fire',      phone: '101',          email: 'fire@bbmp.gov.in',            city: 'Bangalore', latitude: 12.9750, longitude: 77.5938, response_time_avg: 10 },
  // Chennai
  { name: 'Chennai Traffic Police',   type: 'police',    phone: '044-28447791', email: 'ctp@tnpolice.gov.in',         city: 'Chennai', latitude: 13.0827, longitude: 80.2707, response_time_avg: 9 },
  { name: 'Rajiv Gandhi Govt Hospital', type: 'hospital', phone: '044-25305000', email: null,                         city: 'Chennai', latitude: 13.1025, longitude: 80.2750, response_time_avg: 16 },
  { name: 'Chennai Ambulance 108',    type: 'ambulance', phone: '108',          email: null,                          city: 'Chennai', latitude: 13.0827, longitude: 80.2707, response_time_avg: 12 },
  { name: 'Chennai Fire & Rescue',    type: 'fire',      phone: '101',          email: 'fire@tnfrs.gov.in',           city: 'Chennai', latitude: 13.0580, longitude: 80.2800, response_time_avg: 8 },
  // Pune
  { name: 'Pune Traffic Police',      type: 'police',    phone: '020-26126611', email: 'ptp@punepolice.gov.in',       city: 'Pune', latitude: 18.5204, longitude: 73.8567, response_time_avg: 11 },
  { name: 'Sassoon General Hospital', type: 'hospital',  phone: '020-26128000', email: 'sassoon@pune.gov.in',         city: 'Pune', latitude: 18.5196, longitude: 73.8553, response_time_avg: 13 },
  { name: 'Pune Ambulance 108',       type: 'ambulance', phone: '108',          email: null,                          city: 'Pune', latitude: 18.5204, longitude: 73.8567, response_time_avg: 14 },
  { name: 'Pune Fire Brigade',        type: 'fire',      phone: '101',          email: 'fire@punecorporation.org',    city: 'Pune', latitude: 18.5360, longitude: 73.8620, response_time_avg: 9 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    log('Starting database seed...');

    // Apply schema
    await runSchema();

    await client.query('BEGIN');

    // Clear existing data
    await clearData(client);

    // ── Users ──
    log('Seeding users...');
    const userIds = [];
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, 12);
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password, role, phone)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [u.name, u.email, hash, u.role, u.phone]
      );
      userIds.push(rows[0].id);
    }
    log(`  → ${userIds.length} users created.`);

    // ── Emergency Contacts ──
    log('Seeding emergency contacts...');
    for (const ec of EMERGENCY_CONTACTS) {
      await client.query(
        `INSERT INTO emergency_contacts (name, type, phone, email, city, latitude, longitude, response_time_avg)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [ec.name, ec.type, ec.phone, ec.email, ec.city, ec.latitude, ec.longitude, ec.response_time_avg]
      );
    }
    log(`  → ${EMERGENCY_CONTACTS.length} emergency contacts created.`);

    // ── Cameras ──
    log('Seeding cameras...');
    const cameraIds = [];
    for (const cam of CAMERAS) {
      const { rows } = await client.query(
        `INSERT INTO cameras (name, location, city, latitude, longitude, status, stream_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [cam.name, cam.location, cam.city, cam.latitude, cam.longitude, cam.status, cam.stream_url]
      );
      cameraIds.push(rows[0].id);
    }
    log(`  → ${cameraIds.length} cameras created.`);

    // ── Accidents ──
    log('Seeding accidents...');
    const accidentDefs = [
      // Mumbai
      { cidx: 0, severity: 'critical', status: 'detected',   vehicles: 4, desc: 'Multi-vehicle pile-up on Eastern Express Highway. Heavy traffic disruption.', lat: 19.0760, lng: 72.8777, location: 'Eastern Express Highway, Kurla, Mumbai',   hoursAgo: 0.5 },
      { cidx: 0, severity: 'high',     status: 'responding', vehicles: 2, desc: 'Two-vehicle collision near Kurla flyover. One vehicle overturned.',           lat: 19.0720, lng: 72.8800, location: 'Kurla Flyover, Mumbai',                      hoursAgo: 2 },
      { cidx: 0, severity: 'medium',   status: 'resolved',   vehicles: 2, desc: 'Rear-end collision at signal. Minor injuries reported.',                       lat: 19.0700, lng: 72.8760, location: 'LBS Road, Kurla, Mumbai',                    hoursAgo: 6 },
      // Delhi
      { cidx: 1, severity: 'critical', status: 'responding', vehicles: 5, desc: 'Major accident on NH-44. Multiple vehicles involved. Road blocked.',          lat: 28.7041, lng: 77.1025, location: 'NH-44, Mukarba Chowk, Delhi',                hoursAgo: 1 },
      { cidx: 1, severity: 'high',     status: 'detected',   vehicles: 3, desc: 'Truck collision on ring road. Truck partially blocking lanes.',               lat: 28.7100, lng: 77.0980, location: 'Ring Road North, Delhi',                     hoursAgo: 0.25 },
      { cidx: 1, severity: 'low',      status: 'resolved',   vehicles: 1, desc: 'Vehicle skidded on wet road. Driver unhurt.',                                 lat: 28.6950, lng: 77.1100, location: 'Wazirabad Road, Delhi',                      hoursAgo: 12 },
      // Bangalore
      { cidx: 2, severity: 'high',     status: 'detected',   vehicles: 3, desc: 'Three-vehicle accident near Marathahalli junction. One critically injured.',  lat: 12.9560, lng: 77.7010, location: 'Marathahalli Bridge, Bangalore',             hoursAgo: 1.5 },
      { cidx: 2, severity: 'medium',   status: 'responding', vehicles: 2, desc: 'Bike collision with car on ORR. Biker taken to hospital.',                    lat: 12.9600, lng: 77.6980, location: 'Outer Ring Road, Marathahalli, Bangalore',   hoursAgo: 3 },
      { cidx: 2, severity: 'low',      status: 'resolved',   vehicles: 2, desc: 'Minor scrape between two cars at traffic signal.',                            lat: 12.9650, lng: 77.6950, location: 'Kadubeesanahalli, Bangalore',                hoursAgo: 24 },
      // Chennai
      { cidx: 3, severity: 'critical', status: 'resolved',   vehicles: 3, desc: 'Three-vehicle accident on Anna Salai. Road cleared after 4 hours.',          lat: 13.0827, lng: 80.2707, location: 'Anna Salai, Guindy, Chennai',                hoursAgo: 8 },
      { cidx: 3, severity: 'medium',   status: 'detected',   vehicles: 2, desc: 'SUV rear-ended a bus near Guindy. Passengers evacuated safely.',              lat: 13.0750, lng: 80.2680, location: 'Guindy Junction, Chennai',                  hoursAgo: 0.75 },
      { cidx: 3, severity: 'low',      status: 'resolved',   vehicles: 1, desc: 'Vehicle tyre burst causing minor road obstruction.',                          lat: 13.0900, lng: 80.2650, location: 'Mount Road, Chennai',                       hoursAgo: 18 },
      // Pune
      { cidx: 4, severity: 'high',     status: 'detected',   vehicles: 4, desc: 'Multiple vehicles collided on expressway. Fog cited as cause.',               lat: 18.5204, lng: 73.8567, location: 'Mumbai-Pune Expressway, Khandala',          hoursAgo: 0.5 },
      { cidx: 4, severity: 'medium',   status: 'responding', vehicles: 2, desc: 'Car and motorcycle collision near highway entry ramp.',                        lat: 18.5250, lng: 73.8600, location: 'Expressway Entry, Khandala, Pune',          hoursAgo: 4 },
      { cidx: 4, severity: 'low',      status: 'resolved',   vehicles: 2, desc: 'Minor vehicle dent at toll plaza. No injuries.',                              lat: 18.5150, lng: 73.8530, location: 'Khopoli Toll Plaza, Pune',                  hoursAgo: 36 },
    ];

    const accidentIds = [];
    for (const a of accidentDefs) {
      const detectedAt = new Date(Date.now() - a.hoursAgo * 3600 * 1000);
      const resolvedAt = a.status === 'resolved' ? new Date(detectedAt.getTime() + 2 * 3600 * 1000) : null;
      const { rows } = await client.query(
        `INSERT INTO accidents
           (camera_id, severity, status, latitude, longitude, location_name, description, vehicle_count, detected_at, resolved_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [cameraIds[a.cidx], a.severity, a.status, a.lat, a.lng, a.location, a.desc, a.vehicles, detectedAt, resolvedAt]
      );
      accidentIds.push(rows[0].id);
    }
    log(`  → ${accidentIds.length} accidents created.`);

    // ── Alerts ──
    log('Seeding alerts...');
    const alertDefs = [
      { aidx: 0, type: 'email',  name: 'Mumbai Traffic Control', contact: 'traffic@mumbaipolice.gov.in', status: 'sent' },
      { aidx: 0, type: 'system', name: 'ARIS Dashboard',         contact: 'system',                      status: 'sent' },
      { aidx: 3, type: 'email',  name: 'Delhi Traffic HQ',       contact: 'dtp@delhipolice.nic.in',      status: 'sent' },
      { aidx: 3, type: 'sms',    name: 'AIIMS Emergency',        contact: '+911126588500',                status: 'failed' },
      { aidx: 6, type: 'email',  name: 'Bangalore Traffic',      contact: 'btp@karnataka.gov.in',        status: 'sent' },
      { aidx: 9, type: 'system', name: 'Chennai Dispatch',       contact: 'system',                      status: 'sent' },
      { aidx: 12, type: 'email', name: 'Pune Highway Patrol',    contact: 'ptp@punepolice.gov.in',       status: 'pending' },
    ];
    for (const al of alertDefs) {
      const sentAt = al.status === 'sent' ? new Date() : null;
      await client.query(
        `INSERT INTO alerts (accident_id, type, recipient_name, recipient_contact, status, sent_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [accidentIds[al.aidx], al.type, al.name, al.contact, al.status, sentAt]
      );
    }
    log(`  → ${alertDefs.length} alerts created.`);

    // ── Incidents ──
    log('Seeding incidents...');
    const incidentDefs = [
      { aidx: 2,  responder: 'Officer Ravi Kumar',    time: 8,  notes: 'Arrived on scene. Vehicles towed. Traffic restored.' },
      { aidx: 5,  responder: 'Officer Sanjeev Mehta', time: 12, notes: 'Driver assessed. Vehicle moved to shoulder.' },
      { aidx: 8,  responder: 'Constable Priya Singh', time: 15, notes: 'Minor accident resolved. FIR filed.' },
      { aidx: 9,  responder: 'Officer Rajan Thomas',  time: 10, notes: 'Accident cleared. Road reopened after 4 hours.' },
      { aidx: 11, responder: 'Officer Suresh Nair',   time: 5,  notes: 'Vehicle tyre replaced. No injuries.' },
      { aidx: 14, responder: 'Officer Amit Jadhav',   time: 7,  notes: 'Minor dent assessed. No damage to infrastructure.' },
    ];
    for (const inc of incidentDefs) {
      const resolvedAt = new Date(Date.now() - Math.random() * 3600 * 1000);
      await client.query(
        `INSERT INTO incidents (accident_id, responder_name, response_time, notes, resolved_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [accidentIds[inc.aidx], inc.responder, inc.time, inc.notes, resolvedAt]
      );
    }
    log(`  → ${incidentDefs.length} incidents created.`);

    await client.query('COMMIT');
    log('');
    log('✅ Seed completed successfully!');
    log('');
    log('Test Credentials:');
    log('  Admin:    admin@aris.com    / Admin@1234');
    log('  Operator: operator@aris.com / Operator@1234');
    log('  Viewer:   viewer@aris.com   / Viewer@1234');
  } catch (e) {
    await client.query('ROLLBACK');
    err(e.message);
    err(e.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
