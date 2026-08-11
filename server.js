const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// 📝 UNIQUE APIS CONFIGURATION (Updated with your key)
// =============================================

const APIS = {
    // 🔥 LEAK OSINT
    'leakpro': 'https://raxxosint.onrender.com/leakosint?key=Customer&quiry={query}',
    
    // 📱 NUMBER BASED
    'num': 'https://osint.invalidayushh.workers.dev/num?key=Sahil&q={number}',
    'num-new': 'https://leakapi.dpdns.org/search?q={number}',
    'num-india': 'https://ft-osint-api.duckdns.org/api/number?key=sahil-new&num={number}',
    'num-pak': 'https://ft-osint-api.duckdns.org/api/pk?key=sahil-new&number={number}',
    'telegram-num': 'https://tg-to-num-ten.vercel.app/tg?key=sahil_X&num={number}',
    
    // 👨‍👩‍👧‍👦 FAMILY / AADHAR
    'adhar': 'https://osint.invalidayushh.workers.dev/adhar?key=Sahil&q={adhar}',
    'family': 'https://ayaanmods.site/family.php?key=YOUR_SUBHXCO_KEY&term={adhar}',
    
    // 📧 EMAIL
    'email': 'https://osint.invalidayushh.workers.dev/email?key=Sahil&q={email}',
    
    // 🚗 VEHICLE
    'vehicle': 'https://leakapi.dpdns.org/vehicle-info?registration_number={vehicle}',
    'vehicle-detail': 'https://leakapi.dpdns.org/api/vehicle?vehicle={vehicle}',
    'rc': 'https://leakapi.dpdns.org/rc?registration_number={vehicle}',
    
    // 📱 SOCIAL MEDIA
    'insta': 'https://osint.invalidayushh.workers.dev/insta?key=Sahil&q={username}',
    'telegram': 'https://tg-to-num-ten.vercel.app/tg?key=sahil_X&num={username}',
    'github': 'https://ft-osint-api.duckdns.org/api/git?key=sahil-new&username={username}',
    
    // 🎮 GAMING
    'bgmi': 'https://ft-osint-api.duckdns.org/api/bgmi?key=sahil-new&uid={uid}',
    'freefire': 'https://ft-osint-api.duckdns.org/api/ff?key=sahil-new&uid={uid}',
    
    // 🏦 FINANCIAL
    'bank': 'https://ft-osint-api.duckdns.org/api/ifsc?key=sahil-new&ifsc={ifsc}',
    'pan': 'https://ft-osint-api.duckdns.org/api/pan?key=sahil-new&pan={pan}',
    
    // 🌐 OTHER
    'ip': 'https://ft-osint-api.duckdns.org/api/ip?key=sahil-new&ip={ip}',
    'pincode': 'https://ft-osint-api.duckdns.org/api/pincode?key=sahil-new&pin={pincode}',
};

// =============================================
// 🧹 CLEAN RESPONSE UTILITY
// =============================================

const REMOVE_FIELDS = [
    'owner', 'OWNER', 'channel', 'CHANNEL', 'telegram', 'contact',
    'instagram', 'twitter', 'fb', 'facebook', 'website', 'github',
    'created_by', 'createdBy', 'owner_username', 'owner_channel',
    'credit', 'Credits', 'Credit', 'Source', 'source', 'provider',
    'Provider', 'api_source', 'API_Source', 'developer', 'Developer',
    'dev', 'Dev', 'invalidayushh', 'ftgamerv2', 'ftgamer2',
    '@invalidayushh', '@ftgamerv2', '@ftgamer2', 'InvalidAyush',
    '@InvalidAyush', 'invalidayush', '@invalidayush', 'DM TO BUY ACCESS',
    'xtradeep', 'Kon_Hu_Mai', 'support', '@raxusss', 'raxusss', 'Raxusss',
    'Support', 'help', 'Help', 'key', 'KEY', 'api_key', 'API_KEY'
];

function cleanData(data) {
    if (!data || typeof data !== 'object') return data;
    const cleaned = JSON.parse(JSON.stringify(data));
    
    const clean = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (let key of Object.keys(obj)) {
            if (REMOVE_FIELDS.includes(key)) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                clean(obj[key]);
            }
        }
    };
    clean(cleaned);
    return cleaned;
}

// =============================================
// 🔧 MAIN PROXY HANDLER
// =============================================

