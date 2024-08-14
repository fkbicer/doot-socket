<?php 
    // Database connection
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: Content-Type');

    require '../../db/database.class.php';
    $db = new Database();
    $query = "SELECT room_id FROM room_users WHERE user_id = 1";
    $result = $db->getRows($query);

    header('Content-Type: application/json');
    echo json_encode($result);
?>