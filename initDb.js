const pg = require('pg');

module.exports = function() {
    const pool = new pg.Pool({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: '020624' 
    });
    return { pool };
};