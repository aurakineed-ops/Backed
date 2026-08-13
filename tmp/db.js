// db.js - Pure Memory Storage (No SQLite)
console.log('📊 Initializing memory query logger...');

// In-memory storage
const store = {
  queries: [],
  analytics: {},
  id: 0
};

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
        // console.log(`✅ Query logged: ${endpoint} (ID: ${store.id})`);
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
        // Sort by total_queries DESC
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
  if (queryCount > 0 || endpointCount > 0) {
    console.log(`📊 Memory Store: ${queryCount} queries, ${endpointCount} endpoints`);
  }
}, 30000);

console.log('✅ Memory query logger ready!');
console.log(`📊 Initial stats: 0 queries, 0 endpoints`);

module.exports = db;
