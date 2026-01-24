// server/app.js
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./config/db');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();

// --- Middleware ---
app.use(cors());                     // разрешаем запросы с любого домена (можно ограничить)
app.use(express.json());             // парсит JSON‑тела
app.use(express.urlencoded({ extended: true }));

// Статические файлы (клиент) — обслуживаются напрямую
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Подключаем роутеры ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Обработчик 404 для API
app.use('/api/*', (req, res) => res.status(404).json({ msg: 'Not found' }));

// --- Запуск сервера ---
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Сервер запущен на http://localhost:${PORT}`));
});