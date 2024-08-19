<?php 
    // Database connection
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: Content-Type');

    $user_id = $_GET['user_id'] ?? null;


    if($user_id) {
        require '../../db/database.class.php';
        $db = new Database();
        $query = "SELECT rooms.room_name FROM room_users JOIN rooms ON room_users.room_id = rooms.id WHERE (room_users.user_id) = (?)";
        $result = $db->getRows($query,array($user_id));

       $room_names = array_map(function($row) {
            return $row['room_name'];
        }, $result); 

        if ($result) {
            echo json_encode(['success' => true, 'room_id' => $room_names]);
        } else {
            echo json_encode(['success' => false, 'message' => 'there is no user w/ this user_id']);
        }
    }
    else {
        echo json_encode(['error' => 'user_id is required']);
    }
    
    
?>