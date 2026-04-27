const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use('/auth', require('./routes/authRoutes'));
app.use('/trade', require('./routes/tradeRoutes'));
app.use('/items', require('./routes/itemRoutes'));

app.get('/', (req, res) => res.redirect('/items/shop'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));