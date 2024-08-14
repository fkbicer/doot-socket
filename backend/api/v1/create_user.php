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
    isset($input['password'])
    ) {
    $password = $input['password'];
    $username = $input['username'];
    // Database connection
    require '../../db/database.class.php';
    $db = new Database();
    $insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    $userId = $db->insertData($insertQuery,array($username,$password));
    if($userId) {
        http_response_code(201);
        echo json_encode(['message' => 'User creation succesfull.']);
    }else {
        http_response_code(500);
        echo json_encode(['message' => 'User creation failed.']);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid input']);
}
?>