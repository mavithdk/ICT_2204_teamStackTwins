CREATE DATABASE IF NOT EXISTS studyplan;
USE studyplan;

-- Users table
-- Stores registered user accounts
CREATE TABLE IF NOT EXISTS users (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    edu        VARCHAR(150) NOT NULL,
    age        INT          NOT NULL,
    username   VARCHAR(60)  NOT NULL UNIQUE,
    email      VARCHAR(100) DEFAULT '',
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
-- Each subject belongs to a user
CREATE TABLE IF NOT EXISTS subjects (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    name       VARCHAR(100) NOT NULL,
    code       VARCHAR(20)  DEFAULT '',
    exam_date  DATE         NOT NULL,
    color      VARCHAR(20)  DEFAULT '#4a90d9',
    credits    VARCHAR(10)  DEFAULT '',
    added_on   VARCHAR(30)  DEFAULT '',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks table
-- Each task belongs to a user and optionally links to a subject
CREATE TABLE IF NOT EXISTS tasks (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    subject_id INT          DEFAULT NULL,
    text       VARCHAR(255) NOT NULL,
    completed  TINYINT(1)   DEFAULT 0,
    added_on   VARCHAR(30)  DEFAULT '',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- Messages table
-- Stores contact form submissions
CREATE TABLE IF NOT EXISTS messages (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL,
    subject    VARCHAR(100) DEFAULT '',
    message    TEXT         NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
