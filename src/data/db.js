const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',   
    user: 'root',
    password: 'root',    
    database: 'game_market',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
});

module.exports = pool;
