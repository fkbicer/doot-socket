<?php 
    // Database connection
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: Content-Type');

    $username = $_GET['username'] ?? null;

    if($username){
        require '../../db/database.class.php';
        $db = new Database();
        $query = "SELECT * FROM session_users WHERE (username) = (?) AND is_active = 1";
        $result = $db->getRow($query,array($username));
        
        if ($result) {
            echo json_encode(['active' => true, 'sessionId' => $result['session_id']]);
        } else {
            echo json_encode(['active' => false]);
        }
    } else {
        echo json_encode(['error' => 'Username is required']);
    }
    

?>