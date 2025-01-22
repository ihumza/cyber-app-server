# Cyber App Backend

This is the backend part of the application, which handles the API for managing users, events, and other resources. It includes endpoints for CRUD operations and other necessary functionality.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ihumza/cyber-app-server.git
   cd cyber-app-server
   ```

Install dependencies:

```bash
npm install
```

Set up environment variables by updating .env file. The variables you need include:

```bash
DB_URL=mongodb://<your-database-url>
JWT_SECRET=<your-jwt-secret>
PORT=5000
API_URL=http://localhost:5000
APP_URL=http://localhost:5173
SMTP_HOST=<your-smtp-host>
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>
```

Run the app

```bash
npm run dev
```

The backend should now be running on http://localhost:5000.


## Application Architecture
### Directory Structure:
**controllers/:** Contains logic for handling API requests.

**models/:** Defines Mongoose schemas for data persistence.

**routes/:** Organizes route files for different API modules.

**middlewares/:** Custom middleware for authentication, sanitization of requests and error handling.

**services/:** Organizes service files to enable Reusable functions accross the app to avoid duplicate definitions.

**utilities/:** Constants across the app & Helper functions like email sending and token generation.

**templates/:** Email Templates

### Authentication:
JWT is used for secure authentication.
Protected routes verify tokens to restrict unauthorized access.

### Email Notifications:
Emails are sent using Nodemailer.
Configurable SMTP settings for flexibility.

### APIs Overview
#### Users:

POST /users: Create a new user.
GET /users: Retrieve all users.
PUT /users/:id: Update user details.
DELETE /users/:id: Delete a user.
#### Events:


POST /events/add: Create a new event.

GET /events: Retrieve all events with filters.

PUT /events/:id: Update an event.

DELETE /events/:id: Delete an event.
#### Reminders:


POST /reminders/add : Add a new reminder.

GET /reminders: List all reminders.

Use of cron for sending reminders via email.

### Additional Features
- Clean Directory Structure.
- Multiple security layers including the token validation. 
- Use of sanitized body to improve security layer.
- Configured Nodemailer for sending emails. 
- Impletmentation of logger helpful in debugging on server. 
- Use of mongoose middlewares to create unique identifiers for events and reminders

### Assumptions:
 Documented all assumptions for later validation (see below) assumptions

- Users must be authenticated to perform actions on users, events and reminders.
- Events can have multiple allowed users, and only they can receive reminders.
- Reminder notifications will be sent via email based on the reminderDate field.



