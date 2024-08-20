<?php 
require '../../functions/routing.php';
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
    $username= $input['username'];

    // Database connection
    require '../../db/database.class.php';
    $db = new Database();
    $rowQuery= "SELECT * FROM users WHERE (username)=(?)";
    $userInfo = $db->getRow($rowQuery,array($username));
    if($userInfo) {
        if ($userInfo['password'] === $password){
            http_response_code(201);
            $response['success'] = true;
            $response['message'] = "User {$username} logged in successfully.";
            echo json_encode($response);
        }else {
            http_response_code(500);
            $response['success'] = false;
            $response['message'] = "Username or password is wrong.";
            echo json_encode($response);
        }
    }else {
            http_response_code(500);
            $response['success'] = false;
            $response['message'] = "Username or password is wrong.";
            echo json_encode($response);
    }
} else {
            http_response_code(400);
            $response['success'] = false;
            $response['message'] = "Invalid input.";
            echo json_encode($response);
}
?>