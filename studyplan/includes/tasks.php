<?php
// Tasks handler

require_once "db.php";
require_once "functions.php";

$data   = json_decode(file_get_contents("php://input"), true);
$action = $data["action"] ?? "";
$userId = intval($data["user_id"] ?? 0);

if (!$userId) {
    respond(false, "User not identified.");
}

// ---- GET: Load all tasks for this user ----
if ($action === "get") {

    $stmt = $conn->prepare("SELECT id, subject_id, text, completed, added_on FROM tasks WHERE user_id = ? ORDER BY created_at ASC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = [
            "id"        => (string)$row["id"],
            "subjectId" => $row["subject_id"] ? (string)$row["subject_id"] : "",
            "text"      => $row["text"],
            "completed" => (bool)$row["completed"],
            "addedOn"   => $row["added_on"]
        ];
    }

    echo json_encode(["success" => true, "tasks" => $tasks]);

// ---- ADD: Save a new task ----
} elseif ($action === "add") {

    $text      = clean($data["text"]    ?? "");
    $subjectId = $data["subjectId"]     ?? null;
    $addedOn   = clean($data["addedOn"] ?? date("d/m/Y"));

    if (!$text) {
        respond(false, "Task text is required.");
    }

    // subject_id can be empty if the task is not linked to a subject
    $subjectId = $subjectId ? intval($subjectId) : null;

    $stmt = $conn->prepare("INSERT INTO tasks (user_id, subject_id, text, completed, added_on) VALUES (?, ?, ?, 0, ?)");
    $stmt->bind_param("iiss", $userId, $subjectId, $text, $addedOn);

    if ($stmt->execute()) {
        respond(true, "Task added.", ["id" => (string)$conn->insert_id]);
    } else {
        respond(false, "Could not save task.");
    }

// ---- TOGGLE: Mark task as done or not done ----
} elseif ($action === "toggle") {

    $taskId    = intval($data["task_id"]   ?? 0);
    $completed = intval($data["completed"] ?? 0);

    if (!$taskId) {
        respond(false, "Task ID required.");
    }

    $stmt = $conn->prepare("UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("iii", $completed, $taskId, $userId);

    if ($stmt->execute()) {
        respond(true, "Task updated.");
    } else {
        respond(false, "Could not update task.");
    }

// ---- DELETE: Remove a task ----
} elseif ($action === "delete") {

    $taskId = intval($data["task_id"] ?? 0);

    if (!$taskId) {
        respond(false, "Task ID required.");
    }

    $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $taskId, $userId);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        respond(true, "Task deleted.");
    } else {
        respond(false, "Task not found.");
    }

} else {
    respond(false, "Unknown action.");
}

$conn->close();
?>
