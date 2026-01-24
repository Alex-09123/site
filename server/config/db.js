// server/config/db.js
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB подключена');
    } catch (err) {
        console.error('❌ Ошибка подключения к MongoDB', err);
        process.exit(1);
    }
};

module.exports = connectDB;