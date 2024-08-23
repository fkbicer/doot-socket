<?php 
    // Database connection
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: Content-Type');

    $room_id = $_GET['room_id'] ?? null;


    if($room_id) {
        require '../../db/database.class.php';
        $db = new Database();
        $query = "SELECT u.username FROM room_users ru JOIN users u ON ru.user_id = u.id WHERE ru.room_id =(?)";
        $result = $db->getRows($query,array($room_id));

       $user_names = array_map(function($row) {
            return $row['username'];
        }, $result); 

        if ($result) {
            echo json_encode(['success' => true, 'user_names' => $user_names]);
        } else {
            echo json_encode(['success' => false, 'message' => 'there is no users w/ this room_id']);
        }
    }
    else {
        echo json_encode(['error' => 'room_id is required']);
    }
    
    
?>