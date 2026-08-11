'use strict';

const express = require('express');
const axios   = require('axios');
const cors    = require('cors');
const path    = require('path');
const analytics = require('./analytics');

const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ANALYTICS MIDDLEWARE (before routes) ────────────────
app.use(analytics.middleware);

// ─── BRANDING ────────────────────────────────────────────
const OWNER   = "@sahilxalone";
const CHANNEL = "@osintnxera";

// ─── CLEANING ────────────────────────────────────────────
const removeFields = [
  'owner', 'OWNER', 'channel', 'CHANNEL', 'telegram', 'contact',
  'instagram', 'twitter', 'fb', 'facebook', 'website', 'github',
  'created_by', 'createdBy', 'owner_username', 'owner_channel',
  'credit', 'Credits', 'Credit', 'Source', 'source', 'provider',
  'Provider', 'api_source', 'API_Source', 'developer', 'Developer',
  'dev', 'Dev', 'invalidayushh', 'ftgamerv2', 'ftgamer2',
  '@invalidayushh', '@ftgamerv2', '@ftgamer2', 'InvalidAyush',
  '@InvalidAyush', 'invalidayush', '@invalidayush', 'DM TO BUY ACCESS',
  'xtradeep', 'Kon_Hu_Mai', 'support', '@raxusss', 'raxusss', 'Raxusss',
  'Support', 'help', 'Help'
];

const badSubstrings = [
  '@raxusss', 'raxusss', 'Raxusss',
  'InvalidAyush', '@InvalidAyush', 'invalidayush', '@invalidayush',
  'ftgamerv2', 'ftgamer2', '@ftgamerv2', '@ftgamer2', '@simpleguy444'
];

const removeFieldsLower = new Set(removeFields.map(f => f.toLowerCase()));

function cleanData(obj) {
  try {
    if (!obj || typeof obj !== 'object') {
      if (typeof obj === 'string') {
        let val = obj;
        for (const sub of badSubstrings) {
          val = val.replace(new RegExp(sub, 'gi'), '').trim();
        }
        return val;
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => cleanData(item)).filter(item => {
        if (typeof item === 'string' && item === '') return false;
        return true;
      });
    }
    const cleaned = {};
    for (const key of Object.keys(obj)) {
      if (removeFieldsLower.has(key.toLowerCase())) continue;
      const cleanedValue = cleanData(obj[key]);
      if (cleanedValue !== null && cleanedValue !== undefined && cleanedValue !== '') {
        cleaned[key] = cleanedValue;
      } else if (cleanedValue === 0 || cleanedValue === false || cleanedValue === true) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  } catch (e) {
    return obj;
  }
}

// ─── APIs ────────────────────────────────────────────────
const APIs = [
  { url: "https://rootx-osint.in/?type=tg_num&key=sahil_X&query={query}",                              method: "GET", description: "Telegram number lookup" },
  { url: "https://raxxosint.onrender.com/leakosint?key=Customer&quiry={query}",                         method: "GET", description: "Leak OSINT search query lookup" },
  { url: "https://osint.invalidayushh.workers.dev/num?key=Rack&q={number}",                             method: "GET", description: "Mobile number intelligence lookup" },
  { url: "https://leakapi.dpdns.org/search?q={number}",                                                 method: "GET", description: "New database number search" },
  { name: "num-india", url: "https://ft-osint-api.duckdns.org/api/number?key=sahil-new&num={number}",  method: "GET", description: "India phone number database lookup" },
  { name: "num-pak",   url: "https://ft-osint-api.duckdns.org/api/pk?key=sahil-new&number={number}",   method: "GET", description: "Pakistan phone number database lookup" },
  { url: "https://tg-to-num-ten.vercel.app/tg?key=sahil_X&num={number}",                               method: "GET", description: "Telegram to phone number lookup" },
  { url: "https://osint.invalidayushh.workers.dev/adhar?key=Sahil&q={adhar}",                          method: "GET", description: "Identification record lookup" },
  { url: "https://ayaanmods.site/family.php?key=YOUR_SUBHXCO_KEY&term={adhar}",                        method: "GET", description: "Family tree and demographic record lookup" },
  { url: "https://osint.invalidayushh.workers.dev/email?key=Rack&q={email}",                           method: "GET", description: "Email breach and record lookup" },
  { url: "https://leakapi.dpdns.org/vehicle-info?registration_number={vehicle}",                        method: "GET", description: "Vehicle registration details lookup" },
  { url: "https://leakapi.dpdns.org/api/vehicle?vehicle={vehicle}",                                     method: "GET", description: "Detailed vehicle intelligence record" },
  { url: "https://leakapi.dpdns.org/rc?registration_number={vehicle}",                                  method: "GET", description: "Registration Certificate (RC) lookup" },
  { url: "https://osint.invalidayushh.workers.dev/insta?key=Rack&q={username}",                        method: "GET", description: "Instagram account intelligence lookup" },
  { name: "telegram-user", url: "https://tg-to-num-ten.vercel.app/tg?key=sahil_X&num={username}",     method: "GET", description: "Telegram user intelligence lookup" },
  { url: "https://ft-osint-api.duckdns.org/api/git?key=sahil-new&username={username}",                 method: "GET", description: "GitHub profile intelligence lookup" },
  { url: "https://ft-osint-api.duckdns.org/api/bgmi?key=sahil-new&uid={uid}",                         method: "GET", description: "BGMI player ID intelligence lookup" },
  { url: "https://ft-osint-api.duckdns.org/api/ff?key=sahil-new&uid={uid}",                           method: "GET", description: "Free Fire player ID intelligence lookup" },
  { url: "https://ft-osint-api.duckdns.org/api/ifsc?key=sahil-new&ifsc={ifsc}",                       method: "GET", description: "Bank IFSC code details lookup" },
  { url: "https://ft-osint-api.duckdns.org/api/pan?key=sahil-new&pan={pan}",                          method: "GET", description: "PAN card record intelligence lookup" },
  { url: "https://ft-osint-api.duckdns.org/api/ip?key=sahil-new&ip={ip}",                             method: "GET", description: "IP geolocation and intelligence lookup" },
  { url: "https://ft-osint-api.duckdns.org/api/pincode?key=sahil-new&pin={pincode}",                  method: "GET", description: "Postal pincode geographic lookup" }
];

// ─── AUTO NAME ───────────────────────────────────────────
function generateEndpointName(api, existingNames) {
  if (api.name) return api.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  try {
    const cleanUrl = api.url.replace(/\{[^}]+\}/g, 'placeholder');
    const urlObj   = new URL(cleanUrl);
    const typeParam = urlObj.searchParams.get('type');
    if (typeParam) {
      const base = typeParam.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      if (!existingNames.has(base)) return base;
    }
    const segments = urlObj.pathname.split('/').filter(Boolean);
    const filtered = segments.filter(s => !['api','v1','v2','index.php'].includes(s.toLowerCase()));
    let candidate = filtered[filtered.length - 1] || segments[segments.length - 1] || 'api';
    candidate = candidate.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    let finalName = candidate, counter = 1;
    while (existingNames.has(finalName)) { finalName = `${candidate}-${counter}`; counter++; }
    return finalName;
  } catch (e) {
    let fallback = 'endpoint', finalName = fallback, counter = 1;
    while (existingNames.has(finalName)) { finalName = `${fallback}-${counter}`; counter++; }
    return finalName;
  }
}

