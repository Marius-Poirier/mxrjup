const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// ...

const PASSWORD = process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
    console.error("FATAL ERROR: ADMIN_PASSWORD is not set.");
    process.exit(1);
}

// Ensure directories exist
(async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating directories:', err);
    }
})();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR)
    },
    filename: function (req, file, cb) {
        // Sanitize filename and append timestamp to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
});

const upload = multer({ storage: storage });



// Auth Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Login Route
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Generic Data Endpoints
const allowedFiles = ['timeline', 'history', 'reviews', 'media', 'cool_stuff', 'credits'];

// Get all data for a type
app.get('/api/data/:type', async (req, res) => {
    const { type } = req.params;
    if (!allowedFiles.includes(type)) {
        return res.status(400).json({ error: 'Invalid data type' });
    }

    const filePath = path.join(DATA_DIR, `${type}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Return empty array if file doesn't exist
            return res.json([]);
        }
        res.status(500).json({ error: 'Error reading data' });
    }
});

// Save data (Admin only)
app.post('/api/data/:type', authenticate, async (req, res) => {
    const { type } = req.params;
    if (!allowedFiles.includes(type)) {
        return res.status(400).json({ error: 'Invalid data type' });
    }
    const newData = req.body; // Expecting the full array or object to replace content, or logic to append? 
    // Simplified: Expecting the Frontend to send the Modified State or I can implement specific actions.
    // For simplicity, let's assume the frontend sends the requested object to ADD.
    // Actually, to support CRUD properly "modify", "delete", it's safer if frontend sends the whole updated list OR we implement granular IDs.
    // Requirement says: "modify them and just do CRUD".
    // Let's implement a simple "Overwrite" for now, or " Append" ?
    // "We'll add article text in the JSON file we already have".
    // Let's stick to: Endpoint receives the Full List to save. It's easiest for JSON files.

    const filePath = path.join(DATA_DIR, `${type}.json`);
    try {
        await fs.writeFile(filePath, JSON.stringify(newData, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error saving data' });
    }
});

// File Upload
// File Upload
app.post('/api/upload', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return relative path
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.post('/api/delete-file', authenticate, async (req, res) => {
    const { url } = req.body;
    console.log('[API] /api/delete-file requested with URL:', url);

    if (!url) return res.status(400).json({ error: 'No url provided' });

    // Sanitize and resolve path
    const filename = path.basename(url);
    const filePath = path.join(UPLOADS_DIR, filename);
    console.log('[API] resolving path:', filePath);

    try {
        await fs.unlink(filePath);
        console.log('[API] File deleted successfully');
        res.json({ success: true });
    } catch (err) {
        console.error('[API] Error deleting file:', err);
        // We generally return success even if file not found to avoid blocking UI
        res.json({ success: true, message: 'File could not be deleted or not found' });
    }
});

// ============================================
// WINDOWS 95 COMPUTER API
// ============================================

const fsSync = require('fs');
const USER_UPLOADS_DIR = path.join(__dirname, 'uploads', 'users');
const COMPUTER_FILES_JSON = path.join(__dirname, 'data', 'computer_files.json');
const MAX_QUOTA_BYTES = (process.env.USER_UPLOADS_QUOTA_MB || 1000) * 1024 * 1024;
const MAX_FILE_BYTES = (process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

// Ensure user uploads directory exists
if (!fsSync.existsSync(USER_UPLOADS_DIR)) {
    fsSync.mkdirSync(USER_UPLOADS_DIR, { recursive: true });
}

// Calculate total directory size
function getDirectorySize(dirPath) {
    let totalSize = 0;
    try {
        const files = fsSync.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fsSync.statSync(filePath);
            if (stats.isFile()) {
                totalSize += stats.size;
            }
        }
    } catch (err) {
        console.error('Error calculating directory size:', err);
    }
    return totalSize;
}

// GET /api/computer/quota - Get storage quota info
app.get('/api/computer/quota', (req, res) => {
    const currentSize = getDirectorySize(USER_UPLOADS_DIR);
    res.json({
        used: currentSize,
        total: MAX_QUOTA_BYTES,
        usedMB: (currentSize / 1024 / 1024).toFixed(2),
        totalMB: (MAX_QUOTA_BYTES / 1024 / 1024).toFixed(2),
        percentage: ((currentSize / MAX_QUOTA_BYTES) * 100).toFixed(2)
    });
});

// GET /api/computer/files - Get all files
app.get('/api/computer/files', async (req, res) => {
    try {
        const data = await fs.readFile(COMPUTER_FILES_JSON, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.json({ files: [], folders: ['My Documents', 'My Pictures', 'My Music'] });
    }
});

// POST /api/computer/folder - Create virtual folder
// POST /api/computer/folder - Create virtual folder
app.post('/api/computer/folder', async (req, res) => {
    try {
        const { name, parentId } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Folder name required' });
        }

        const data = JSON.parse(await fs.readFile(COMPUTER_FILES_JSON, 'utf8'));

        // Check if folder already exists in the same parent
        const exists = data.files.some(f => f.name === name && f.folder === (parentId || 'Desktop') && f.type === 'folder');
        if (exists) {
            return res.status(400).json({ error: 'Folder already exists' });
        }

        const newFolder = {
            id: `folder-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            name: name,
            type: 'folder',
            folder: parentId || 'Desktop', // This is the parent folder ID
            pic: 'Project',
            size: 0,
            date: new Date().toISOString()
        };

        data.files.push(newFolder);
        await fs.writeFile(COMPUTER_FILES_JSON, JSON.stringify(data, null, 2));

        res.json({ success: true, folder: newFolder });
    } catch (err) {
        console.error('Error creating folder:', err);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// Configure multer for user uploads
const userUpload = multer({
    storage: multer.diskStorage({
        destination: USER_UPLOADS_DIR,
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            cb(null, uniqueSuffix + '-' + sanitized);
        }
    }),
    limits: { fileSize: MAX_FILE_BYTES }
});

// POST /api/computer/upload - Upload file
app.post('/api/computer/upload', userUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check quota after upload
        const currentSize = getDirectorySize(USER_UPLOADS_DIR);

        if (currentSize > MAX_QUOTA_BYTES) {
            // Delete the just-uploaded file
            await fs.unlink(req.file.path);
            return res.status(413).json({
                error: 'Storage quota exceeded. Please delete some files first.',
                quota: MAX_QUOTA_BYTES,
                current: currentSize
            });
        }

        // Save metadata
        const filesData = JSON.parse(await fs.readFile(COMPUTER_FILES_JSON, 'utf8'));
        const fileEntry = {
            id: req.file.filename,
            name: req.file.originalname,
            path: `/uploads/users/${req.file.filename}`,
            size: req.file.size,
            mimeType: req.file.mimetype,
            folder: req.body.folder || 'My Documents',
            created: new Date().toISOString()
        };

        filesData.files.push(fileEntry);
        await fs.writeFile(COMPUTER_FILES_JSON, JSON.stringify(filesData, null, 2));

        res.json({
            success: true,
            file: fileEntry
        });
    } catch (error) {
        console.error('Upload error:', error);
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (e) { }
        }
        res.status(500).json({ error: 'Upload failed' });
    }
});

