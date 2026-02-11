# Deploy this backend on Vercel

This guide covers deploying the Tinder-like backend on Vercel and wiring your frontend to it.

---

## 1. What’s in this repo

- **Express** app in `src/app.js` (auth, profile, requests, users).
- **MongoDB** via Mongoose (`DB_CONNECTION_SECRET`).
- **Vercel serverless**: `api/index.js` + `vercel.json` so the same app runs as a serverless function.

After deployment, all backend routes are under **`/api`**, e.g.:

- `https://your-backend.vercel.app/api/signup`
- `https://your-backend.vercel.app/api/login`
- `https://your-backend.vercel.app/api/profile/view`
- etc.

---

## 2. Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) (optional): `npm i -g vercel`
- MongoDB (e.g. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) and a connection string

---

## 3. Deploy the backend

### Option A: Deploy with Vercel dashboard (Git)

1. Push this backend repo to **GitHub / GitLab / Bitbucket**.
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
3. Import the **backend** repo (this folder).
4. **Root Directory**: leave as `.` (project root).
5. **Framework Preset**: leave as “Other” (no change).
6. **Build and Output**: no build step; leave **Build Command** and **Output Directory** empty.
7. Click **Deploy**. Wait for the first deployment to finish.

### Option B: Deploy with Vercel CLI

From the **backend** folder (this repo):

```bash
cd c:\dev-Tinder-Backend
npx vercel
```

Follow the prompts (link to your Vercel account, project name). For production:

```bash
npx vercel --prod
```

---

## 4. Set environment variables (required)

In the Vercel project: **Settings → Environment Variables**. Add:

| Name                   | Value                    | Notes                          |
|------------------------|--------------------------|--------------------------------|
| `DB_CONNECTION_SECRET` | `mongodb+srv://...`      | Your MongoDB connection string |
| `JWT_SECRET`           | (your secret string)     | Same as in auth/JWT code       |
| `CORS_ORIGIN`          | `https://your-frontend.vercel.app` | Frontend URL (see below) |

- Enable these for **Production** (and Preview if you use preview deployments).
- After saving, **redeploy** the project (Deployments → … → Redeploy) so the new variables are used.

---

## 5. Frontend: point to the backend

Your frontend must call the **deployed** backend URL, with all routes under **`/api`**.

**Backend base URL:**

```text
https://<your-backend-project>.vercel.app/api
```

Examples:

- Login: `POST https://<your-backend>.vercel.app/api/login`
- Signup: `POST https://<your-backend>.vercel.app/api/signup`
- Profile: `GET https://<your-backend>.vercel.app/api/profile/view` (with credentials/cookies as you use today)

In your **frontend** app:

1. Set the API base URL via env (recommended), e.g.  
   `VITE_API_URL=https://<your-backend>.vercel.app/api` (Vite)  
   or `REACT_APP_API_URL=...` (Create React App).
2. Use that base URL for all auth, profile, and user/request APIs (e.g. `fetch(\`${API_URL}/login\`, ...)`).
3. Ensure **credentials** are sent if you use cookies (e.g. `fetch(..., { credentials: 'include' })`).

Then set **backend** `CORS_ORIGIN` to your **frontend** origin, e.g.:

- `https://your-frontend.vercel.app` (no trailing slash)
- For local dev: `http://localhost:5173` (or whatever port you use)

---

## 6. Deploy frontend on Vercel (separate project)

- Create a **second** Vercel project and import your **frontend** repo.
- Build command and output directory depend on your stack (e.g. Vite: `npm run build`, output `dist`).
- In the **frontend** project, set the same env (e.g. `VITE_API_URL=https://<your-backend>.vercel.app/api`).
- In the **backend** project, set `CORS_ORIGIN` to the frontend URL Vercel gives you (e.g. `https://your-frontend.vercel.app`).

---

## 7. Local development

- Backend: from this folder run `npm run dev` (or `npm start`). Uses `PORT` and `.env` (e.g. `DB_CONNECTION_SECRET`, `JWT_SECRET`, `CORS_ORIGIN=http://localhost:5173`).
- Frontend: point its API base URL to `http://localhost:3000` (or your backend port) **without** `/api` (local app serves routes at `/`).

---

## 8. Checklist

- [ ] Backend repo pushed and deployed on Vercel.
- [ ] `DB_CONNECTION_SECRET`, `JWT_SECRET`, and `CORS_ORIGIN` set in backend project.
- [ ] Frontend uses backend base URL `https://<backend>.vercel.app/api`.
- [ ] Frontend deployed and its URL set as `CORS_ORIGIN` in backend.
- [ ] Cookies/credentials sent from frontend if your auth uses them.

If something fails, check **Vercel → Project → Deployments → Function logs** for the backend and the browser Network tab for CORS or 404 errors.
