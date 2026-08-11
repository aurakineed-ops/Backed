const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// =============================================
// 📝 SIRF UNIQUE APIS - Koi duplicate nahi!
// =============================================

const APIS = {
    // 🔥 LEAK OSINT
    'leakpro': 'https://raxxosint.onrender.com/leakosint?key=Customer&quiry={query}',
    
    // 📱 NUMBER BASED
    'num': 'https://osint.invalidayushh.workers.dev/num?key=Sahil&q={number}',
    'num-new': 'https://leakapi.dpdns.org/search?q={number}',
    'num-india': 'https://ft-osint-api.duckdns.org/api/number?key=YOUR_FTOSINT_KEY&num={number}',
    'num-pak': 'https://ft-osint-api.duckdns.org/api/pk?key=YOUR_FTOSINT_KEY&number={number}',
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
    'github': 'https://ft-osint-api.duckdns.org/api/git?key=YOUR_FTOSINT_KEY&username={username}',
    
    // 🎮 GAMING
    'bgmi': 'https://ft-osint-api.duckdns.org/api/bgmi?key=YOUR_FTOSINT_KEY&uid={uid}',
    'freefire': 'https://ft-osint-api.duckdns.org/api/ff?key=YOUR_FTOSINT_KEY&uid={uid}',
    
    // 🏦 FINANCIAL
    'bank': 'https://ft-osint-api.duckdns.org/api/ifsc?key=YOUR_FTOSINT_KEY&ifsc={ifsc}',
    'pan': 'https://ft-osint-api.duckdns.org/api/pan?key=YOUR_FTOSINT_KEY&pan={pan}',
    
    // 🌐 OTHER
    'ip': 'https://ft-osint-api.duckdns.org/api/ip?key=YOUR_FTOSINT_KEY&ip={ip}',
    'pincode': 'https://ft-osint-api.duckdns.org/api/pincode?key=YOUR_FTOSINT_KEY&pin={pincode}',
};

// =============================================
// 🧹 CLEAN RESPONSE
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
// 🔧 MAIN HANDLER
// =============================================

app.all('/api/:endpoint', async (req, res) => {
    const endpoint = req.params.endpoint;
    const apiUrl = APIS[endpoint];
    
    if (!apiUrl) {
        return res.status(404).json({
            success: false,
            error: `❌ '${endpoint}' nahi mila`,
            available: Object.keys(APIS)
        });
    }
    
    const params = { ...req.query, ...req.body };
    
    // Parameter mapping
    const paramMap = {
        'num': ['number', 'num', 'q', 'query'],
        'num-new': ['number', 'num', 'q', 'query'],
        'num-india': ['number', 'num', 'q', 'query'],
        'num-pak': ['number', 'num', 'q', 'query'],
        'telegram-num': ['number', 'num', 'q', 'query'],
        'adhar': ['adhar', 'aadhar', 'number', 'q', 'query'],
        'family': ['adhar', 'aadhar', 'number', 'term', 'q'],
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
        'leakpro': ['number', 'num', 'q', 'query']
    };
    
    const keys = paramMap[endpoint] || ['q', 'query', 'number', 'num'];
    let value = null;
    for (let key of keys) {
        if (params[key]) { value = params[key]; break; }
    }
    
    if (!value) {
        return res.status(400).json({
            success: false,
            error: `❌ Parameter chahiye`,
            example: `/api/${endpoint}?${keys[0]}=VALUE`
        });
    }
    
    // URL banayein
    let url = apiUrl;
    const replacements = {
        '{query}': encodeURIComponent(value),
        '{number}': encodeURIComponent(value),
        '{num}': encodeURIComponent(value),
        '{adhar}': encodeURIComponent(value),
        '{email}': encodeURIComponent(value),
        '{vehicle}': encodeURIComponent(value),
        '{username}': encodeURIComponent(value),
        '{uid}': encodeURIComponent(value),
        '{ifsc}': encodeURIComponent(value),
        '{pan}': encodeURIComponent(value),
        '{ip}': encodeURIComponent(value),
        '{pincode}': encodeURIComponent(value),
        '{pin}': encodeURIComponent(value)
    };
    
    for (let [key, val] of Object.entries(replacements)) {
        url = url.replace(new RegExp(key, 'g'), val);
    }
    
    try {
        console.log(`📡 [${endpoint}] → ${url}`);
        
        const response = await axios({
            method: req.method,
            url: url,
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        let data = response.data;
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) {}
        }
        
        res.json({
            success: true,
            endpoint: endpoint,
            query: value,
            data: cleanData(data)
        });
        
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            endpoint: endpoint,
            error: error.message
        });
    }
});

