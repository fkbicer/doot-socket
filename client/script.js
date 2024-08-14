import { io } from "socket.io-client";

const socket = io('http://localhost:3000');
const roomList = document.getElementById('roomList');
const chatContainers = document.getElementById('chatContainers');
let currentRoom = null;

document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('username');

    if (username) {
        try {
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
                console.log('Kullanıcının zaten aktif bir oturumu var:', checkData.sessionId);
            }
        } catch (error) {
            console.error('Oturum kontrolü sırasında hata oluştu:', error);
        }
    } else {
        window.location.href = 'register.html';
    }
});


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
}

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

// Örnek olarak oda ekleme butonu
document.getElementById('addRoomButton')?.addEventListener('click', () => {
    const newRoomName = `Room ${document.querySelectorAll('.chat-container').length + 1}`;
    addRoom(newRoomName);
});
