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

if (isset($input['pastSocketId']) && isset($input['currentSocketId']) && $input['username']) {
    $pastSocketId = $input['pastSocketId'];
    $username = $input['username'];
    $currentSocketId = $input['currentSocketId'];
    
    // Database connection
    require '../../db/database.class.php';
    $db = new Database();
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Insert into rooms table
        $sessionTerminateQuery = 'UPDATE session_users SET is_active = 0 WHERE (session_id) = (?)';
        $rowCount = $db->updateData($sessionTerminateQuery, array($pastSocketId));
        
        if ($rowCount) {
            // Insert into session_users table
            $is_active = 1;
            $insertNewSessionQuery = 'INSERT INTO session_users (username, session_id,is_active) VALUES (?, ?,?)';
            $userRoomInserted = $db->insertData($insertNewSessionQuery, array($username, $currentSocketId, $is_active));
            
            if ($userRoomInserted) {
                // Commit transaction
                $db->commit();
                http_response_code(201);
                $response['success'] = true;
                $response['message'] = 'Old session terminated and new session created';
                echo json_encode($response);
            } else {
                // Rollback transaction if user_room insertion fails
                $db->rollback();
                http_response_code(500);
                $response['success'] = false;
                $response['message'] = 'Session terminate process failed.';
                echo json_encode($response);
            }
        } else {
            // Rollback transaction if room insertion fails
            $db->rollback();
            http_response_code(500);
            $response['success'] = false;
            $response['message'] = 'Session terminate process failed.';
            echo json_encode($response);
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