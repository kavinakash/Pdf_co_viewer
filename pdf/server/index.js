const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.pdf');
    }
});

const upload = multer({ storage: storage });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let sessions = {};

app.post('/upload', upload.single('pdf'), (req, res) => {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ fileUrl });
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('create-session', (pdfUrl) => {
        const sessionId = uuidv4();
        sessions[sessionId] = {
            admin: socket.id,
            viewers: [],
            currentPage: 1,
            pdfUrl: pdfUrl,
        };
        socket.emit('session-created', { sessionId, role: 'admin', pdfUrl });
        console.log(`Session created with ID: ${sessionId}`);
    });

    socket.on('join-session', (sessionId) => {
        if (sessions[sessionId]) {
            sessions[sessionId].viewers.push(socket.id);
            socket.emit('session-joined', {
                role: 'viewer',
                sessionId,
                pdfUrl: sessions[sessionId].pdfUrl,
                currentPage: sessions[sessionId].currentPage
            });
            io.to(sessions[sessionId].admin).emit('new-viewer', socket.id);
        } else {
            socket.emit('session-not-found');
        }
    });

    socket.on('page-change', (sessionId, pageNumber) => {
        if (sessions[sessionId]) {
            sessions[sessionId].currentPage = pageNumber;
            io.to(sessionId).emit('page-update', pageNumber);
        }
    });

    socket.on('disconnect', () => {
        for (let sessionId in sessions) {
            const session = sessions[sessionId];
            if (session.admin === socket.id) {
                delete sessions[sessionId];
            } else {
                session.viewers = session.viewers.filter(id => id !== socket.id);
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
