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
    isset($input['room_name']) &&
    isset($input['message'])
    ) {
    $content = $input['message'];
    $room_name = $input['room_name'];
    $sent_by = $input['username'];
    // Database connection
    require '../../db/database.class.php';
    $db = new Database();
    $insertQuery = 'INSERT INTO messages (content, room_name,sent_by) VALUES (?, ?, ?)';
    $messageId = $db->insertData($insertQuery,array($content,$room_name,$sent_by));
    if($messageId) {
        http_response_code(201);
        $response['success'] = true;
        $response['message'] = 'Message created succesfully';
        echo json_encode($response);
    }else {
        http_response_code(500);
        $response['success'] = false;
        $response['message'] = 'Message creation failed';
        echo json_encode($response);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid input']);
}
?>