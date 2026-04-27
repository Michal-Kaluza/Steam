const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tradeController'); 
const isAuth = require('../middleware/auth');

router.post('/buy/:id', isAuth, ctrl.buyItem);
router.post('/sell/:id', isAuth, ctrl.sellItem);

router.get('/trade', isAuth, ctrl.getTradeMenu);
router.post('/request', isAuth, ctrl.sendTradeRequest);
router.post('/accept/:id', isAuth, ctrl.acceptTradeRequest);
router.post('/decline/:id', isAuth, ctrl.declineTradeRequest);

module.exports = router;