# MANI'S CHIT FUND — Deployment Guide for Render.com

This guide will walk you through hosting **MANI'S CHIT FUND** live on Render with automated builds and free HTTPS.

---

## Step 1: Create a GitHub Repository

1. Open [github.com/new](https://github.com/new) in your browser.
2. Set Repository name: `manis-chit-fund`
3. Choose **Public** or **Private** (both work).
4. Do **not** initialize with README or .gitignore (we already created them).
5. Click **Create repository**.

---

## Step 2: Push Your Local Code to GitHub

In your terminal, run the following commands (replace `<YOUR-GITHUB-USERNAME>` with your real GitHub username):

```bash
cd /Users/gowthamavr/.gemini/antigravity/scratch/mani-chit-fund
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/manis-chit-fund.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy on Render.com

1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign up or log in (you can log in directly with your GitHub account).
2. Click the **New +** button in the top right &rarr; select **Web Service**.
3. Choose **Build and deploy from a Git repository** &rarr; click **Next**.
4. Select your `manis-chit-fund` repository.
5. Fill in the service configuration:
   - **Name**: `manis-chit-fund` *(or whatever you prefer)*
   - **Region**: Singapore or Frankfurt *(closest to India)*
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: Select **Free** ($0/month).

6. Scroll down to **Environment Variables** and add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `mani-chit-fund-super-secure-production-key-2026`

7. Click **Create Web Service** at the bottom!

---

## Step 4: Your Live URL!

Render will build both the frontend and backend, seed the initial database, and give you a free live URL:

👉 **`https://manis-chit-fund.onrender.com`**

Share this link with your members and organiser — they can open it on mobile, tablet, or PC from anywhere in the world!
