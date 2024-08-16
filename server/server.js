import axios from 'axios'

import { Server } from 'socket.io';

const io = new Server(3000, {
    cors: {
        origin: ["http://localhost:8080"]
    }
});
io.on("connection", socket => {
    console.log('----------------------------------------------------------------------');
    console.log('A user connected:', socket.id);

    socket.emit('connected', { socketId: socket.id });

    socket.on('send-message', ({ message, room }) => {
        console.log(`Message sent from: ${socket.id} Message: ${message} Room: ${room}`);
    
        // Mesajı belirli bir odaya yayınlama
        socket.to(room).emit('receive-message', { message, room });
    })

    socket.on('join-room', (room) => {
        // Kullanıcının zaten bu odada olup olmadığını kontrol et
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(room)) {
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        } else {
            console.log(`User ${socket.id} is already in room ${room}`);
        }
    })

    socket.on('list-sockets-in-room', (room) => {
        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        if (clientsInRoom) {
            const socketIds = Array.from(clientsInRoom);
            console.log(`Sockets in room ${room}:`, socketIds);
            // İstemciye geri dönmek isterseniz:
            socket.emit('list-sockets-in-room', { room, socketIds });
        } else {
            console.log(`No sockets in room ${room}`);
            socket.emit('list-sockets-in-room', { room, socketIds: [] });
        }
    })

    socket.on('send-username', async (username) => {
        try {
            // Kullanıcının mevcut oturumunu kontrol et
            const checkResponse = await axios.get(`http://localhost/doot/backend/api/v1/check_session.php`, {
                params: { username: encodeURIComponent(username) }
            });
            const checkData = checkResponse.data;
            console.log('response verileri : ', checkData)
            if (!checkData.active) {
                console.log('Bu kullanıcıya ait aktif bir oturum bulunmamaktadır.');
                console.log('Connected with socket ID:', socket.id);
    
                // Yeni oturum oluştur
                const createResponse = await axios.post('http://localhost/doot/backend/api/v1/create_session_user.php', {
                    username,
                    socketId: socket.id
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                const createData = createResponse.data;
                if (createData.success) {
                    console.log('Session oluşturuldu:', createData);
                } else {
                    console.error('Session oluşturulurken hata oluştu:', createData.message);
                }
            } else {
                console.log('Kullanıcının zaten aktif bir oturumu var:', checkData.sessionId);
    
                const pastSocketId = checkData.sessionId;
    
                // Mevcut oturumu sonlandır
                const terminateResponse = await axios.post('http://localhost/doot/backend/api/v1/terminate_session.php', {
                    username,
                    pastSocketId,
                    currentSocketId: socket.id
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                const terminateData = terminateResponse.data;
                if (terminateData.success) {
                    console.log('Session oluşturuldu:', terminateData);
                } else {
                    console.error('Session oluşturulurken hata oluştu:', terminateData.message);
                }
    
                // 3- DB'den bu kullanıcının bulunduğu room'ları çek ve yeni session_id'lerin hepsini ekle
            }
        } catch (error) {
            console.error('Hata oluştu:', error);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`Disconnected: ${socket.id}, Reason: ${reason}`);
    })
})