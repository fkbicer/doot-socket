<?php 
    // Database connection
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: Content-Type');

    $room_name = $_GET['room_name'] ?? null;

    if($room_name){
        require '../../db/database.class.php';
        $db = new Database();
        $query = "SELECT * FROM rooms WHERE (room_name) = (?)";
        $result = $db->getRow($query,array($room_name));
        
        if ($result) {
            echo json_encode(['isExist' => true, 'room_name' => $result['room_name']]);
        } else {
            echo json_encode(['isExist' => false]);
        }
    } else {
        echo json_encode(['error' => 'Room name is required']);
    }
    

?>