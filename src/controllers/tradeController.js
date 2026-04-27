const db = require('../data/db');

const redirectTrade = (res) => res.redirect('/trade/trade');

exports.buyItem = (req, res) => {
    const itemId = req.params.id;
    const buyerId = req.session.userId;

    db.query('SELECT price FROM items WHERE id = ? AND owner_id IS NULL', [itemId], (err, items) => {
        if (err || !items.length) return res.status(400).send("Przedmiot jest już niedostępny.");
        const itemPrice = items[0].price;

        db.query('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?', [itemPrice, buyerId, itemPrice], (err, result) => {
            if (err || result.affectedRows === 0) return res.status(400).send("Brak wystarczających środków.");

            db.query('UPDATE items SET owner_id = ? WHERE id = ?', [buyerId, itemId], () => {
                res.redirect('/items/inventory');
            });
        });
    });
};

exports.sellItem = (req, res) => {
    const itemId = req.params.id;
    const sellerId = req.session.userId;

    db.query('SELECT price FROM items WHERE id = ? AND owner_id = ?', [itemId, sellerId], (err, items) => {
        if (err || !items.length) return res.status(400).send("Nie posiadasz tego przedmiotu.");
        const itemPrice = items[0].price;

        db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [itemPrice, sellerId], () => {
            db.query('UPDATE items SET owner_id = NULL WHERE id = ?', [itemId], () => {
                res.redirect('/items/inventory');
            });
        });
    });
};


exports.getTradeMenu = (req, res) => {
    const userId = req.session.userId;

    const sql = `
        SELECT * FROM items WHERE owner_id = ?;
        SELECT i.*, u.username as owner_name FROM items i JOIN users u ON i.owner_id = u.id WHERE i.owner_id != ? AND i.owner_id IS NOT NULL;
        SELECT id, username FROM users WHERE id != ?;
        SELECT tr.*, u.username as sender_name, i.name as item_name, off_i.name as offered_item_name
        FROM trade_requests tr JOIN users u ON tr.sender_id = u.id LEFT JOIN items i ON tr.item_id = i.id
        LEFT JOIN items off_i ON tr.offered_item_id = off_i.id WHERE tr.receiver_id = ?;
        SELECT * FROM users WHERE id = ?`;

    db.query(sql, [userId, userId, userId, userId, userId], (err, results) => {
        if (err) return res.status(500).send("Błąd bazy danych.");

        res.render('pages/trade', {
            userItems: results[0],
            otherItems: results[1],
            allUsers: results[2],
            incomingRequests: results[3],
            user: results[4][0]
        });
    });
};

exports.sendTradeRequest = (req, res) => {
    const { receiverId, wantedItemId, offeredItemId, offeredMoney } = req.body;
    const senderId = req.session.userId;

    const createRequest = (targetReceiverId, targetWantedItemId) => {
        const sql = 'INSERT INTO trade_requests (sender_id, receiver_id, item_id, offered_item_id, offered_money) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [senderId, targetReceiverId, targetWantedItemId, offeredItemId || null, offeredMoney || 0], () => {
            redirectTrade(res);
        });
    };

    if (wantedItemId) {
        db.query('SELECT owner_id FROM items WHERE id = ?', [wantedItemId], (err, items) => {
            if (err || !items.length) return res.send("Przedmiot nie istnieje.");
            createRequest(items[0].owner_id, wantedItemId);
        });
    } else {
        createRequest(receiverId, null);
    }
};

exports.acceptTradeRequest = (req, res) => {
    const requestId = req.params.id;
    const receiverId = req.session.userId;

    const sqlFind = `
        SELECT tr.*, u_sender.username as sender_name, u_receiver.username as receiver_name, i.name as wanted_item_name, off_i.name as offered_item_name
        FROM trade_requests tr JOIN users u_sender ON tr.sender_id = u_sender.id JOIN users u_receiver ON tr.receiver_id = u_receiver.id
        LEFT JOIN items i ON tr.item_id = i.id LEFT JOIN items off_i ON tr.offered_item_id = off_i.id
        WHERE tr.id = ? AND tr.receiver_id = ?`;

    db.query(sqlFind, [requestId, receiverId], (err, results) => {
        if (err || !results.length) return res.send("Oferta nieaktualna.");
        const tradeOffer = results[0];

        db.query('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?', [tradeOffer.offered_money, tradeOffer.sender_id, tradeOffer.offered_money], (err, result) => {
            if (err || result.affectedRows === 0) return res.send("Nadawca nie posiada już wystarczających środków.");

            db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [tradeOffer.offered_money, receiverId]);
            
            if (tradeOffer.item_id) {
                db.query('UPDATE items SET owner_id = ? WHERE id = ?', [tradeOffer.sender_id, tradeOffer.item_id]);
            }
            if (tradeOffer.offered_item_id) {
                db.query('UPDATE items SET owner_id = ? WHERE id = ?', [receiverId, tradeOffer.offered_item_id]);
            }

            const sqlHistory = `INSERT INTO trade_history (sender_name, receiver_name, item_given, item_received, money_transferred) VALUES (?, ?, ?, ?, ?)`;
            db.query(sqlHistory, [tradeOffer.sender_name, tradeOffer.receiver_name, tradeOffer.offered_item_name || 'Brak', tradeOffer.wanted_item_name || 'Brak', tradeOffer.offered_money]);

            db.query('DELETE FROM trade_requests WHERE id = ?', [requestId], () => redirectTrade(res));
        });
    });
};

exports.declineTradeRequest = (req, res) => {
    db.query('DELETE FROM trade_requests WHERE id = ? AND receiver_id = ?', [req.params.id, req.session.userId], () => {
        redirectTrade(res);
    });
};