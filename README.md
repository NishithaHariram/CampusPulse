# 📢 CampusPulse

### A centralized student announcement and opportunity management platform

CampusPulse is a full-stack student-focused platform designed to solve a common problem in college life: important information is scattered across WhatsApp groups, emails, college websites, PDFs, notice boards, department announcements, clubs, and other sources.

Because of this, students can easily miss hackathons, coding competitions, workshops, internships, scholarships, examinations, assignments, placement opportunities, and important deadlines.

CampusPulse brings this information into one centralized, searchable platform.

---

## 🎯 Problem Statement

College students receive academic and extracurricular information from multiple disconnected sources.

CampusPulse aims to provide a single platform where students can:

* Discover announcements and opportunities
* Search announcements
* Filter announcements by category and date
* View announcement details
* Track important deadlines and event dates
* Bookmark announcements
* Manage their personal account
* Use AI to extract structured information from raw announcements

The long-term goal is to make CampusPulse an intelligent student information platform that can understand announcements and help students discover information relevant to them.

---

# 🚀 Current Project Status

**Status: 🚧 Working Prototype**

CampusPulse currently contains a working backend, database, frontend, authentication system, bookmark functionality, search/filter functionality, and AI-powered announcement extraction.

The current prototype is being tested locally through the integrated frontend and backend.

### Current working areas

* User registration
* User login and authentication
* JWT-based protected requests
* User profile
* Announcement management
* Announcement details
* Search
* Filtering
* Bookmark management
* AI announcement extraction
* Frontend-backend integration
* MySQL database integration

The project is currently undergoing stabilization and bug fixing before moving toward a beta version.

---

# ✨ Features

## 👤 User Management

Users can:

* Create an account
* Log in securely
* Access authenticated features
* View their profile
* Manage user-specific information

Passwords are hashed rather than stored as plain text.

---

## 📢 Announcements

CampusPulse supports announcement management through the backend API.

Announcements contain information such as:

* Title
* Category
* Deadline
* Event date
* Department
* Topic
* Source
* Important link
* Requirements
* Notes

Users can:

* View all announcements
* View individual announcements
* Search announcements
* Filter announcements
* Interact with announcements through the frontend

---

## 🔎 Search & Filtering

The application supports searching and filtering announcements using information such as:

* Search terms
* Category
* Dates
* Deadlines

This allows students to quickly narrow down announcements relevant to them.

---

## 🔖 Bookmarks

Students can save announcements they are interested in.

The backend supports bookmark operations including:

* Add bookmark
* Retrieve a user's bookmarks
* Remove bookmark

The frontend provides bookmark interaction so students can maintain a personal collection of useful announcements.

---

## 🤖 AI Announcement Extraction

CampusPulse includes an AI-powered announcement extraction feature.

### Workflow

```text
Raw Announcement
       ↓
     Gemini
       ↓
Structured Information
       ↓
Pydantic Validation
       ↓
CampusPulse Backend
       ↓
MySQL
```

The AI extracts fields such as:

* Title
* Category
* Deadline
* Event date
* Department
* Topic
* Source
* Important link
* Requirements
* Notes

The system is designed to avoid inventing missing information and uses structured output validation before the data is processed further.

---

# 🔐 Authentication & Security

CampusPulse uses authenticated API requests for protected functionality.

Current authentication functionality includes:

* User registration
* Password hashing
* Login
* JWT authentication
* Protected endpoints
* Authorization checks
* User-specific data access

The frontend stores the authentication token locally and sends it with protected API requests.

---

# 🗄️ Database

CampusPulse currently uses **MySQL** as its relational database.

### Main entities

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Profile       Bookmarks
                  │
                  ▼
             Announcements
