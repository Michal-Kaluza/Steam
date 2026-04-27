const User = require('../models/userModel');
const hash = require('../crypto/hash');

exports.getLogin = (req, res) => res.render('pages/auth/login', { user: null });
exports.getRegister = (req, res) => res.render('pages/auth/register', { user: null });

exports.postRegister = (req, res) => {
    const { username, password } = req.body;
    User.create(username, hash.hashPassword(password), (err) => {
        if (err) return res.status(400).send("Błąd rejestracji");
        res.redirect('/auth/login');
    });
};

exports.postLogin = (req, res) => {
    const { username, password } = req.body;
    User.findByUsername(username, (err, user) => {
        if (err || !user || !hash.compare(password, user.password)) {
            return res.status(400).send(`
                <script>
                    alert("Błędna nazwa użytkownika lub hasło!");
                    window.location.href = "/auth/login";
                </script>
            `);
        }
        req.session.userId = user.id;
        res.redirect('/');
    });
};