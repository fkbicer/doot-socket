document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Formun varsayılan submit işlemini engeller

        // Form verilerini al
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Gönderilecek JSON verisini hazırlama
        const postData = {
            username: username,
            password: password
        };

        // Form verilerini API'ye gönder
        try {
            const response = await fetch('http://localhost/doot/backend/api/v1/login_control.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            const data = await response.json();

            if (data.success) {
                console.log('Başarıyla giriş yapıldı:', data);
                alert('Giriş başarılı!');

                //localstorage
                localStorage.setItem('username', username);
                localStorage.setItem('loggedIn', true);

                // Kullanıcıyı anasayfaya yönlendir
                window.location.href = '../index.html';
            } else {
                alert('Giriş başarısız: ' + data.message);
            }
        } catch (error) {
            console.error('Giriş sırasında bir hata oluştu:', error);
            alert('Giriş sırasında bir hata oluştu.');
        }
    });
});
