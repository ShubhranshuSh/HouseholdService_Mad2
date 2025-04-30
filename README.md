# Household Services Platform

A full-stack web application that connects customers with household service professionals, with an admin overseeing operations. The platform streamlines service management, request handling, user authentication, and reporting, using modern tools for backend processing, frontend interaction, and asynchronous task handling.

## Roles & Functionality

### Admin
- Manages all users and services
- Approves or blocks service professionals
- Flags/unflags services
- Exports data in CSV format
- Views platform activity and analytics

### Service Professionals
- Register and manage their services
- Accept/reject customer requests
- Mark requests as completed
- View feedback and performance analytics

### Customer
- Search and filter services (by category or pincode)
- Create, modify, cancel, and track service requests
- Leave feedback after service completion
- Receive monthly reports and service reminders

---

## Tech Stack

### Backend
- **Python**
- **Flask** – Lightweight backend framework
- **Flask-SQLAlchemy** – ORM for SQLite
- **Flask-Security** – Role-based auth with tokens
- **Celery** – Background task management
- **Redis** – Task queue & caching
- **SQLite** – Lightweight local database

### Frontend
- **Vue.js** – Reactive UI framework
- **HTML5/CSS3** – Markup and styling
- **Bootstrap** – Responsive design
- **Chart.js** – Interactive visualizations

---

## API Overview

- **Authentication**
  - Token-based login/signup
  - Role-based access control (Admin, Professional, Customer)

- **Admin Endpoints**
  - CRUD operations on services
  - Manage users and service requests
  - Flag services, export data as CSV

- **Professional Endpoints**
  - Add/Edit/Delete services
  - Accept/Reject/Complete requests

- **Customer Endpoints**
  - Browse & search services by filters
  - Manage service requests
  - Provide feedback after completion

---

## Database Schema

- `User`: Stores email, phone, role (admin/professional/customer)
- `Service`: Contains service details – name, price, category, duration, etc.
- `ServiceRequest`: Links customer to service, includes status, feedback, etc.
- `UserRoles`: Supports many-to-many relationship between users and roles

---


---

## Getting Started

### Backend Setup

### 1. **Create a virtual environment**

#### For Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

#### For Linux/MacOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2. **Install dependencies**
```bash
pip install -r requirements.txt
```

#### 3. **Run the application**
```bash
python app.py
```

### Services Required (Redis, Celery, Mailhog)
#### If you're on Windows, install WSL to run Redis and Celery.

#### 1. Start Redis server
```bash
redis-server
```

#### 2. Start MailHog (for testing email)
```bash
MailHog
```

#### 3. Start Celery worker
```bash
celery -A app.celery_app worker --loglevel=info
```
#### 4. Start Celery beat (for periodic tasks)
```bash
celery -A app.celery_app beat --loglevel=info


