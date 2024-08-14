const io = require('socket.io')(3000,
    {
        cors : {
            origin : ["http://localhost:8080"]
        }
    }
)

io.on("connection", socket => {
        
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

    socket.on('disconnect', (reason) => {
        console.log(`Disconnected: ${socket.id}, Reason: ${reason}`);
    })
})