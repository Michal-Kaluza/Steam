const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/itemController');
const isAuth = require('../middleware/auth');

router.get('/shop', ctrl.getShop);
router.get('/inventory', isAuth, ctrl.getInventory);

module.exports = router;