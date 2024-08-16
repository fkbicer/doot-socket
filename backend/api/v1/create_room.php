<?php 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: Content-Type');
$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (isset($input['user_id']) && isset($input['roomName'])) {
    $user_id = $input['user_id'];
    $room_name = $input['roomName'];
    
    // Database connection
    require '../../db/database.class.php';
    $db = new Database();
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Insert into rooms table
        $insertRoomQuery = 'INSERT INTO rooms (room_name) VALUES (?)';
        $roomId = $db->insertData($insertRoomQuery, array($room_name));
        
        if ($roomId) {
            // Insert into users_rooms table
            $insertUserRoomQuery = 'INSERT INTO room_users (room_id, user_id) VALUES (?, ?)';
            $userRoomInserted = $db->insertData($insertUserRoomQuery, array($roomId, $user_id));
            
            if ($userRoomInserted) {
                // Commit transaction
                $db->commit();
                http_response_code(200);
                $response['success'] = true;
                $response['message'] = 'New room created succesfully';
                echo json_encode($response);
            } else {
                // Rollback transaction if user_room insertion fails
                $db->rollback();
                http_response_code(500);
                echo json_encode(['message' => 'User assignment failed.']);
            }
        } else {
            // Rollback transaction if room insertion fails
            $db->rollback();
            http_response_code(500);
            echo json_encode(['message' => 'Room creation failed.']);
        }
    } catch (Exception $e) {
        // Rollback transaction on any exception
        $db->rollback();
        http_response_code(500);
        echo json_encode(['message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid input']);
}
?>