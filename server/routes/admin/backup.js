const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../db/chitfund.db');

const upload = multer({ dest: path.join(__dirname, '../../scratch/') });

router.get('/download', (req, res) => {
    res.download(dbPath, `chitfund_backup_${new Date().toISOString().split('T')[0]}.db`);
});

router.post('/restore', upload.single('dbfile'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // In a real scenario, we should close the db connection, overwrite, and restart it.
    // For simplicity, we just copy over and require server restart.
    fs.copyFileSync(req.file.path, dbPath);
    fs.unlinkSync(req.file.path);

    res.json({ success: true, message: 'Database restored. Server restart may be required.' });
});

module.exports = router;
