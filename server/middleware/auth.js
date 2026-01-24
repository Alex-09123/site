// server/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/../.env' });

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'Нет токена, доступ запрещён' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;      // сохраняем id пользователя в объекте req
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Недействительный токен' });
    }
};