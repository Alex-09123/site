// server/routes/auth.js
const router   = require('express').Router();
const { body, validationResult } = require('express-validator');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
require('dotenv').config({ path: __dirname + '/../.env' });

/* -------- Регистрация -------- */
router.post(
    '/register',
    [
        body('name').isLength({ min: 2 }).trim(),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ msg: 'Пользователь уже существует' });

            user = new User({ name, email, password });
            await user.save();

            const payload = { id: user.id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.TOKEN_EXPIRES,
            });

            res.json({ token, user: { id: user.id, name, email, avatar: user.avatar } });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    }
);

/* -------- Логин -------- */
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ msg: 'Неправильный email или пароль' });

            const isMatch = await user.comparePassword(password);
            if (!isMatch) return res.status(400).json({ msg: 'Неправильный email или пароль' });

            const payload = { id: user.id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.TOKEN_EXPIRES,
            });

            res.json({ token, user: { id: user.id, name: user.name, email, avatar: user.avatar } });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;