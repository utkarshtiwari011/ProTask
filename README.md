# ProTask - Team Task Manager

A full-stack collaborative task management application with role-based access control, real-time activity tracking, and team performance analytics.

## Features

- **RBAC**: Admin and Member roles.
- **Project Hub**: Create and manage multiple workspaces.
- **Kanban Board**: Drag-and-drop style task tracking.
- **Discussions**: Task-specific commenting system.
- **Activity Log**: Real-time project action tracking.
- **Analytics**: Team progress and efficiency metrics.

---

## Setup & Connection Instructions

### 1. Database Setup (MongoDB)

You have two options for the database:

#### Option A: Local MongoDB (Default)
1. Ensure [MongoDB Community Server](https://www.mongodb.com/try/download/community) is installed and running on your machine.
2. The app will automatically connect to `mongodb://localhost:27017/protask`.

#### Option B: MongoDB Atlas (Cloud - Recommended for Deployment)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection string (SRV).
3. Open `server/.env` and replace `MONGO_URI` with your connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/protask?retryWrites=true&w=majority
   ```

### 2. Dependency Installation

From the root directory, run:
```bash
npm run install-all
```

### 3. Seed Initial Data (Optional)

To populate the app with demo users, projects, and tasks:
```bash
node server/seeder.js -i
```
*Note: This will clear existing data in the database.*

---

## Running the Application

### Development Mode

Run both the server and client simultaneously from the root:
```bash
# Start Backend (Port 5000)
npm run server

# Start Frontend (Port 5173)
npm run client
```

### Production Build

To build the frontend and serve it from the backend (as on Railway/Heroku):
```bash
npm run build
npm start
```

---

## Credentials (Demo)

If you ran the seeder, use these logins:
- **Admin**: `admin@test.com` / `password123`
- **Member**: `sarah@test.com` / `password123`
