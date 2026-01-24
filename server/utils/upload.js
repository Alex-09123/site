// server/utils/upload.js
const multer = require('multer');
const path   = require('path');
require('dotenv').config({ path: __dirname + '/../../.env' });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', process.env.AVATAR_UPLOAD_PATH));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `${req.user}-${Date.now()}${ext}`;
        cb(null, fileName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const isOk = allowed.test(path.extname(file.originalname).toLowerCase());
    if (isOk) cb(null, true);
    else cb(new Error('Только изображения (jpeg, jpg, png)'));
};

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_AVATAR_SIZE) },
    fileFilter,
});

module.exports = upload;