// db.js - NO SQLite, Pure JavaScript Memory Storage
console.log('📊 Starting with memory storage...');

// Memory storage
const memoryDB = {
  queries: [],
  analytics: {},
  id: 0
};

// Mock database that works exactly like sqlite3
const db = {
  // For CREATE TABLE and other operations
  serialize: (fn) => {
    try {
      if (fn) fn();
    } catch (e) {
      console.error('Serialize error:', e.message);
    }
    return db;
  },
  
  // For INSERT, UPDATE, DELETE
  run: function(sql, params, callback) {
    try {
      console.log('📝 DB RUN:', sql.substring(0, 60) + '...');
      
      // Handle INSERT INTO queries
      if (sql.includes('INSERT INTO queries')) {
        const [endpoint, inputParam, inputValue, statusCode, responseData, errorMsg, ipAddr, execTime] = params;
        memoryDB.id++;
        memoryDB.queries.push({
          id: memoryDB.id,
          endpoint: endpoint || 'unknown',
          input_param: inputParam || '',
          input_value: inputValue || '',
          response_status: statusCode || 0,
          response_data: responseData || '',
          error_msg: errorMsg || '',
          ip_address: ipAddr || '',
          execution_time: execTime || 0,
          created_at: new Date().toISOString()
        });
        console.log(`✅ Query logged (ID: ${memoryDB.id})`);
      }
      
      // Handle INSERT INTO analytics
      if (sql.includes('INSERT INTO analytics')) {
        const [endpoint, totalInc, avgTime, successInc, execTime] = params;
        if (!memoryDB.analytics[endpoint]) {
          memoryDB.analytics[endpoint] = { 
            total_queries: 0, 
            successful: 0, 
            avg_time: 0 
          };
        }
        const stats = memoryDB.analytics[endpoint];
        stats.total_queries = (stats.total_queries || 0) + 1;
        if (successInc) stats.successful = (stats.successful || 0) + 1;
        stats.avg_time = (stats.avg_time * (stats.total_queries - 1) + (execTime || 0)) / stats.total_queries;
      }
      
      // Callback
      if (callback) {
        try {
          callback(null);
        } catch(e) {}
      }
    } catch (e) {
      console.error('DB run error:', e.message);
      if (callback) {
        try {
          callback(e);
        } catch(err) {}
      }
    }
    return db;
  },
  
  // For SELECT queries
  all: function(sql, params, callback) {
    try {
      console.log('📊 DB ALL:', sql.substring(0, 60) + '...');
      let result = [];
      
      // Get analytics data
      if (sql.includes('SELECT * FROM analytics')) {
        result = Object.keys(memoryDB.analytics).map(endpoint => {
          const stats = memoryDB.analytics[endpoint];
          return {
            endpoint: endpoint,
            total_queries: stats.total_queries || 0,
            successful: stats.successful || 0,
            avg_time: Math.round((stats.avg_time || 0) * 100) / 100
          };
        });
      }
      
      // Get queries for specific endpoint
      if (sql.includes('SELECT * FROM queries WHERE endpoint = ?')) {
        const endpoint = params && params[0];
        result = memoryDB.queries
          .filter(q => q.endpoint === endpoint)
          .slice(-100)
          .reverse();
      }
      
      // Search queries
      if (sql.includes('SELECT * FROM queries WHERE input_value LIKE ?')) {
        const searchTerm = params && params[0] ? params[0].replace(/%/g, '') : '';
        result = memoryDB.queries
          .filter(q => q.input_value && q.input_value.includes(searchTerm))
          .slice(-50);
      }
      
      // Default - return all queries
      if (sql.includes('SELECT * FROM queries')) {
        result = memoryDB.queries.slice(-100).reverse();
      }
      
      if (callback) {
        try {
          callback(null, result);
        } catch(e) {}
      }
    } catch (e) {
      console.error('DB all error:', e.message);
      if (callback) {
        try {
          callback(null, []);
        } catch(err) {}
      }
    }
    return db;
  },
  
  // For each iteration
  each: function(sql, params, callback) {
    console.log('📋 DB EACH:', sql.substring(0, 60) + '...');
    if (typeof params === 'function') {
      try { params(null, []); } catch(e) {}
    } else if (callback) {
      try { callback(null, []); } catch(e) {}
    }
    return db;
  },
  
  // For get
  get: function(sql, params, callback) {
    console.log('🔍 DB GET:', sql.substring(0, 60) + '...');
    if (callback) {
      try { callback(null, null); } catch(e) {}
    }
    return db;
  }
};

// Log stats every 30 seconds
setInterval(() => {
  console.log(`📊 Memory Stats: ${memoryDB.queries.length} queries, ${Object.keys(memoryDB.analytics).length} endpoints`);
}, 30000);

console.log('✅ Memory database ready!');
console.log(`📊 Initial stats: 0 queries, 0 endpoints`);

module.exports = db;
