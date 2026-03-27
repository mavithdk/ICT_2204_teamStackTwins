<?php
// Contact form handler
// Saves the message to the messages table in the database

require_once "includes/db.php";
require_once "includes/functions.php";

$data = json_decode(file_get_contents("php://input"), true);

// Get form fields
$name    = clean($data["name"]    ?? "");
$email   = clean($data["email"]   ?? "");
$subject = clean($data["subject"] ?? "");
$message = clean($data["message"] ?? "");

// Basic validation
if (!$name || !$email || !$subject || !$message) {
    respond(false, "Please fill in all fields.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "Please enter a valid email address.");
}

if (strlen($message) < 20) {
    respond(false, "Message is too short.");
}

// Save the message to the database
$stmt = $conn->prepare("INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $subject, $message);

if ($stmt->execute()) {
    respond(true, "Message received. We will get back to you soon!");
} else {
    respond(false, "Could not save your message. Please try again.");
}

$stmt->close();
$conn->close();
?>
