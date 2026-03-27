<?php
// Logout logic
// Destroys the session and redirects to the home page

session_start();
session_destroy();

// Also tell the browser to clear login data
header("Content-Type: application/json");
echo json_encode(["success" => true, "message" => "Logged out."]);
?>
