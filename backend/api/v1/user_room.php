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
        
    try {
        // Insert into rooms table
        $getRoomIdQuery = "SELECT id FROM rooms WHERE (room_name) = (?)";
        $roomResult = $db->getRow($getRoomIdQuery, array($room_name));
        
        if ($roomResult) {
            $roomId = $roomResult['id'];
                $insertUserRoomQuery = 'INSERT INTO room_users (room_id, user_id) VALUES (?, ?)';
                $userRoomInserted = $db->insertData($insertUserRoomQuery, array($roomId, $user_id));

                if ($userRoomInserted) {
                    http_response_code(200);
                    $response['success'] = true;
                    $response['message'] = 'User-room relation created';
                    echo json_encode($response);
                } else {
                    // Rollback transaction if user_room insertion fails
                    http_response_code(500);
                    $response['success'] = false;
                    $response['message'] = 'User-room relation failed';
                    echo json_encode($response);
                }  
        }else {
                    http_response_code(500);
                    $response['success'] = false;
                    $response['message'] = 'There is no room like that room_name';
                    echo json_encode($response);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid input']);
}
?>