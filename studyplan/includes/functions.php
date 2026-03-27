<?php
// Helper functions used across the project

// Clean up user input to prevent issues
function clean($value) {
    return htmlspecialchars(strip_tags(trim($value)));
}

// Send a JSON response and stop the script
function respond($success, $message, $extra = []) {
    $result = ["success" => $success, "message" => $message];
    // Merge any extra data (like user info) into the response
    if (!empty($extra)) {
        $result = array_merge($result, $extra);
    }
    echo json_encode($result);
    exit;
}
?>
