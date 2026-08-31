# 📢 CampusPulse

### A centralized student announcement and opportunity management platform

CampusPulse is a student-focused platform designed to solve a common problem in college life: **important information is scattered across WhatsApp groups, emails, college websites, PDFs, notice boards, department announcements, clubs, and other sources.**

Because of this, students often miss important opportunities and deadlines such as hackathons, coding competitions, workshops, internships, scholarships, examinations, assignments, and placement opportunities.

CampusPulse aims to bring this information together into a **single, organized and searchable platform**.

---

## 🎯 Problem Statement

College students receive academic and extracurricular information from multiple disconnected sources. This makes it difficult to keep track of relevant announcements, deadlines, opportunities, and events.

CampusPulse provides a centralized platform where students can:

* Discover announcements and opportunities
* Search for relevant information
* Filter announcements by different criteria
* Track important dates and deadlines
* Save/bookmark announcements
* Maintain a personal user account
* Eventually receive more personalized information based on their interests

The long-term goal is to make CampusPulse an intelligent platform that can **automatically analyze and organize unstructured announcements using AI**.

---

# 🚀 Current Project Status

CampusPulse is currently in the **backend development, integration, and testing stage**.

The core backend functionality has been implemented and tested, including:

* User registration
* Password hashing
* User authentication/login
* User profile functionality
* Announcement CRUD operations
* Announcement search
* Announcement filtering
* Bookmark functionality
* User-specific data
* API authentication and authorization
* Backend/database integration
* End-to-end integration testing

The project has also been pushed to GitHub and is under active development.

---

# 🧩 Current Features

## 👤 User Management

Users can:

* Register an account
* Log in securely
* Access authenticated functionality
* View/update their profile information
* Work with user-specific data

Passwords are **hashed rather than stored as plain text**.

---

## 📢 Announcement Management

CampusPulse supports CRUD operations for announcements.

### Create

Users can create announcements containing information such as:

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

### Read

Users can retrieve:

* All announcements
* Individual announcements

### Update

Existing announcements can be modified.

### Delete

Announcements can be removed when necessary.

---

## 🔎 Search & Filtering

The backend supports searching and filtering announcements.

The system can be used to narrow announcements based on information such as:

* Search terms
* Category
* Date
* Deadline

Multiple filters can also be combined where applicable.

---

## 🔖 Bookmarks

Users can save announcements they are interested in.

Implemented functionality includes:

* Add bookmark
* Retrieve saved announcements
* Remove bookmark

This allows users to keep track of opportunities they don't want to lose.

---

# 🔐 Authentication & Security

CampusPulse includes an authentication system for protected functionality.

Implemented features include:

* User registration
* Secure password hashing
* Login
* Authentication
* Authorization for protected endpoints
* Validation of authenticated requests

Authentication and protected endpoints have been tested using the API documentation/testing interface.

---

# 🗄️ Database

CampusPulse currently uses **MySQL** as its relational database.

The database stores information related to users, announcements, and bookmarks.

### Main entities

```text
User
  │
  ├───────────────┐
  │               │
  ▼               ▼
Profile        Bookmarks
                  │
                  ▼
             Announcements
```

### Announcement fields

The announcement data currently includes:

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

### User fields

The user data includes information such as:

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

### Bookmark fields

```text
P_ID
A_ID
Saved_At
```

---

# ⚙️ Technology Stack

## Backend

* **Python**
* **FastAPI**
* **Uvicorn**

## Database

* **MySQL**
* MySQL Connector

## Data Validation

* **Pydantic**

## Authentication

* Password hashing
* Token-based authentication

## Development & Testing

* FastAPI Swagger/OpenAPI documentation
* Git
* GitHub

---

# 🏗️ Current Architecture

The current backend follows a basic API-driven architecture:

```text
                 ┌──────────────────┐
                 │     Client /     │
                 │  API Interface   │
                 └────────┬─────────┘
                          │
                          │ HTTP Requests
                          ▼
                 ┌──────────────────┐
                 │     FastAPI      │
                 │     Backend      │
                 └────────┬─────────┘
                          │
                          │ Database Queries
                          ▼
                 ┌──────────────────┐
                 │      MySQL       │
                 │     Database     │
                 └──────────────────┘
```

The planned architecture will eventually expand to include the frontend and AI processing layer.

