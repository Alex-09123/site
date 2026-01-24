// server/routes/users.js
const router   = require('express').Router();
const { body, validationResult } = require('express-validator');
const auth     = require('../middleware/auth');
const User     = require('../models/User');
const upload   = require('../utils/upload');

// ---------- Получить данные текущего пользователя ----------
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// ---------- Обновить профиль ----------
router.put(
    '/me',
    auth,
    upload.single('avatar'),               // обработка загрузки (может быть пусто)
    [
        body('name').optional().isLength({ min: 2 }).trim(),
        body('email').optional().isEmail().normalizeEmail(),
        body('password').optional().isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const updates = { ...req.body };
        if (req.file) updates.avatar = `/uploads/${req.file.filename}`;

        // если меняем пароль – он будет захеширован пред‑сохранением схемы
        try {
            const user = await User.findById(req.user);
            if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

            Object.assign(user, updates);
            await user.save();

            const { password, ...userData } = user.toObject();
            res.json(userData);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    }
);

// ---------- Удалить аккаунт ----------
router.delete('/me', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user);
        res.json({ msg: 'Пользователь удалён' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;