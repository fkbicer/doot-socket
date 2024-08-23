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

// get room_id
async function getRoomId(room_name) {
    try {
        const response = await fetch(`http://localhost/doot/backend/api/v1/get_room_id.php?room_name=${encodeURIComponent(room_name)}`, {
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

    if (username) {

        // <--------------------------- SOCKET CONNECTIONS --------------------------->
            
            const socket = io('http://localhost:3000');



        // <--------------------------- VARIABLES --------------------------->

            const roomList = document.getElementById('roomList');
            const chatContainers = document.getElementById('chatContainers');
            const logoutLink = document.getElementById('logoutLink');          
            const addRoomButton = document.getElementById('addRoomButton');
            const modal = document.getElementById('addRoomModal');
            const closeModal = document.querySelector('.modal .close');
            const addRoomForm = document.getElementById('addRoomForm'); 
            
            const user_id = await getUserId(username);
            let currentRoom = null;



        //  <--------------------------- EVENT LISTENERS --------------------------->
        
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

            logoutLink.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = 'login/login.html';
            });

            chatContainers.addEventListener('submit', function(event) {
                event.preventDefault();
                const form = event.target;
                const room = form.id.replace('Form', ''); // Form ID'sinden oda adını çıkarın
                const messageInput = form.querySelector('input[type="text"]');
                const message = messageInput.value.trim();
                
                if (message && room) {
                    // Mesajı Socket.IO ile gönder
                    socket.emit('send-message', { username, message, room });
                    
                    // Mesajı ekrana yansıt
                    const messageList = document.getElementById(`${room}Messages`);
                    if (messageList) {
                        messageList.innerHTML += `<p>${message}</p>`;
                    }
            
                    // Input alanını temizle
                    messageInput.value = '';
                }
            });
            
            addRoomForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const roomName = document.getElementById('roomName').value;
                // önce db'de böyle bir room var mı diye kontrol etmemiz lazım, var ise sadece join islemi,
                // yoksa eger create islemi
                const isRoomExist = await fetch(`http://localhost/doot/backend/api/v1/check_room.php?room_name=${encodeURIComponent(roomName)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const isRoomExistData = await isRoomExist.json();
                console.log('is Exist log :  ',isRoomExistData);
                if (isRoomExistData.isExist) {
                    try {
                        const response = await fetch('http://localhost/doot/backend/api/v1/user_room.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ roomName, user_id })
                        });
                
                        const result = await response.json();
                        if (result.success) {
                            console.log('Kullanıcı var olan odaya dahil edildi. ', isRoomExistData)
                            addRoom(roomName); // Yeni odayı ekle
                            modal.style.display = 'none'; // Modalı gizle
                        } else {
                            alert('Oda eklenirken bir hata oluştu.');
                        }
                    } catch (error) {
                        console.error('Oda eklenirken hata oluştu:', error);
                        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
                    }
                    
                } else {
                    // yeni bir yaratma istegi yapmamiz gerekiyor.
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

                }
        });

            
        //  <--------------------------- FUNCTIONS --------------------------->

            //adding new room
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
                    <div class="room-header">
                        ${roomName}
                        <button class="show-users-button" id="${roomName}ShowUsersButton">Kişiler</button>
                    </div>
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
                    <div class="user-list-popup" id="${roomName}UserListPopup">
                        <div class="popup-content">
                            <span class="close-popup">&times;</span>
                            <h2>Odada Bulunan Kişiler</h2>
                            <p>Burada kişiler listelenecek.</p>
                        </div>
                    </div>
                `;
            
                chatContainers.appendChild(chatContainer);
            
                // Oda bağlantısına tıklama işleyicisi ekleyin
                link.addEventListener('click', function(event) {
                    event.preventDefault(); // Linkin varsayılan davranışını engelle
                    const roomId = this.getAttribute('data-room');
                    joinRoom(roomId);
                });
            
                // Kişiler butonuna tıklama işleyicisi ekleyin
                const showUsersButton = chatContainer.querySelector(`#${roomName}ShowUsersButton`);
                const userListPopup = chatContainer.querySelector(`#${roomName}UserListPopup`);
                const closePopup = userListPopup.querySelector('.close-popup');
            
                showUsersButton.addEventListener('click', () => {
                    userListPopup.style.display = 'block';
                });
            
                closePopup.addEventListener('click', () => {
                    userListPopup.style.display = 'none';
                });
            
                window.addEventListener('click', (event) => {
                    if (event.target === userListPopup) {
                        userListPopup.style.display = 'none';
                    }
                });
            }
       
            // joining room
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

                fetchMessages(room);
                fetchUsersInRoom(room);
            }

            // fetching messages in room
            async function fetchMessages(room_name) {
                try {
                    const response = await fetch(`http://localhost/doot/backend/api/v1/fetch_messages.php?room_name=${encodeURIComponent(room_name)}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();
                    console.log('Message data: ',data.messages_data);
                    if (data.success) {
                        const messages = data.messages_data;
                        
                        // Mesajları created_at'e göre sıralama
                        // messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                        
                        // Mesajları HTML'e ekleme
                        const messageList = document.getElementById(`${room_name}Messages`);
                        messageList.innerHTML = ''; // Önceki mesajları temizle
                        
                        messages.forEach(msg => {
                            const messageElement = document.createElement('div');
                            messageElement.classList.add('message');
                            messageElement.innerHTML = `
                                <p>${msg.content}</p>
                            `;
                            messageList.appendChild(messageElement);
                        });
                    } else {
                        console.error('Error fetching messages:', data.message);
                    }
                } catch (error) {
                    console.error('Fetch request error:', error);
                }
            }

            // fetchin users in spesific room
            async function fetchUsersInRoom(room_name) {
                try {

                    const room_id = await getRoomId(room_name);

                    const response = await fetch(`http://localhost/doot/backend/api/v1/fetch_users_in_room.php?room_id=${encodeURIComponent(room_id)}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();
                    console.log('Users data: ',data.user_names);
                    if (data.success) {
                        const users = data.user_names;
                        
                        // Mesajları HTML'e ekleme
                        const popupParagraph = document.querySelector(`#${room_name}UserListPopup .popup-content p`)
                        popupParagraph.innerHTML = ''

                        users.forEach(eachUser => {
                            const listItem = document.createElement('p');
                            listItem.textContent = `Username: ${eachUser}`;
                            popupParagraph.appendChild(listItem);
                        })
                    } else {
                        console.error('Error fetching users in room:', data.message);
                    }
                } catch (error) {
                    console.error('Fetch request error:', error);
                }
            }

    //  <--------------------------- SOCKET EVENTS --------------------------->

    socket.on('receive-room-ids', room_names => {
        room_names.forEach(room_name => {
            addRoom(room_name)
        });
    })

    socket.on('list-sockets-in-room', (data) => {
        const { room, socketIds } = data; 
        fetchUsersInRoom(room)
    })

    socket.on('receive-message', ({ message, room }) => {
        const messageList = document.getElementById(`${room}Messages`);
        if (messageList) {
            messageList.innerHTML += `<p>${message}</p>`;
        }
    })

    //server'a username bilgisini göndermek. (db islemlerini yapmak icin, server'da yapacagız.)
    socket.emit('send-info', username, user_id)


    } 
    // user no have permission to access page.
    else {
        window.location.href = 'login/login.html';
    }

});


