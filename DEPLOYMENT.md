# Deployment Guide - Inventory & Order Management System

This document outlines the steps required to deploy the containerized full-stack application online using free hosting platforms.

---

## 1. Database Deployment

You need a hosted PostgreSQL database. Free PostgreSQL hosting can be obtained from:
- **Supabase** (Recommended: free tier PostgreSQL database)
- **Neon** (Serverless PostgreSQL with a generous free tier)
- **Aiven** (Managed PostgreSQL)

### Steps (e.g., Neon or Supabase):
1. Sign up for a free account at [Neon.tech](https://neon.tech/) or [Supabase.com](https://supabase.com/).
2. Create a new PostgreSQL database project.
3. Save the connection string (URI). It will look like:
   `postgresql://username:password@hostname:5432/dbname?sslmode=require`

---

## 2. Backend API Deployment

Deploy the FastAPI backend service to **Vercel**, **Render**, or **Railway**.

### Option A: Vercel (FastAPI Serverless - Recommended)
1. Sign up/Log in at [Vercel.com](https://vercel.com/).
2. Click **Add New Project** and import your GitHub repository.
3. Configure the Project settings:
   - **Project Name**: `inventory-api`
   - **Root Directory**: `backend` (this is critical so Vercel builds dependencies inside the `backend` folder)
   - Keep default build settings (Vercel automatically detects python configuration from `vercel.json`).
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your hosted PostgreSQL connection URI (from Step 1).
5. Click **Deploy**. Vercel will build the serverless function and expose a public URL (e.g. `https://inventory-api.vercel.app`).

### Option B: Render (Web Service)
1. Sign up/Log in at [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `inventory-api`
   - **Environment**: `Docker`
   - **Docker Context**: `backend` (set the Root Directory to `backend` or use the default and point the Docker Path to `./backend/Dockerfile`)
5. Under **Advanced / Environment Variables**, add the following key:
   - `DATABASE_URL`: Set this to your hosted PostgreSQL connection URI (from Step 1).
6. Click **Deploy Web Service**. Render will automatically detect the Dockerfile, build the image, and host the API.

---

## 3. Frontend Deployment

Deploy the React frontend application to **Vercel** or **Netlify**.

### Option A: Vercel (Recommended)
1. Sign up/Log in at [Vercel.com](https://vercel.com/).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Configure the Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Set this to your live Render/Railway backend URL (e.g., `https://inventory-api.onrender.com`).
6. Click **Deploy**. Vercel will build and serve your static React application on a public URL.

### Option B: Netlify
1. Sign up/Log in at [Netlify.com](https://netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Connect your GitHub repository.
4. Configure the build parameters:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist` (or `dist` since Vite builds inside the base directory)
5. Under **Site configuration** -> **Environment variables**, add:
   - `VITE_API_URL`: Your live backend API URL.
6. Click **Deploy site**.

---

## 4. Verification Check

Once both services are deployed, check the following:
1. Open the frontend URL in your browser.
2. Verify that the dashboard stats successfully fetch from the backend (they should all show `0` initially).
3. Open `<your-backend-url>/docs` to view the interactive FastAPI Swagger API documentation.
4. Test adding a product and a customer via the frontend to confirm successful end-to-end communication.
