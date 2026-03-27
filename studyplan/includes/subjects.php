<?php
// Subjects handler

require_once "db.php";
require_once "functions.php";

$data   = json_decode(file_get_contents("php://input"), true);
$action = $data["action"] ?? "";
$userId = intval($data["user_id"] ?? 0);

// User ID is required for all actions
if (!$userId) {
    respond(false, "User not identified.");
}

// ---- GET: Load all subjects for this user ----
if ($action === "get") {

    $stmt = $conn->prepare("SELECT id, name, code, exam_date, color, credits, added_on FROM subjects WHERE user_id = ? ORDER BY exam_date ASC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $subjects = [];
    while ($row = $result->fetch_assoc()) {
        $subjects[] = [
            "id"       => (string)$row["id"],
            "name"     => $row["name"],
            "code"     => $row["code"],
            "examDate" => $row["exam_date"],
            "color"    => $row["color"],
            "credits"  => $row["credits"],
            "addedOn"  => $row["added_on"]
        ];
    }

    echo json_encode(["success" => true, "subjects" => $subjects]);

// ---- ADD: Save a new subject ----
} elseif ($action === "add") {

    $name     = clean($data["name"]     ?? "");
    $code     = clean($data["code"]     ?? "");
    $examDate = clean($data["examDate"] ?? "");
    $color    = clean($data["color"]    ?? "#4a90d9");
    $credits  = clean($data["credits"]  ?? "");
    $addedOn  = clean($data["addedOn"]  ?? date("d/m/Y"));

    if (!$name || !$examDate) {
        respond(false, "Subject name and exam date are required.");
    }

    $stmt = $conn->prepare("INSERT INTO subjects (user_id, name, code, exam_date, color, credits, added_on) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", $userId, $name, $code, $examDate, $color, $credits, $addedOn);

    if ($stmt->execute()) {
        respond(true, "Subject added.", ["id" => (string)$conn->insert_id]);
    } else {
        respond(false, "Could not save subject.");
    }

// ---- DELETE: Remove a subject ----
} elseif ($action === "delete") {

    $subjectId = intval($data["subject_id"] ?? 0);

    if (!$subjectId) {
        respond(false, "Subject ID required.");
    }

    $stmt = $conn->prepare("DELETE FROM subjects WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $subjectId, $userId);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        respond(true, "Subject deleted.");
    } else {
        respond(false, "Subject not found.");
    }

} else {
    respond(false, "Unknown action.");
}

$conn->close();
?>