app.all('/api/:endpoint', async (req, res) => {
    const endpoint = req.params.endpoint;
    const apiUrl = APIS[endpoint];
    
    if (!apiUrl) {
        return res.status(404).json({
            success: false,
            error: `❌ Endpoint '${endpoint}' not found`,
            available_endpoints: Object.keys(APIS)
        });
    }
    
    const params = { ...req.query, ...req.body };
    
    const paramMap = {
        'num': ['number', 'num', 'q', 'query'],
        'num-new': ['number', 'num', 'q', 'query'],
        'num-india': ['number', 'num', 'q', 'query', 'num'],
        'num-pak': ['number', 'num', 'q', 'query', 'number'],
        'telegram-num': ['number', 'num', 'q', 'query'],
        'adhar': ['adhar', 'aadhar', 'number', 'q', 'query'],
        'family': ['adhar', 'aadhar', 'number', 'term', 'q', 'query'],
        'email': ['email', 'q', 'query'],
        'vehicle': ['vehicle', 'registration_number', 'q', 'query'],
        'vehicle-detail': ['vehicle', 'v', 'q', 'query'],
        'rc': ['vehicle', 'registration_number', 'q', 'query'],
        'insta': ['username', 'user', 'q', 'query'],
        'telegram': ['username', 'user', 'q', 'query'],
        'github': ['username', 'user', 'q', 'query'],
        'bgmi': ['uid', 'id', 'q', 'query'],
        'freefire': ['uid', 'id', 'q', 'query'],
        'bank': ['ifsc', 'q', 'query'],
        'pan': ['pan', 'q', 'query'],
        'ip': ['ip', 'q', 'query'],
        'pincode': ['pincode', 'pin', 'q', 'query'],
        'leakpro': ['number', 'num', 'q', 'query', 'quiry']
    };
    
    const possibleKeys = paramMap[endpoint] || ['q', 'query', 'number', 'num', 'username'];
    let value = null;
    
    for (let key of possibleKeys) {
        if (params[key] !== undefined && params[key] !== '') {
            value = params[key];
            break;
        }
    }
    
    if (!value) {
        return res.status(400).json({
            success: false,
            error: `❌ Missing required query parameter for this endpoint.`,
            expected_one_of: possibleKeys,
            example: `/api/${endpoint}?${possibleKeys[0]}=VALUE`
        });
    }
    
    let url = apiUrl;
    const encodedVal = encodeURIComponent(value);
    
    const replacements = {
        '{query}': encodedVal,
        '{number}': encodedVal,
        '{num}': encodedVal,
        '{adhar}': encodedVal,
        '{email}': encodedVal,
        '{vehicle}': encodedVal,
        '{username}': encodedVal,
        '{uid}': encodedVal,
        '{ifsc}': encodedVal,
        '{pan}': encodedVal,
        '{ip}': encodedVal,
        '{pincode}': encodedVal,
        '{pin}': encodedVal
    };
    
    for (let [placeholder, val] of Object.entries(replacements)) {
        url = url.replace(new RegExp(placeholder, 'g'), val);
    }
    
    try {
        console.log(`📡 Proxying [${endpoint}] → ${url}`);
        
        const response = await axios({
            method: req.method,
            url: url,
            timeout: 25000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        let data = response.data;
        if (typeof data === 'string') {
            try { 
                data = JSON.parse(data); 
            } catch (e) {
                data = { raw_response: data };
            }
        }
        
        return res.status(response.status).json({
            success: true,
            endpoint: endpoint,
            query: value,
            data: cleanData(data)
        });
        
    } catch (error) {
        console.error(`❌ Error on endpoint [${endpoint}]:`, error.message);
        return res.status(500).json({
            success: false,
            endpoint: endpoint,
            error: error.message,
            hint: "Upstream API may be offline, timed out, or blocked."
        });
    }
});

// =============================================
// 📋 ENDPOINTS LIST ROUTE
// =============================================

app.get('/api/list', (req, res) => {
    const list = Object.keys(APIS).map(name => {
        return {
            name: name,
            url_pattern: `/api/${name}`
        };
    });
    
    res.json({
        success: true,
        total_apis: list.length,
        apis: list
    });
});

// =============================================
// 🏠 HOME PAGE HTML
// =============================================

app.get('/', (req, res) => {
    const html = Object.keys(APIS).map(name => {
        return `<li><b>/api/${name}</b></li>`;
    }).join('');
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>🚀 Active API Proxy Gateway</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: #0a0e1a; color: #e0e0e0; font-family: Arial, sans-serif; padding: 20px; }
                .container { max-width: 900px; margin: auto; }
                h1 { color: #00d4ff; text-align: center; font-size: 2.5rem; margin-bottom: 10px; }
                .subtitle { text-align: center; color: #8892b0; margin-bottom: 30px; }
                .box { background: #141b2d; border: 1px solid #1e2a45; border-radius: 12px; padding: 25px; }
                .box h3 { color: #00d4ff; margin-bottom: 15px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
                li { padding: 8px 12px; border-bottom: 1px solid #1e2a45; list-style: none; font-size: 14px; }
                li:hover { background: #1a2340; }
                .stats { display: flex; gap: 20px; justify-content: center; margin: 20px 0; }
                .stat { background: #141b2d; padding: 10px 25px; border-radius: 8px; border: 1px solid #1e2a45; text-align: center; }
                .stat .num { color: #00d4ff; font-size: 24px; font-weight: bold; }
                .stat .label { color: #8892b0; font-size: 12px; }
                .example { background: #0a0e1a; padding: 15px; border-radius: 6px; margin-top: 20px; color: #fbbf24; font-size: 13px; }
                .footer { text-align: center; margin-top: 30px; color: #4a5568; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Active API Proxy Gateway</h1>
                <p class="subtitle">${Object.keys(APIS).length} Proxied Endpoints Operational</p>
                
                <div class="stats">
                    <div class="stat"><div class="num">${Object.keys(APIS).length}</div><div class="label">Total Endpoints</div></div>
                    <div class="stat"><div class="num">ONLINE</div><div class="label">Status</div></div>
                </div>
                
                <div class="box">
                    <h3>📡 Route List:</h3>
                    <ul>${html}</ul>
                    
                    <div class="example">
                        <strong>🔍 Usage Example:</strong><br>
                        /api/num?number=9876543210<br>
                        /api/email?email=test@gmail.com
                    </div>
                </div>
                
                <div class="footer">
                    💡 View full list JSON at <a href="/api/list" style="color: #00d4ff;">/api/list</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Proxy Server running on http://localhost:${PORT}`);
        console.log(`📡 Loaded ${Object.keys(APIS).length} Endpoints successfully with key 'sahil-new'.\n`);
    });
}