---

# 🧪 Testing Completed

The core backend functionality has been tested through API requests and end-to-end flows.

Testing completed includes:

### Authentication

* Registration testing
* Login testing
* Protected endpoint testing
* Authorization testing

### Announcements

* Create announcement
* Retrieve announcements
* Retrieve individual announcement
* Update announcement
* Delete announcement

### Search & Filtering

* Search functionality
* Category filtering
* Date/deadline filtering
* Combined filtering

### Bookmarks

* Add bookmark
* Retrieve bookmarks
* Remove bookmark

### Integration

The complete user flow has been tested from authentication through announcement interaction and bookmarking.

---

# 🤖 Planned AI Integration

One of the main future goals of CampusPulse is to introduce an AI-powered announcement processing system.

The planned workflow is:

```text
        Raw Announcement
               │
               ▼
        ┌─────────────┐
        │  AI / LLM   │
        │   Analysis  │
        └──────┬──────┘
               │
               ▼
      Structured Information
               │
               ▼
          Validation
               │
               ▼
            MySQL
```

For example, an announcement such as:

> "The Department of AI & DS is organizing a 24-hour hackathon on September 25. Students interested in participating should register before September 20."

could be automatically transformed into structured information such as:

```text
Title: AI & DS 24-Hour Hackathon
Category: Hackathon
Department: AI & DS
Event Date: September 25
Registration Deadline: September 20
```

The AI output will be validated before being stored in the database.

---

# 🎨 Planned Frontend

A user-friendly frontend will eventually be connected to the existing backend.

Planned pages/features include:

* Login
* Registration
* Student dashboard
* Announcement cards
* Announcement details
* Search
* Filters
* Bookmarked announcements
* User profile
* Announcement creation/editing

The frontend will communicate with the FastAPI backend through REST APIs.

---

# 🗺️ Roadmap

### ✅ Completed

* [x] Project setup
* [x] FastAPI backend
* [x] MySQL database connection
* [x] Announcement CRUD
* [x] User registration
* [x] Password hashing
* [x] Login/authentication
* [x] User profile
* [x] User-specific functionality
* [x] Bookmark system
* [x] Search
* [x] Filtering
* [x] Authentication testing
* [x] CRUD testing
* [x] Bookmark testing
* [x] End-to-end backend integration testing
* [x] Git/GitHub setup
* [x] Project pushed to GitHub

### 🔄 In Progress / Next

* [ ] Backend cleanup and refactoring
* [ ] Additional validation and error handling
* [ ] AI-powered announcement extraction
* [ ] Frontend development
* [ ] Frontend-backend integration
* [ ] Deployment
* [ ] Improved personalization
* [ ] Final testing
* [ ] Documentation and project polish

### 🔮 Future Scope

* [ ] Personalized announcement recommendations
* [ ] AI-based announcement categorization
* [ ] Automatic deadline extraction
* [ ] Relevance scoring
* [ ] Notifications/reminders
* [ ] Advanced recommendation system
* [ ] Admin/moderator functionality
* [ ] Analytics dashboard
* [ ] Mobile application

---

# 💡 Why CampusPulse?

CampusPulse is intended to go beyond being another announcement board.

The goal is to create a system that can eventually understand **what an announcement contains, who it is relevant to, and what action a student needs to take**.

For example:

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
Helps student discover relevant opportunities
```

This makes CampusPulse particularly suitable for exploring the combination of:

**Software Development + Backend Engineering + Databases + AI/Data Science**

---

# 📚 Learning Goals

This project is also being developed as a practical learning project to strengthen skills in:

* Backend development
* REST API design
* FastAPI
* Database design
* SQL
* Authentication
* API security
* Git/GitHub
* AI integration
* Full-stack application development
* Software architecture
* Testing and debugging

The project is being developed incrementally, with an emphasis on understanding the underlying concepts rather than simply assembling pre-written code.

---

# 👩‍💻 Project Status

**Status:** 🚧 Under Development

CampusPulse currently has a functioning backend with core user, announcement, search/filtering, bookmark, authentication, and integration functionality implemented and tested.

The next major development stage is to add the **AI processing layer and frontend**, followed by integration, deployment, and final project refinement.

---

## 🌱 Future Vision

> **CampusPulse — Helping students stay informed, discover opportunities, and never miss what matters.**
