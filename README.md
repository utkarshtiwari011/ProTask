# ProTask - Team Task Manager 🚀

A modern, full-stack collaborative task management application featuring a futuristic glassmorphism UI, role-based access control (RBAC), real-time activity tracking, and team performance analytics. 

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Distinct `Admin` and `Member` privileges ensuring data security.
- **Project Hub**: Create, manage, and delete multiple workspaces. Admins can assign users to specific projects.
- **Kanban Board UI**: Intuitive task tracking (Todo, In-Progress, Done) with smooth Framer Motion animations.
- **Activity Log**: Real-time tracking of project and task updates.
- **Dynamic User Profiles**: Track individual skillsets, completed tasks, and performance metrics.
- **Team Analytics**: Visual charts (Chart.js) showing team progress and efficiency metrics.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Framer Motion (animations), Lucide React (icons), Chart.js
- **Backend**: Node.js, Express (v5)
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

---

## 💻 Local Development Setup

### 1. Database Setup
Ensure you have MongoDB running locally, or use a free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
If using Atlas, rename `server/.env.example` to `server/.env` and update the `MONGO_URI`. 

*(Important: If your MongoDB password contains an `@` symbol, it must be URL-encoded as `%40` in the connection string)*.

### 2. Dependency Installation
From the root directory, run the custom install script to install dependencies for both the frontend and backend simultaneously:
```bash
npm run install-all
```

### 3. Seed Initial Data (Required for Testing)
Populate the database with the Admin account, 10+ Test Members, demo projects, and tasks:
```bash
node server/seeder.js -i
```

### 4. Start the Application
Run both the frontend and backend servers at the same time:
```bash
# Backend runs on Port 5000, Frontend runs on Port 5173/5174
npm run server
npm run client
```

---

## ☁️ Deployment Guide (Railway / Render)

This application is configured as a monorepo and is fully ready for deployment platforms like [Railway]([https://railway.app/](https://web-production-3b334.up.railway.app/login)).

### Step 1: Deploy from GitHub
1. Push this repository to GitHub.
2. In Railway, click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository. Railway will automatically detect the root `package.json` and use the `npm run build` and `npm start` commands to build and serve the application.

### Step 2: Configure MongoDB Atlas for Deployment
By default, MongoDB Atlas blocks connections from cloud servers like Railway. **You must allow access:**
1. Go to your MongoDB Atlas Dashboard.
2. Navigate to **Security** -> **Network Access**.
3. Click **+ Add IP Address**.
4. Select **Allow Access From Anywhere** (this will add `0.0.0.0/0`).
5. Click **Confirm**.

### Step 3: Add Environment Variables
In your Railway project dashboard, go to the **Variables** tab and add:
- `MONGO_URI`: Your MongoDB Atlas Connection String *(Remember to URL encode special characters in your password!)*
- `JWT_SECRET`: Any random secure string (e.g., `supersecret123`)

---

## 🔑 Demo Credentials

Once the database is seeded (`node server/seeder.js -i`), you can log in with:

**Admin Account** (Full Access)
- **Email**: `admin@test.com`
- **Password**: `password123`

**Standard Members** (Limited Access)
- **Email**: `sarah@test.com` (or `mike@test.com`, `member4@test.com`... up to `member13@test.com`)
- **Password**: `password123`
