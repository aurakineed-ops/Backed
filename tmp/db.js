// db.js - In-memory storage (resets on redeploy)
console.log('📊 Using in-memory storage');

// In-memory data store
const memoryStore = {
  queries: [],
  analytics: {}
};

let queryId = 0;

const db = {
  // For CREATE TABLE (ignore)
  serialize: (fn) => { 
    if (fn) fn(); 
    return db;
  },
  
  // For INSERT queries
  run: (query, params, callback) => {
    console.log('📝 DB RUN:', query.substring(0, 50) + '...');
    
    // Parse INSERT query
    if (query.includes('INSERT INTO queries')) {
      const [endpoint, inputParam, inputValue, statusCode, responseData, errorMsg, ipAddr, execTime] = params;
      const record = {
        id: ++queryId,
        endpoint,
        input_param: inputParam,
        input_value: inputValue,
        response_status: statusCode,
        response_data: responseData,
        error_msg: errorMsg,
        ip_address: ipAddr,
        execution_time: execTime,
        created_at: new Date().toISOString()
      };
      memoryStore.queries.push(record);
      console.log('✅ Query logged:', record.id);
      
      // Update analytics
      if (!memoryStore.analytics[endpoint]) {
        memoryStore.analytics[endpoint] = {
          total_queries: 0,
          successful: 0,
          avg_time: 0
        };
      }
      const stats = memoryStore.analytics[endpoint];
      stats.total_queries += 1;
      if (statusCode < 400) stats.successful += 1;
      // Update avg_time
      stats.avg_time = (stats.avg_time * (stats.total_queries - 1) + execTime) / stats.total_queries;
      
      if (callback) callback(null);
      return db;
    }
    
    if (query.includes('INSERT INTO analytics')) {
      const [endpoint, totalInc, avgTime, successInc, execTime] = params;
      if (!memoryStore.analytics[endpoint]) {
        memoryStore.analytics[endpoint] = {
          total_queries: 0,
          successful: 0,
          avg_time: 0
        };
      }
      const stats = memoryStore.analytics[endpoint];
      stats.total_queries += 1;
      if (successInc) stats.successful += 1;
      stats.avg_time = (stats.avg_time * (stats.total_queries - 1) + execTime) / stats.total_queries;
      
      if (callback) callback(null);
      return db;
    }
    
    if (callback) callback(null);
    return db;
  },
  
  // For SELECT queries
  all: (query, params, callback) => {
    console.log('📊 DB ALL:', query.substring(0, 50) + '...');
    
    // Parse SELECT query
    if (query.includes('SELECT * FROM analytics')) {
      const data = Object.entries(memoryStore.analytics).map(([endpoint, stats]) => ({
        endpoint,
        total_queries: stats.total_queries,
        successful: stats.successful,
        avg_time: Math.round(stats.avg_time * 100) / 100
      }));
      if (callback) callback(null, data);
      return db;
    }
    
    if (query.includes('SELECT * FROM queries WHERE endpoint = ?')) {
      const endpoint = params[0];
      const data = memoryStore.queries
        .filter(q => q.endpoint === endpoint)
        .slice(-100)
        .reverse();
      if (callback) callback(null, data);
      return db;
    }
    
    if (query.includes('SELECT * FROM queries WHERE input_value LIKE ?')) {
      const searchTerm = params[0].replace(/%/g, '');
      const data = memoryStore.queries
        .filter(q => q.input_value && q.input_value.includes(searchTerm))
        .slice(-50);
      if (callback) callback(null, data);
      return db;
    }
    
    if (callback) callback(null, []);
    return db;
  },
  
  // For SELECT queries with callback
  get: (query, params, callback) => {
    console.log('🔍 DB GET:', query.substring(0, 50) + '...');
    if (callback) callback(null, null);
    return db;
  },
  
  // For each iteration
  each: (query, params, callback) => {
    console.log('📋 DB EACH:', query.substring(0, 50) + '...');
    if (typeof params === 'function') {
      // params is actually callback
      const cb = params;
      cb(null, []);
    } else if (callback) {
      callback(null, []);
    }
    return db;
  }
};

// Log storage stats periodically
setInterval(() => {
  console.log(`📊 Memory: ${memoryStore.queries.length} queries, ${Object.keys(memoryStore.analytics).length} endpoints`);
}, 60000);

// Export
module.exports = db;

console.log('✅ In-memory database ready');
console.log(`📊 Storage: ${memoryStore.queries.length} queries in memory`);
