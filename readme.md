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
DB_URL
JWT_SECRET
PORT
API_URL
APP_URL
SMTP_HOST
SMTP_USER
SMTP_PASS
```

Run the app

```bash
npm run dev
```

The backend should now be running on http://localhost:5000.
