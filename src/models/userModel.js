const db = require('../data/db');

const User = {
    create: (username, password, callback) => {
        db.query(
            'INSERT INTO users (username, password, balance) VALUES (?, ?, 100.00)', 
            [username, password], 
            (err, results) => {
                callback(err, results);
            }
        );
    },

    findByUsername: (username, callback) => {
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
            callback(err, rows ? rows[0] : null);
        });
    },

    getById: (id, callback) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
            callback(err, rows ? rows[0] : null);
        });
    }
};

module.exports = User;