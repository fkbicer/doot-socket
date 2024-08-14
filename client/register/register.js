document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

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

        // API endpoint
        

        // Form verilerini API'ye gönder
        try {
            const response = await fetch('http://localhost/doot/backend/api/v1/create_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error('Ağ hatası: ' + response.statusText);
            }

            const data = await response.json();
            console.log('Başarıyla kayıt olundu:', data);
            alert('Kayıt başarılı!');

            //localstorage
            localStorage.setItem('username', username);

            window.location.href = '../index.html';
        } catch (error) {
            console.error('Kayıt sırasında bir hata oluştu:', error);
            alert('Kayıt sırasında bir hata oluştu.');
        }
    });
});
