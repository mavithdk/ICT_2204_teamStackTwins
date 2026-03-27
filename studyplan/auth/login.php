<?php
// Login logic
// Gets called when the login form is submitted

require_once "../includes/db.php";
require_once "../includes/functions.php";

// Read the data sent from the login form
$data = json_decode(file_get_contents("php://input"), true);

$username = clean($data["username"] ?? "");
$password =        $data["password"] ?? "";

// Make sure both fields are filled
if (!$username || !$password) {
    respond(false, "Please enter your username and password.");
}

// Look up the user in the database
$stmt = $conn->prepare("SELECT id, name, edu, age, username, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

// If no user found with that username
if ($result->num_rows === 0) {
    respond(false, "Incorrect username or password.");
}

$user = $result->fetch_assoc();

// Check if the entered password matches the stored hash
if (!password_verify($password, $user["password"])) {
    respond(false, "Incorrect username or password.");
}

// Login successful - send back user info (without the password)
respond(true, "Login successful!", [
    "user" => [
        "id"       => $user["id"],
        "name"     => $user["name"],
        "edu"      => $user["edu"],
        "age"      => $user["age"],
        "username" => $user["username"]
    ]
]);

$stmt->close();
$conn->close();
?>