const registeredAPIs = [];
const nameSet = new Set();

APIs.forEach(api => {
  const autoName = generateEndpointName(api, nameSet);
  nameSet.add(autoName);
  const matches = api.url.match(/\{([^}]+)\}/g);
  const required = matches ? matches.map(m => m.replace(/[{}]/g, '')) : [];
  const exampleParam = required[0] || 'query';

  let exampleVal = '12345678';
  if (exampleParam.includes('number') || exampleParam.includes('num')) exampleVal = '9876543210';
  if (exampleParam.includes('vehicle'))                                exampleVal = 'DL01AB1234';
  if (exampleParam.includes('email'))                                  exampleVal = 'test@example.com';
  if (exampleParam.includes('username'))                               exampleVal = 'john_doe';
  if (exampleParam.includes('ifsc'))                                   exampleVal = 'SBIN0001234';
  if (exampleParam.includes('pan'))                                    exampleVal = 'ABCDE1234F';
  if (exampleParam.includes('ip'))                                     exampleVal = '8.8.8.8';
  if (exampleParam.includes('pincode') || exampleParam.includes('pin')) exampleVal = '110001';
  if (exampleParam.includes('adhar'))                                  exampleVal = '123456789012';
  if (exampleParam.includes('uid'))                                    exampleVal = '123456789';

  registeredAPIs.push({ name: autoName, url: api.url, method: api.method || 'GET',
    description: api.description || 'API endpoint', requiredParams: required,
    exampleParam, exampleVal });
});

// ─── ROUTES ──────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Analytics JSON API — used by dashboard charts
app.get('/analytics/data', (req, res) => {
  res.json(analytics.snapshot());
});

// Analytics dashboard page
app.get('/analytics', (req, res) => {
  res.render('analytics', {
    owner: OWNER,
    channel: CHANNEL,
    totalEndpoints: registeredAPIs.length
  });
});