// PUT /api/computer/file/:id - Update file metadata (move to folder)
app.put('/api/computer/file/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { folder } = req.body;

        if (!folder) {
            return res.status(400).json({ error: 'Folder is required' });
        }

        const filesData = JSON.parse(await fs.readFile(COMPUTER_FILES_JSON, 'utf8'));
        const fileIndex = filesData.files.findIndex(f => f.id === id);

        if (fileIndex === -1) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Update folder
        filesData.files[fileIndex].folder = folder;

        await fs.writeFile(COMPUTER_FILES_JSON, JSON.stringify(filesData, null, 2));

        res.json({ success: true, file: filesData.files[fileIndex] });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/computer/file/:id - Delete file
app.delete('/api/computer/file/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Load metadata
        const filesData = JSON.parse(await fs.readFile(COMPUTER_FILES_JSON, 'utf8'));
        const file = filesData.files.find(f => f.id === id);

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete actual file
        const filePath = path.join(USER_UPLOADS_DIR, id);
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.log('File already deleted or not found:', id);
        }

        // Remove from metadata
        filesData.files = filesData.files.filter(f => f.id !== id);
        await fs.writeFile(COMPUTER_FILES_JSON, JSON.stringify(filesData, null, 2));

        res.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});


// ============================================
// MSN CHAT API
// ============================================
const CHAT_DATA_FILE = path.join(__dirname, 'data', 'chat_data.json');

