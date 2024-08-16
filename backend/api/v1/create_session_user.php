<?php 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (isset($input['username']) && 
    isset($input['socketId'])
    ) {
    $socketId = $input['socketId'];
    $username = $input['username'];
    $is_active = 1;
    // Database connection
    require '../../db/database.class.php';
    $db = new Database();
    $insertQuery = 'INSERT INTO session_users (username, session_id,is_active) VALUES (?, ?, ?)';
    $userId = $db->insertData($insertQuery,array($username,$socketId,$is_active));
    if($userId) {
        http_response_code(201);
        $response['success'] = true;
        $response['message'] = 'Session created succesfully';
        echo json_encode($response);
    }else {
        http_response_code(500);
        $response['success'] = false;
        $response['message'] = 'Session created failed';
        echo json_encode($response);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid input']);
}
?>