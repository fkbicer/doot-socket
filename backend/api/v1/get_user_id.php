<?php 
    // Database connection
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: Content-Type');

    $username = $_GET['username'] ?? null;

    if ($username) {
        try {
            // Veritabanı bağlantısını oluştur
            require '../../db/database.class.php';
            $db = new Database();
    
            // Sorguyu oluştur
            $query = "SELECT id FROM users WHERE (username) = (?)";
            $result = $db->getRow($query, array($username));
    
            if ($result) {
                // Kullanıcı bulundu
                $response['success'] = true;
                $response['message'] = 'Successful';
                $response['id'] = $result['id'];
            } else {
                // Kullanıcı bulunamadı
                $response['success'] = false;
                $response['message'] = 'There is no user with this username';
            }
        } catch (Exception $e) {
            // Hata durumunda
            $response['success'] = false;
            $response['message'] = 'Error: ' . $e->getMessage();
        }
    } else {
        // Kullanıcı adı verilmemiş
        $response['success'] = false;
        $response['message'] = 'Username is required';
    }
    
    // JSON yanıtı döndür
    echo json_encode($response);
    ?>