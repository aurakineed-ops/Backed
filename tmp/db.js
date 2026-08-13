// db.js - Pure memory storage (No SQLite)
console.log('📊 Using pure memory storage (no SQLite)');

const store = {
  queries: [],
  analytics: {},
  id: 0
};

const db = {
  serialize: (fn) => { if (fn) fn(); return db; },
  
  run: (sql, params, callback) => {
    try {
      if (sql.includes('INSERT INTO queries')) {
        const [endpoint, inputParam, inputValue, statusCode, responseData, errorMsg, ipAddr, execTime] = params;
        store.id++;
        store.queries.push({
          id: store.id,
          endpoint,
          input_param: inputParam,
          input_value: inputValue,
          response_status: statusCode,
          response_data: responseData,
          error_msg: errorMsg,
          ip_address: ipAddr,
          execution_time: execTime,
          created_at: new Date().toISOString()
        });
      }
      
      if (sql.includes('INSERT INTO analytics')) {
        const [endpoint, totalInc, avgTime, successInc, execTime] = params;
        if (!store.analytics[endpoint]) {
          store.analytics[endpoint] = { total_queries: 0, successful: 0, avg_time: 0 };
        }
        const a = store.analytics[endpoint];
        a.total_queries++;
        if (successInc) a.successful++;
        a.avg_time = (a.avg_time * (a.total_queries - 1) + execTime) / a.total_queries;
      }
      
      if (callback) callback(null);
    } catch (e) {
      console.error('DB error:', e.message);
      if (callback) callback(null);
    }
    return db;
  },
  
  all: (sql, params, callback) => {
    try {
      let result = [];
      if (sql.includes('SELECT * FROM analytics')) {
        result = Object.entries(store.analytics).map(([endpoint, stats]) => ({
          endpoint,
          total_queries: stats.total_queries,
          successful: stats.successful,
          avg_time: Math.round(stats.avg_time * 100) / 100
        }));
      }
      if (sql.includes('SELECT * FROM queries WHERE endpoint = ?')) {
        const endpoint = params[0];
        result = store.queries.filter(q => q.endpoint === endpoint).slice(-100).reverse();
      }
      if (sql.includes('SELECT * FROM queries WHERE input_value LIKE ?')) {
        const search = params[0].replace(/%/g, '');
        result = store.queries.filter(q => q.input_value && q.input_value.includes(search)).slice(-50);
      }
      if (callback) callback(null, result);
    } catch (e) {
      if (callback) callback(null, []);
    }
    return db;
  },
  
  each: (sql, params, callback) => {
    if (typeof params === 'function') params(null, []);
    else if (callback) callback(null, []);
    return db;
  },
  
  get: (sql, params, callback) => {
    if (callback) callback(null, null);
    return db;
  }
};

setInterval(() => {
  console.log(`📊 Memory: ${store.queries.length} queries, ${Object.keys(store.analytics).length} endpoints`);
}, 60000);

console.log('✅ Memory storage ready');
module.exports = db;
