const crypto = require('crypto');

exports.hashPassword = (pw) => {
    return crypto.createHash('sha256').update(pw).digest('hex');
};

exports.compare = (originalPw, hashedPw) => {
    return exports.hashPassword(originalPw) === hashedPw;
};