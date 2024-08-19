<?php 
    // Database connection
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: Content-Type');

    $room_name = $_GET['room_name'] ?? null;


    if($room_name) {
        require '../../db/database.class.php';
        $db = new Database();
        $query = "SELECT content, created_at FROM messages WHERE (room_name) = (?)";
        $result = $db->getRows($query,array($room_name));

        if ($result) {
            echo json_encode(['success' => true, 'messages_data' => $result]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No message in this room']);
        }
    }
    else {
        echo json_encode(['error' => 'room_name is required']);
    }
    
    
?>