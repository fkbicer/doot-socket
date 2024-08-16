import { io } from "socket.io-client";

// get user_id
async function getUserId(username) {
    try {
        const response = await fetch(`http://localhost/doot/backend/api/v1/get_user_id.php?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            return data.id; // User ID'yi döndür
        } else {
            console.error('Error:', data.message);
            return null; // Hata durumunda null döndür
        }
    } catch (error) {
        console.error('Fetch request error:', error);
        return null; // Hata durumunda null döndür
    }
}


document.addEventListener('DOMContentLoaded', async () => {
const username = localStorage.getItem('username');
const roomList = document.getElementById('roomList');
const chatContainers = document.getElementById('chatContainers');
let currentRoom = null;

    if (username) {
        const socket = io('http://localhost:3000');
    
        // Yeni bir oda eklemek için fonksiyon
        function addRoom(roomName) {
            // Oda linkini oluştur
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.classList.add('room');
            link.dataset.room = roomName;
            link.textContent = roomName;
        
            listItem.appendChild(link);
            roomList.appendChild(listItem);
        
            // Chat container'ını oluştur
            const chatContainer = document.createElement('div');
            chatContainer.id = `${roomName}Container`;
            chatContainer.classList.add('chat-container');
            chatContainer.innerHTML = `
                <div class="message-list" id="${roomName}Messages"></div>
                <form id="${roomName}Form">
                    <div class="form-group">
                        <label for="${roomName}MessageInput">Mesajınızı Girin:</label>
                        <input type="text" id="${roomName}MessageInput" name="message" placeholder="Mesajınızı buraya yazın" required>
                    </div>
                    <div class="form-group">
                        <button type="submit">Mesaj Gönder</button>
                    </div>
                </form>
            `;
            
            chatContainers.appendChild(chatContainer);
        
            // Oda bağlantısına tıklama işleyicisi ekleyin
            link.addEventListener('click', function(event) {
                event.preventDefault(); // Linkin varsayılan davranışını engelle
                const roomId = this.getAttribute('data-room');
                joinRoom(roomId);
            });
        }


        const addRoomButton = document.getElementById('addRoomButton');
        const modal = document.getElementById('addRoomModal');
        const closeModal = document.querySelector('.modal .close');
        const addRoomForm = document.getElementById('addRoomForm');
        
        addRoomButton.addEventListener('click', () => {
            modal.style.display = 'block'; // Modalı göster
        });
        
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none'; // Modalı gizle
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none'; // Modal dışına tıklayınca gizle
            }
        });
        
        addRoomForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Formun varsayılan davranışını engelle
        
            
            // obtain json body data's
            const roomName = document.getElementById('roomName').value;
            const user_id = await getUserId(username);
            console.log('User ID:', user_id);
        
            try {
                // Odayı veritabanına ekleme isteği gönder
                const response = await fetch('http://localhost/doot/backend/api/v1/create_room.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ roomName, user_id })
                });
        
                const result = await response.json();
                if (result.success) {
                    console.log('Yeni oda olusturuldu ve db.ye eklendi: ', result)
                    addRoom(roomName); // Yeni odayı ekle
                    modal.style.display = 'none'; // Modalı gizle
                } else {
                    alert('Oda eklenirken bir hata oluştu.');
                }
            } catch (error) {
                console.error('Oda eklenirken hata oluştu:', error);
                alert('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        });    


    
    // Odaya katılma
    function joinRoom(room) {
        currentRoom = room;
        socket.emit('join-room', room);
    
        // Tüm chat container'larını gizle
        document.querySelectorAll('.chat-container').forEach(container => {
            container.style.display = 'none';
        });
    
        // Seçilen odanın chat container'ını göster
        const selectedContainer = document.getElementById(`${room}Container`);
        if (selectedContainer) {
            selectedContainer.style.display = 'block';
        }
    
        // Oda bilgilerini isteme
        socket.emit('list-sockets-in-room', room);
    }

    socket.on('list-sockets-in-room', (data) => {
        const { room, socketIds } = data;
        console.log(`Sockets in room ${room}:`, socketIds);
    
        // Oda bilgilerini HTML'e eklemek isterseniz
        const roomInfoElement = document.getElementById(`${room}Info`);
        if (roomInfoElement) {
            roomInfoElement.innerHTML = `Sockets in room ${room}: ${socketIds.join(', ')}`;
        }
    });
    
    
    // Mesaj gönderimi
    chatContainers.addEventListener('submit', function(event) {
        event.preventDefault();
        const form = event.target;
        const room = form.id.replace('Form', ''); // Form ID'sinden oda adını çıkarın
        const messageInput = form.querySelector('input[type="text"]');
        const message = messageInput.value.trim();
        
        if (message && room) {
            // Mesajı Socket.IO ile gönder
            socket.emit('send-message', { message, room });
            
            // Mesajı ekrana yansıt
            const messageList = document.getElementById(`${room}Messages`);
            if (messageList) {
                messageList.innerHTML += `<p>${message}</p>`;
            }
    
            // Input alanını temizle
            messageInput.value = '';
        }
    });
    
    // Socket.IO ile mesaj alımı
    socket.on('receive-message', ({ message, room }) => {
        const messageList = document.getElementById(`${room}Messages`);
        if (messageList) {
            messageList.innerHTML += `<p>${message}</p>`;
        }
    });

    //server'a username bilgisini göndermek. (db islemlerini yapmak icin, server'da yapacagız.)
    socket.emit('send-username', username)

    /* try {
            // 1. Oturum kontrolü
            const checkResponse = await fetch(`http://localhost/doot/backend/api/v1/check_session.php?username=${encodeURIComponent(username)}`);
            const checkData = await checkResponse.json();

            if (!checkData.active) {
                // 2. Yeni oturum oluşturma
                    socket.on('connected', async ({ socketId }) => {
                        console.log('bu kullanıcıya ait active session bulunmamaktadır.')
                        console.log('Connected with socket ID:', socketId);

                    try {
                        const createResponse = await fetch('http://localhost/doot/backend/api/v1/create_session_user.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username,
                                socketId
                            }),
                        });

                        const createData = await createResponse.json();
                        if (createData.success) {
                            console.log('Session oluşturuldu:', createData);
                        } else {
                            console.error('Session oluşturulurken hata oluştu:', createData.message);
                        }
                    } catch (error) {
                        console.error('Session oluşturulurken hata oluştu:', error);
                    }
                });
            } else {
                console.log('Kullanicinin zaten aktif bir oturumu var:', checkData.sessionId);
                // eski session_id'yi terminate edip yenisini eklemek istiyorum.
                // 1 -session_user'a git ve mevcut checkData'nın oldugu is_active'i 0 olarak set et.
                const pastSocketId = checkData.sessionId
                let currentSocketId = null;

                // socket.on('connected') olayını dinleyin
                socket.on('connected', ({ socketId }) => {
                    console.log('Kullanıcının güncel socket_id.si : ' + socketId);
                    currentSocketId = socketId;
                });
                
                // 2- mevcut session_id'yi cek ve session_users'a active olarak ekle
                try {
                    const terminateResponse = await fetch('http://localhost/doot/backend/api/v1/terminate_session.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username,
                            pastSocketId,
                            currentSocketId
                        }),
                    });

                    const terminateData = await terminateResponse.json();
                    if (terminateData.success) {
                        console.log('Session oluşturuldu:', terminateData);
                    } else {
                        console.error('Session oluşturulurken hata oluştu:', terminateData.message);
                    }
                } catch (error) {
                    console.error('Session oluşturulurken hata oluştu:', error);
                }
          
              // 3- db'den bu kullanıcının bulundugu room'ları cek ve yeni session_id'lerin hepsini ekle
                
            }
        } catch (error) {
            console.error('Oturum kontrolü sırasında hata oluştu:', error);
        } */
    } else {
        window.location.href = 'register/register.html';
    }

});