app.get('/', (req, res) => res.redirect('/api'));

app.get('/api', (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host     = req.get('host');
    const baseUrl  = `${protocol}://${host}`;

    const formattedApis = registeredAPIs.map(api => ({
      name: api.name,
      method: api.method,
      description: api.description,
      publicUrl: `${baseUrl}/api/${api.name}`,
      requiredParams: api.requiredParams,
      example: `${baseUrl}/api/${api.name}?${api.exampleParam}=${api.exampleVal}`
    }));

    res.render('index', { apis: formattedApis, baseUrl, owner: OWNER, channel: CHANNEL });
  } catch (err) {
    console.error('Template error:', err);
    res.status(500).json({ success: false, error: "Template rendering failed", details: err.message });
  }
});

app.all('/api/:endpoint', async (req, res) => {
  try {
    const endpointName = req.params.endpoint;
    const apiConfig    = registeredAPIs.find(a => a.name === endpointName);

    if (!apiConfig) {
      return res.status(404).json({
        success: false, error: "Endpoint not found",
        message: `The endpoint '/api/${endpointName}' does not exist. Visit /api to see available endpoints.`
      });
    }

    const inputParams = { ...req.query, ...req.body };
    let targetValue = null;

    for (const param of apiConfig.requiredParams) {
      if (inputParams[param] !== undefined && inputParams[param] !== '') {
        targetValue = inputParams[param]; break;
      }
    }
    if (!targetValue) {
      const fallbackKeys = ['query','q','number','num','adhar','aadhar','email','vehicle',
        'registration_number','username','user','uid','id','ifsc','pan','ip','pincode','pin','term','quiry'];
      for (const key of fallbackKeys) {
        if (inputParams[key] !== undefined && inputParams[key] !== '') {
          targetValue = inputParams[key]; break;
        }
      }
    }

    if (!targetValue) {
      return res.status(400).json({
        success: false, error: "Missing required parameter",
        required_parameters: apiConfig.requiredParams,
        message: `Please supply a valid parameter (e.g., ?${apiConfig.exampleParam}=VALUE)`
      });
    }

    let finalUpstreamUrl = apiConfig.url;
    const encodedVal = encodeURIComponent(targetValue);
    apiConfig.requiredParams.forEach(param => {
      finalUpstreamUrl = finalUpstreamUrl.replace(new RegExp(`\\{${param}\\}`, 'g'), encodedVal);
    });

    console.log(`[${new Date().toISOString()}] → ${finalUpstreamUrl}`);

    const axiosConfig = {
      method: apiConfig.method,
      url: finalUpstreamUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      },
      validateStatus: status => status < 600
    };

    if (['POST','PUT','PATCH'].includes(axiosConfig.method.toUpperCase())) {
      axiosConfig.data = req.body;
    }

    const response = await axios(axiosConfig);

    if (!response.data) {
      return res.status(500).json({ success: false, error: "API returned no data",
        status: response.status, owner: OWNER, channel: CHANNEL });
    }

    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      return res.status(500).json({ success: false, error: "API returned HTML error page",
        message: "The upstream API returned an HTML error page instead of JSON data",
        owner: OWNER, channel: CHANNEL });
    }

    let cleaned = cleanData(response.data);

    if (!cleaned || (typeof cleaned === 'object' && Object.keys(cleaned).length === 0)) {
      return res.status(404).json({ success: false, error: "No data found",
        message: "The API returned empty or null data", owner: OWNER, channel: CHANNEL });
    }

    if (cleaned && typeof cleaned === 'object' && !Array.isArray(cleaned)) {
      cleaned.owner = OWNER;
      cleaned.channel = CHANNEL;
      cleaned.timestamp = new Date().toISOString();
    } else {
      cleaned = { data: cleaned, owner: OWNER, channel: CHANNEL, timestamp: new Date().toISOString() };
    }

    return res.status(response.status).json(cleaned);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
    let errorMessage = error.message || "An unexpected error occurred";
    let errorDetails = {};

    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.data   = error.response.data;
      errorMessage = `API returned status ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "No response from API server (timeout or network error)";
    }

    return res.status(500).json({
      success: false, error: "Gateway execution error",
      message: errorMessage, details: errorDetails,
      owner: OWNER, channel: CHANNEL
    });
  }
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Owner: ${OWNER} | Channel: ${CHANNEL}`);
    console.log(`Endpoints: ${registeredAPIs.length}`);
    console.log(`Analytics: http://localhost:${PORT}/analytics`);
  });
}

module.exports = app;
