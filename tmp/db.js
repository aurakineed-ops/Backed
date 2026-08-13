// db.js - File-based storage in /tmp (No SQLite)
console.log('📊 Initializing file-based storage in /tmp...');

const fs = require('fs');
const path = require('path');

// Use /tmp directory (writable on Render)
const DB_FILE = '/tmp/osint-data.json';
console.log('📁 Database file:', DB_FILE);

// In-memory cache
let store = {
  queries: [],
  analytics: {},
  id: 0
};

// Load data from file if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    store = parsed;
    console.log(`✅ Loaded ${store.queries.length} queries from file`);
  } else {
    console.log('📄 No existing data file, starting fresh');
    saveToFile();
  }
} catch (e) {
  console.log('⚠️ Could not load data file, starting fresh');
  saveToFile();
}

// Save to file function
function saveToFile() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('❌ Failed to save to file:', e.message);
  }
}

// Save every 10 seconds
setInterval(saveToFile, 10000);

// Save on exit
process.on('SIGTERM', () => {
  console.log('💾 Saving data before exit...');
  saveToFile();
  process.exit(0);
});

const db = {
  serialize: (fn) => {
    try { 
      if (fn) fn(); 
    } catch(e) { 
      console.error('Serialize error:', e.message); 
    }
    return db;
  },
  
  run: (sql, params, callback) => {
    try {
      // Handle INSERT INTO queries
      if (sql.includes('INSERT INTO queries')) {
        const [endpoint, inputParam, inputValue, statusCode, responseData, errorMsg, ipAddr, execTime] = params;
        store.id++;
        store.queries.push({
          id: store.id,
          endpoint: endpoint || 'unknown',
          input_param: inputParam || '',
          input_value: inputValue || '',
          response_status: statusCode || 0,
          response_data: typeof responseData === 'string' ? responseData : JSON.stringify(responseData || {}),
          error_msg: errorMsg || '',
          ip_address: ipAddr || '',
          execution_time: execTime || 0,
          created_at: new Date().toISOString()
        });
        // Auto-save after each insert (but debounced)
        if (store.queries.length % 5 === 0) {
          saveToFile();
        }
      }
      
      // Handle INSERT INTO analytics
      if (sql.includes('INSERT INTO analytics')) {
        const [endpoint, totalInc, avgTime, successInc, execTime] = params;
        if (!store.analytics[endpoint]) {
          store.analytics[endpoint] = { total_queries: 0, successful: 0, avg_time: 0 };
        }
        const stats = store.analytics[endpoint];
        stats.total_queries = (stats.total_queries || 0) + 1;
        if (successInc) stats.successful = (stats.successful || 0) + 1;
        stats.avg_time = (stats.avg_time * (stats.total_queries - 1) + (execTime || 0)) / stats.total_queries;
        saveToFile();
      }
      
      if (callback) {
        try { callback(null); } catch(e) {}
      }
    } catch(e) {
      console.error('DB run error:', e.message);
      if (callback) {
        try { callback(null); } catch(err) {}
      }
    }
    return db;
  },
  
  all: (sql, params, callback) => {
    try {
      let result = [];
      
      // Get analytics stats
      if (sql.includes('SELECT endpoint, total_queries, successful, ROUND(avg_time, 2) as avg_time FROM analytics')) {
        result = Object.keys(store.analytics).map(endpoint => {
          const stats = store.analytics[endpoint];
          return {
            endpoint: endpoint,
            total_queries: stats.total_queries || 0,
            successful: stats.successful || 0,
            avg_time: Math.round((stats.avg_time || 0) * 100) / 100
          };
        });
        result.sort((a, b) => b.total_queries - a.total_queries);
      }
      // Get queries for specific endpoint
      else if (sql.includes('SELECT * FROM queries WHERE endpoint = ?')) {
        const endpoint = params?.[0] || '';
        result = store.queries
          .filter(q => q.endpoint === endpoint)
          .slice(-100)
          .reverse();
      }
      // Search queries
      else if (sql.includes('SELECT * FROM queries WHERE input_value LIKE ? OR input_param LIKE ?')) {
        const search = params?.[0]?.replace(/%/g, '') || '';
        result = store.queries
          .filter(q => 
            (q.input_value && q.input_value.includes(search)) || 
            (q.input_param && q.input_param.includes(search))
          )
          .slice(-50)
          .reverse();
      }
      // Default - return all queries
      else if (sql.includes('SELECT * FROM queries')) {
        result = store.queries.slice(-100).reverse();
      }
      
      if (callback) {
        try { callback(null, result); } catch(e) {}
      }
    } catch(e) {
      console.error('DB all error:', e.message);
      if (callback) {
        try { callback(null, []); } catch(err) {}
      }
    }
    return db;
  },
  
  each: (sql, params, callback) => {
    if (typeof params === 'function') {
      try { params(null, []); } catch(e) {}
    } else if (callback) {
      try { callback(null, []); } catch(e) {}
    }
    return db;
  },
  
  get: (sql, params, callback) => {
    if (callback) {
      try { callback(null, null); } catch(e) {}
    }
    return db;
  }
};

// Log stats every 30 seconds
setInterval(() => {
  const queryCount = store.queries.length;
  const endpointCount = Object.keys(store.analytics).length;
  console.log(`📊 File Store: ${queryCount} queries, ${endpointCount} endpoints [${DB_FILE}]`);
}, 30000);

console.log('✅ File-based storage ready!');
console.log(`📊 Initial stats: ${store.queries.length} queries, ${Object.keys(store.analytics).length} endpoints`);
console.log(`📁 Data saved to: ${DB_FILE}`);

module.exports = db;
