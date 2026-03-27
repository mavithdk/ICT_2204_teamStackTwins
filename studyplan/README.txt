# StudyPlan – Smart Study Planner

**ICT 2204 – Web Design and Technologies**  
Mini Project | Rajarata University of Sri Lanka  
Department of Computing

**Team:** K.M.D. Kumarasinghe (ICT/2023/070) &; Y.S.S. Arachchi (ICT/2023/071)

---

## About the Project

StudyPlan is a web-based academic planner that helps students manage their subjects, track exam countdowns, and organize their daily study tasks. This phase adds a PHP and MySQL backend for user authentication and data storage.

### Features
- User registration and login with hashed passwords
- Personal study planner (add subjects with exam countdowns)
- Task manager with progress tracking
- Contact form that saves messages to the database
- Fully responsive design (works on mobile and desktop)

---

## Project Structure

```
studyplan/
│── css/
│   └── style.css               Main stylesheet
│── js/
│   ├── auth.js                 Handles login state and profile dropdown
│   ├── main.js                 Shared JS (navbar, animations, scroll)
│   └── planner.js              Planner page logic (subjects, tasks, timers)
│── images/
│   ├── index.jpg               Home page background
│   └── contact.jpg             Contact page background
│── includes/
│   ├── db.php                  Database connection
│   ├── functions.php           Helper functions
│   ├── subjects.php            Subjects API (add, get, delete)
│   └── tasks.php               Tasks API (add, get, toggle, delete)
│── auth/
│   ├── register.php            User registration logic
│   ├── login.php               User login logic
│   └── logout.php              Logout logic
│── contact.php                 Contact form handler
│── index.php                   Entry point (redirects to index.html)
│── index.html                  Home page
│── planner.html                Planner / Dashboard page
│── login.html                  Login page
│── signup.html                 Registration page
│── contact.html                Contact page
│── dashboard.php               Dashboard redirect
│── database.sql                MySQL database dump (import this)
└── README.md                   This file
```

---

## Setup Instructions

### Requirements
- XAMPP installed (Apache + MySQL)

### Step 1 – Start XAMPP
1. Open the XAMPP Control Panel
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**

### Step 2 – Copy the Project
Copy the entire `studyplan` folder into:
```
C:\xampp\htdocs\studyplan
```
*(On Mac: `/Applications/XAMPP/htdocs/studyplan`)*

### Step 3 – Import the Database
1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar
3. Type `studyplan` as the database name and click **Create**
4. Click the **Import** tab at the top
5. Click **Choose File** and select `database.sql` from the project folder
6. Click **Go** at the bottom

You should now see four tables: `users`, `subjects`, `tasks`, `messages`

### Step 4 – Open the Website
Go to: `http://localhost/studyplan/index.html`

The site is now fully working. Register an account to get started.

---

## How It Works

| Page | What it does |
|------|-------------|
| `index.html` | Home page with features overview |
| `signup.html` | Registers a new user → saves to `users` table |
| `login.html` | Logs in → checks `users` table |
| `planner.html` | Main dashboard → loads subjects and tasks from database |
| `contact.html` | Contact form → saves messages to `messages` table |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Stores registered accounts (passwords are hashed) |
| `subjects` | Stores each user's subjects and exam dates |
| `tasks` | Stores each user's tasks (linked to subjects optionally) |
| `messages` | Stores contact form submissions |

---

## Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6), Bootstrap 5
- **Backend:** PHP 8 (MySQLi)
- **Database:** MySQL (via XAMPP)
- **Other:** Google Fonts (Poppins), Bootstrap Icons