```

### User

```text
P_ID
name
email
username
password
year
college
stream
preferences
```

### Announcement

```text
A_ID
title
category
deadline
event_date
department
topic
source
important_link
requirements
notes
```

### Bookmark

```text
P_ID
A_ID
Saved_At
```

---

# ⚙️ Technology Stack

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* MySQL Connector

## Frontend

* React
* JavaScript
* Vite
* Bolt.new-assisted frontend development

## Database

* MySQL

## AI

* Google Gemini API

## Authentication

* JWT
* Password hashing

## Development & Testing

* VS Code
* FastAPI Swagger/OpenAPI
* Git
* GitHub
* ngrok for local frontend-backend connectivity during development

---

# 🏗️ Architecture

The current prototype follows an API-driven full-stack architecture:

```text
                 ┌─────────────────────┐
                 │      React          │
                 │     Frontend        │
                 └──────────┬──────────┘
                            │
                            │ HTTP / REST API
                            ▼
                 ┌─────────────────────┐
                 │      FastAPI        │
                 │      Backend       │
                 └───────┬─────┬───────┘
                         │     │
             ┌───────────┘     └────────────┐
             ▼                              ▼
     ┌────────────────┐             ┌────────────────┐
     │     MySQL      │             │  Gemini AI     │
     │    Database    │             │   Processing   │
     └────────────────┘             └────────────────┘
```

During local development, the frontend can communicate with the locally running FastAPI backend through an ngrok tunnel.

The planned beta architecture will replace this development tunnel with deployed backend and frontend services.

---

# 🧪 Testing

The project has undergone testing across the major backend and frontend flows.

### Authentication

* Registration
* Login
* JWT authentication
* Protected requests
* Logout/login flow

### Announcements

* Retrieve announcements
* Retrieve individual announcement
* Search
* Filtering
* Announcement interaction

### Bookmarks

* Add bookmark
* Retrieve bookmarks
* Remove bookmark

### AI

* Raw announcement submission
* AI extraction
* Structured response validation
* Backend integration

### Integration

The frontend and backend have been connected and tested as an integrated application.

Current work is focused on fixing remaining UI/API interaction issues and improving the reliability of the complete user flow.

---

# 🗺️ Roadmap

## ✅ Completed

* [x] Project setup
* [x] FastAPI backend
* [x] MySQL database connection
* [x] User registration
* [x] Password hashing
* [x] Login/authentication
* [x] JWT authorization
* [x] User profile
* [x] Announcement CRUD
* [x] Search
* [x] Filtering
* [x] Bookmark system
* [x] AI announcement extraction
* [x] Frontend development
* [x] Frontend-backend integration
* [x] Git/GitHub setup
* [x] Initial end-to-end testing

## 🔄 Current Stage

* [ ] Fix remaining frontend/API bugs
* [ ] Complete user-facing bookmark management
* [ ] Complete user account management
* [ ] Improve error handling
* [ ] Complete stabilization testing
* [ ] Prepare beta version
* [ ] Deploy backend
* [ ] Deploy frontend
* [ ] Connect cloud database

## 🔮 Future Scope

* [ ] Personalized announcement recommendations
* [ ] Relevance scoring
* [ ] Automatic deadline extraction
* [ ] Email notifications
* [ ] Reminder system
* [ ] Chrome extension
* [ ] PWA/mobile experience
* [ ] Native mobile application
* [ ] Admin/moderator functionality
* [ ] Analytics dashboard
* [ ] Improved AI categorization
* [ ] Automated announcement collection

---

# 🌱 Future Vision

CampusPulse is intended to evolve beyond a basic announcement board.

The long-term workflow is:

```text
Announcement
      ↓
AI understands content
      ↓
Extracts important information
      ↓
Categorizes announcement
      ↓
Stores structured data
      ↓
Matches student interests
      ↓
Helps students discover relevant opportunities
```

The larger goal is to create a student information platform that helps students stay informed, discover opportunities, and avoid missing important deadlines.

---

# 📚 Learning Goals

CampusPulse is also a practical learning project focused on strengthening skills in:

* Backend development
* REST API design
* FastAPI
* SQL and database design
* Authentication
* API security
* Git/GitHub
* AI integration
* React frontend development
* Full-stack application development
* Software architecture
* Testing and debugging

The project is being developed incrementally with an emphasis on understanding the underlying concepts rather than simply assembling pre-written code.

---

## 👩‍💻 Project Status

**CampusPulse — Working Prototype 🚧**

CampusPulse currently combines:

**React + FastAPI + MySQL + JWT Authentication + Gemini AI**

The immediate goal is to stabilize the existing prototype and prepare it for a small beta release.

---

## 🌟 Vision

> **CampusPulse — Helping students stay informed, discover opportunities, and never miss what matters.**
