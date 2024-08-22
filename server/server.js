import axios from 'axios'
import chalk from 'chalk';
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

    socket.on('send-message', async ({username, message, room }) => {
        console.log('Message sent from: ',chalk.green(`${socket.id}`),' Message: ', chalk.yellow(`${message}`), ' Room:', chalk.blue(`${room}`));

        //create message row in db,

        const createMessage = await axios.post('http://localhost/doot/backend/api/v1/create_message.php', {
            username : username,
            room_name: room,
            message : message
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const createData = createMessage.data;
        if (createData.success) {
            console.log('Message created successfully', createData);
        } else {
            console.error('Message oluşturulurken hata oluştu:', createData.message);
        }
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
    // 1- Mevcut session kontrolü (ona göre islemelrin yapılması)
    // 2- room'ların cekilmesi.
    socket.on('send-info', async (username, user_id) => {
        try {
            // Kullanıcının mevcut oturumunu kontrol et
            const checkResponse = await axios.get(`http://localhost/doot/backend/api/v1/check_session.php`, {
                params: { username: encodeURIComponent(username) }
            });
            const checkData = checkResponse.data;
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

                axios.get('http://localhost/doot/backend/api/v1/fetch_rooms.php', {
                    params: {
                        user_id: user_id
                    }
                })
                .then(response => {
                    const room_names = response.data.room_id;

                    room_names.forEach((room_name, index) => {
                        try {
                            socket.join(room_name);
                            console.log('joined room again: ', room_name)
                        } catch (error) {
                            console.error('Error when joining room', error);
                        }
                        
                    });
                    console.log('Room Names:', room_names);
                    socket.emit('receive-room-ids', room_names);
                })
                .catch(error => {
                    console.error('An error trying to obtain room_id.s', error);
                });
            }
        } catch (error) {
            console.error('Hata oluştu:', error);
        }


    });

    socket.on('disconnect', (reason) => {
        console.log(`Disconnected: ${socket.id}, Reason: ${reason}`);
    })
})