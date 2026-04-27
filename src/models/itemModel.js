const db = require('../data/db');

const Item = {
    getAllAvailable: (callback) => {
        db.query('SELECT * FROM items WHERE owner_id IS NULL', (err, rows) => {
            callback(err, rows);
        });
    },
    getUserItems: (userId, callback) => {
        db.query('SELECT * FROM items WHERE owner_id = ?', [userId], (err, rows) => {
            callback(err, rows);
        });
    }
};

module.exports = Item;