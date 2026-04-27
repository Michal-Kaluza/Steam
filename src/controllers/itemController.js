const Item = require('../models/itemModel');
const User = require('../models/userModel');

exports.getShop = (req, res) => {
    Item.getAllAvailable((err, items) => {
        if (err) return res.status(500).send("Błąd bazy danych");
        
        let user = null;
        if (req.session.userId) {
            User.getById(req.session.userId, (err, userData) => {
                res.render('pages/shop', { items, user: userData });
            });
        } else {
            res.render('pages/shop', { items, user: null });
        }
    });
};

exports.getInventory = (req, res) => {
    Item.getUserItems(req.session.userId, (err, items) => {
        if (err) return res.status(500).send("Błąd");
        
        User.getById(req.session.userId, (err, user) => {
            res.render('pages/inventory', { items, user });
        });
    });
};