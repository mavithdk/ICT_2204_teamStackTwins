<?php
// Database connection settings

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "studyplan";

// Connect to the database
$conn = new mysqli($host, $user, $pass, $dbname);

// Stop and show error if connection fails
if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}

// Set character encoding to support all characters
$conn->set_charset("utf8mb4");

// Allow requests from the same server (needed for fetch() calls)
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");
?>
