<?php 
require '../../functions/routing.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
$input = json_decode(file_get_contents('php://input'), true);
if (isset($input['username']) && 
    isset($input['password'])
    ) {
    $password = $input['password'];
    $username= $input['username'];

    // Database connection
    require '../../db/database.class.php';
    $db = new Database();
    $rowQuery= "SELECT * FROM users WHERE username=?";
    $userInfo = $db->getRow($rowQuery,array($username));
    if($userInfo) {
        if ($userInfo['password'] === $password){
            http_response_code(201);
            //$_SESSION["loggedIn"] = true;
            //$_SESSION["email"] = $email;
            //$_SESSION["is_admin"] = $userInfo['is_admin'];

            echo json_encode([
                'message' => "Login successful"
                //'is_admin' => $userInfo['is_admin']
            ]);
        }else {
            http_response_code(500);
            echo 'Kullanici adi veya sifre yanlis. ';
        }
    }else {
        http_response_code(500);
        echo 'Kullanici adi veya sifre yanlis. ';
    }
} else {
    echo "Bu sayfayı görüntülemeye yetkiniz bulunmamaktadır.";
    go("login-page.php");
}
?>