// Ensure chat data file exists
(async () => {
    try {
        await fs.access(CHAT_DATA_FILE);
    } catch {
        const initialData = {
            rooms: [
                { id: "general", name: "General Chat", description: "Talk about anything and everything." },
                { id: "tech", name: "Tech & Computers", "description": "Discuss hardware, software, and the future." },
                { id: "music", name: "Music Lounge", "description": "Share your favorite tunes." },
                { id: "gaming", "name": "Gamers Zone", "description": "Video games, tips, and tricks." }
            ],
            messages: {
                general: [],
                tech: [],
                music: [],
                gaming: []
            }
        };
        await fs.writeFile(CHAT_DATA_FILE, JSON.stringify(initialData, null, 2));
    }
})();

// GET /api/chat/rooms
app.get('/api/chat/rooms', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(CHAT_DATA_FILE, 'utf8'));
        res.json(data.rooms);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// GET /api/chat/:room/messages
app.get('/api/chat/:room/messages', async (req, res) => {
    try {
        const { room } = req.params;
        const data = JSON.parse(await fs.readFile(CHAT_DATA_FILE, 'utf8'));
        res.json(data.messages[room] || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/chat/:room/messages
app.post('/api/chat/:room/messages', async (req, res) => {
    try {
        const { room } = req.params;
        const { user, text } = req.body;

        if (!user || !text) return res.status(400).json({ error: 'User and text required' });

        const data = JSON.parse(await fs.readFile(CHAT_DATA_FILE, 'utf8'));

        if (!data.messages[room]) data.messages[room] = [];

        const newMessage = {
            id: Date.now().toString(),
            user,
            text,
            timestamp: new Date().toISOString()
        };

        data.messages[room].push(newMessage);

        // Keep only last 50 messages per room to prevent infinite growth
        if (data.messages[room].length > 50) {
            data.messages[room] = data.messages[room].slice(-50);
        }

        await fs.writeFile(CHAT_DATA_FILE, JSON.stringify(data, null, 2));

        res.json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to post message' });
    }
});


// Serve React computer app
app.use('/computer', express.static(path.join(__dirname, '../dist/computer')));

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ============================================
// WEBSOCKET SERVER
// ============================================
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws) => {
    console.log('Checking client connection...');

    // Send full chat history on connection
    try {
        const data = JSON.parse(await fs.readFile(CHAT_DATA_FILE, 'utf8'));
        ws.send(JSON.stringify({ type: 'history', data: data.messages['general'] || [] }));
        console.log('Sent history to new client');
    } catch (e) {
        console.error('Error sending history:', e);
    }

    ws.on('message', async (message) => {
        try {
            const parsed = JSON.parse(message);

            if (parsed.type === 'message') {
                const { user, text } = parsed;
                if (!user || !text) return;

                // Save to file (reuse logic)
                const data = JSON.parse(await fs.readFile(CHAT_DATA_FILE, 'utf8'));
                if (!data.messages['general']) data.messages['general'] = [];

                const newMessage = {
                    id: Date.now().toString(),
                    user,
                    text,
                    timestamp: new Date().toISOString()
                };

                data.messages['general'].push(newMessage);

                // Keep last 50
                if (data.messages['general'].length > 50) {
                    data.messages['general'] = data.messages['general'].slice(-50);
                }

                await fs.writeFile(CHAT_DATA_FILE, JSON.stringify(data, null, 2));

                // Broadcast to ALL clients (including sender)
                const broadcastMsg = JSON.stringify({ type: 'message', data: newMessage });
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(broadcastMsg);
                    }
                });
            }
        } catch (e) {
            console.error('WebSocket message error:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
