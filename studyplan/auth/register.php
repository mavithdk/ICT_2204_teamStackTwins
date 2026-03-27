<?php
// Registration logic

require_once "../includes/db.php";
require_once "../includes/functions.php";

// Read the data sent from the signup form (sent as JSON)
$data = json_decode(file_get_contents("php://input"), true);

// Get each field and clean it
$name     = clean($data["name"]     ?? "");
$edu      = clean($data["edu"]      ?? "");
$age      = intval($data["age"]     ?? 0);
$username = clean($data["username"] ?? "");
$password =        $data["password"] ?? "";

// Make sure all fields are filled
if (!$name || !$edu || !$age || !$username || !$password) {
    respond(false, "Please fill in all fields.");
}

// Basic checks
if (strlen($username) < 3) {
    respond(false, "Username must be at least 3 characters.");
}

if (strlen($password) < 6) {
    respond(false, "Password must be at least 6 characters.");
}

if ($age < 10 || $age > 100) {
    respond(false, "Please enter a valid age.");
}

// Check if the username is already taken
$check = $conn->prepare("SELECT id FROM users WHERE username = ?");
$check->bind_param("s", $username);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    respond(false, "That username is already taken. Try another one.");
}
$check->close();

// Hash the password before saving (never save plain text passwords)
$hashed = password_hash($password, PASSWORD_DEFAULT);

// Insert the new user into the database
$stmt = $conn->prepare("INSERT INTO users (name, edu, age, username, password) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssiss", $name, $edu, $age, $username, $hashed);

if ($stmt->execute()) {
    // Get the new user's ID
    $newId = $conn->insert_id;

    // Send back the user info (without the password)
    respond(true, "Account created successfully!", [
        "user" => [
            "id"       => $newId,
            "name"     => $name,
            "edu"      => $edu,
            "age"      => $age,
            "username" => $username
        ]
    ]);
} else {
    respond(false, "Something went wrong. Please try again.");
}

$stmt->close();
$conn->close();
?>