// =============================================
// 📋 UNIQUE APIS LIST
// =============================================

app.get('/api/list', (req, res) => {
    const list = Object.keys(APIS).map(name => {
        const paramMap = {
            'num': 'number', 'num-new': 'number', 'num-india': 'number',
            'num-pak': 'number', 'telegram-num': 'number',
            'adhar': 'adhar', 'family': 'adhar',
            'email': 'email',
            'vehicle': 'vehicle', 'vehicle-detail': 'vehicle', 'rc': 'vehicle',
            'insta': 'username', 'telegram': 'username', 'github': 'username',
            'bgmi': 'uid', 'freefire': 'uid',
            'bank': 'ifsc', 'pan': 'pan',
            'ip': 'ip', 'pincode': 'pincode',
            'leakpro': 'number'
        };
        const param = paramMap[name] || 'query';
        return {
            name: name,
            param: param,
            example: `/${name}?${param}=VALUE`
        };
    });
    
    res.json({
        success: true,
        total: list.length,
        apis: list
    });
});

// =============================================
// 🏠 HOME
// =============================================

app.get('/', (req, res) => {
    const html = Object.keys(APIS).map(name => {
        const paramMap = {
            'num': 'number', 'num-new': 'number', 'num-india': 'number',
            'num-pak': 'number', 'telegram-num': 'number',
            'adhar': 'adhar', 'family': 'adhar',
            'email': 'email',
            'vehicle': 'vehicle', 'vehicle-detail': 'vehicle', 'rc': 'vehicle',
            'insta': 'username', 'telegram': 'username', 'github': 'username',
            'bgmi': 'uid', 'freefire': 'uid',
            'bank': 'ifsc', 'pan': 'pan',
            'ip': 'ip', 'pincode': 'pincode',
            'leakpro': 'number'
        };
        const param = paramMap[name] || 'query';
        return `<li><b>/${name}</b> → ?${param}=VALUE</li>`;
    }).join('');
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>🚀 Unique API Proxy</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: #0a0e1a; color: #e0e0e0; font-family: Arial, sans-serif; padding: 20px; }
                .container { max-width: 900px; margin: auto; }
                h1 { color: #00d4ff; text-align: center; font-size: 2.5rem; }
                .subtitle { text-align: center; color: #8892b0; margin-bottom: 30px; }
                .box { background: #141b2d; border: 1px solid #1e2a45; border-radius: 12px; padding: 25px; }
                .box h3 { color: #00d4ff; margin-bottom: 15px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
                li { padding: 8px 12px; border-bottom: 1px solid #1e2a45; list-style: none; font-size: 14px; }
                li:hover { background: #1a2340; }
                .badge { color: #4ade80; }
                .stats { display: flex; gap: 20px; justify-content: center; margin: 20px 0; }
                .stat { background: #141b2d; padding: 10px 25px; border-radius: 8px; border: 1px solid #1e2a45; text-align: center; }
                .stat .num { color: #00d4ff; font-size: 24px; font-weight: bold; }
                .stat .label { color: #8892b0; font-size: 12px; }
                .example { background: #0a0e1a; padding: 15px; border-radius: 6px; margin-top: 20px; color: #fbbf24; font-size: 13px; }
                .footer { text-align: center; margin-top: 30px; color: #4a5568; }
                @media (max-width: 600px) {
                    .grid { grid-template-columns: 1fr; }
                    h1 { font-size: 1.8rem; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Unique API Proxy</h1>
                <p class="subtitle">${Object.keys(APIS).length} Unique APIs - No Duplicates!</p>
                
                <div class="stats">
                    <div class="stat"><div class="num">${Object.keys(APIS).length}</div><div class="label">Total APIs</div></div>
                    <div class="stat"><div class="num">✅</div><div class="label">All Unique</div></div>
                </div>
                
                <div class="box">
                    <h3>📡 Available Endpoints:</h3>
                    <div class="grid"><ul style="grid-column: 1/-1;">${html}</ul></div>
                    
                    <div class="example">
                        <strong>🔍 Examples:</strong><br>
                        /api/num?number=9876543210<br>
                        /api/adhar?adhar=123456789012<br>
                        /api/vehicle?vehicle=DL01AB1234<br>
                        /api/email?email=test@gmail.com<br>
                        /api/insta?username=john_doe<br>
                        /api/bank?ifsc=SBIN0001234
                    </div>
                </div>
                
                <div class="footer">
                    💡 <a href="/api/list" style="color: #00d4ff;">/api/list</a> - Sari APIs ka JSON
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
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 Total Unique APIs: ${Object.keys(APIS).length}\n`);
    });
}
