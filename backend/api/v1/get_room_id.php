<?php 
    // Database connection
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: Content-Type');

    $room_name = $_GET['room_name'] ?? null;

    if ($room_name) {
        try {
            // Veritabanı bağlantısını oluştur
            require '../../db/database.class.php';
            $db = new Database();
    
            // Sorguyu oluştur
            $query = "SELECT id FROM rooms WHERE (room_name) = (?)";
            $result = $db->getRow($query, array($room_name));
    
            if ($result) {
                // Kullanıcı bulundu
                $response['success'] = true;
                $response['message'] = 'Successful';
                $response['id'] = $result['id'];
            } else {
                // Kullanıcı bulunamadı
                $response['success'] = false;
                $response['message'] = 'There is no room with this room_name';
            }
        } catch (Exception $e) {
            // Hata durumunda
            $response['success'] = false;
            $response['message'] = 'Error: ' . $e->getMessage();
        }
    } else {
        // Kullanıcı adı verilmemiş
        $response['success'] = false;
        $response['message'] = 'room_name is required';
    }
    
    // JSON yanıtı döndür
    echo json_encode($response);
    ?>