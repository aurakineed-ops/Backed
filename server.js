// =============================================
// 🎯 ULTRA SIMPLE API PROXY - Bas APIs paste karo!
// =============================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// =============================================
// 📝 YAHAN APNI APIs PASTE KARO - Bas itna easy!
// Format: 'name': 'https://api.com?key=YOUR_KEY&q={query}'
// {query} - ye automatic user ke input se replace hoga
// =============================================

const APIS = {
    // 🔥 Example APIs - Apni yahan paste karo
    'leakpro': 'https://raxxosint.onrender.com/leakosint?key=Customer&quiry={query}',
    'vehicle': 'https://leakapi.dpdns.org/vehicle-info?registration_number={query}',
    'telegram': 'https://tg-to-num-ten.vercel.app/tg?key=sahil_X&num={query}',
    'family': 'https://osint.invalidayushh.workers.dev/adhar?key=Sahil&q={query}',
    'number': 'https://osint.invalidayushh.workers.dev/num?key=Sahil&q={query}',
    'number-new': 'https://leakapi.dpdns.org/search?q={query}',
    'email': 'https://osint.invalidayushh.workers.dev/email?key=Sahil&q={query}',
    'insta': 'https://osint.invalidayushh.workers.dev/insta?key=Sahil&q={query}',
    'vehicle-detail': 'https://leakapi.dpdns.org/api/vehicle?vehicle={query}',
    'family-search': 'https://ayaanmods.site/family.php?key=YOUR_SUBHXCO_KEY&term={query}',
    'num-india': 'https://ft-osint-api.duckdns.org/api/number?key=sahil-new&num={query}',
    'num-pak': 'https://ft-osint-api.duckdns.org/api/pk?key=sahil-new&number={query}',
    'bank': 'https://ft-osint-api.duckdns.org/api/ifsc?key=sahil-new&ifsc={query}',
    'pan': 'https://ft-osint-api.duckdns.org/api/pan?key=sahil-new&pan={query}',
    'rc': 'https://leakapi.dpdns.org/rc?registration_number={query}',
    'ip': 'https://ft-osint-api.duckdns.org/api/ip?key=sahil-new&ip={query}',
    'pincode': 'https://ft-osint-api.duckdns.org/api/pincode?key=sahil-new&pin={query}',
    'github': 'https://ft-osint-api.duckdns.org/api/git?key=sahil-new&username={query}',
    'bgmi': 'https://ft-osint-api.duckdns.org/api/bgmi?key=sahil-new&uid={query}',
    'freefire': 'https://ft-osint-api.duckdns.org/api/ff?key=sahil-new&uid={query}',
};

// =============================================
// 🧹 Clean karna hai toh ye fields remove hongi
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
    'Support', 'help', 'Help'
];

// =============================================
// ⚙️ ENGINE - Kuch mat badlo, sab auto hai!
// =============================================

// Clean response function
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

// Get query from request
function getQuery(req) {
    const all = { ...req.query, ...req.body, ...req.params };
    const keys = ['q', 'query', 'number', 'num', 'id', 'username', 'term', 'pin', 'ip', 'uid', 'ifsc', 'pan', 'email', 'vehicle'];
    
    for (let key of keys) {
        if (all[key]) return all[key];
    }
    return null;
}

// Main API handler
app.all('/api/:name', async (req, res) => {
    const name = req.params.name;
    const apiUrl = APIS[name];
    
    if (!apiUrl) {
        return res.status(404).json({
            success: false,
            error: `❌ API '${name}' nahi mili`,
            available: Object.keys(APIS)
        });
    }
    
    const query = getQuery(req);
    if (!query) {
        return res.status(400).json({
            success: false,
            error: '❌ Query parameter nahi mila (q, number, id, etc.)'
        });
    }
    
    // Replace {query} with actual value
    const url = apiUrl.replace(/\{query\}/g, encodeURIComponent(query));
    
    try {
        console.log(`📡 [${name}] → ${url}`);
        
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
        
        // Clean and send
        const cleaned = cleanData(data);
        res.json({
            success: true,
            api: name,
            query: query,
            data: cleaned
        });
        
    } catch (error) {
        console.error(`❌ [${name}] Error:`, error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            api: name,
            error: error.message,
            details: error.response?.data || null
        });
    }
});

// 📋 Get all APIs list
app.get('/api/list', (req, res) => {
    const list = Object.keys(APIS).map(name => ({
        name: name,
        url: APIS[name]
    }));
    res.json({
        success: true,
        total: list.length,
        apis: list
    });
});

// 🏥 Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: '✅ OK',
        apis: Object.keys(APIS).length,
        timestamp: new Date().toISOString()
    });
});

// 🏠 Home - Simple HTML
app.get('/', (req, res) => {
    const apiList = Object.keys(APIS).map(name => 
        `<li><strong>/${name}</strong> → ${APIS[name]}</li>`
    ).join('');
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🚀 API Proxy</title>
            <style>
                body { font-family: Arial; background: #0a0e1a; color: #e0e0e0; padding: 20px; }
                .container { max-width: 900px; margin: auto; }
                h1 { color: #00d4ff; }
                .api-list { background: #141b2d; padding: 20px; border-radius: 10px; }
                li { padding: 8px; border-bottom: 1px solid #1e2a45; list-style: none; }
                .badge { color: #00d4ff; }
                .example { color: #4ade80; font-size: 14px; }
                .footer { margin-top: 30px; color: #4a5568; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 API Proxy Server</h1>
                <p>Total APIs: <span class="badge">${Object.keys(APIS).length}</span></p>
                <div class="api-list">
                    <h3>📡 Available Endpoints:</h3>
                    <ul>${apiList}</ul>
                </div>
                <div class="example">
                    <h3>🔍 Example:</h3>
                    <p>GET /api/insta?username=example</p>
                    <p>GET /api/vehicle?number=DL01AB1234</p>
                </div>
                <div class="footer">💡 {query} automatic replace ho jayega</div>
            </div>
        </body>
        </html>
    `);
});

// =============================================
// 📦 EXPORT FOR VERCEL
// =============================================
module.exports = app;

// Local run
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 Total APIs: ${Object.keys(APIS).length}\n`);
        Object.keys(APIS).forEach(name => {
            console.log(`   /api/${name}`);
        });
        console.log('\n✅ Ready to go!\n');
    });
}
