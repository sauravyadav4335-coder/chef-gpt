# Chef.GPT

Chef.GPT is a beginner-friendly AI cooking assistant. Ask for recipes using ingredients you already have, cooking instructions, ingredient substitutions, or meal ideas. The browser talks to a small Express server, and only the server calls Google Gemini so your API key stays private.

## What you need

- Node.js 20 or newer and npm
- A Google Gemini API key (the app does not include one)

## Run it locally

1. Open a terminal in this project folder and install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to a new file named `.env`.

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS or Linux:

   ```sh
   cp .env.example .env
   ```

3. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Add the key to `.env` as the value of `GEMINI_API_KEY`. Keep `.env private; it is excluded from Git. Do not put the key in any file under `public/`.

   ```dotenv
   GEMINI_API_KEY=your_actual_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

   `GEMINI_MODEL` is optional and defaults to `gemini-2.5-flash`.

4. Start the server:

   ```sh
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000). Try example questions such as:
   - “I have eggs, tomatoes, and bread. What can I make?”
   - “Give me an easy weeknight dinner idea with chickpeas.”
   - “What can I use instead of butter in a cake?”

The chat is kept in browser memory only. Refreshing or choosing **New chat** clears the conversation. To check that the server is running, visit [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Deploy the live app with GitHub Pages and Render

GitHub Pages hosts the static frontend, while the Express server calls Gemini and keeps the API key private.

### Deploy the backend to Render

1. Create a **Web Service** in [Render](https://render.com/) and connect this repository.
2. Set the build command to `npm install` and the start command to `npm start`.
3. In the service's **Environment** settings, add `GEMINI_API_KEY` with your own Google AI Studio key.
4. Add `CORS_ORIGINS` set to `https://sauravyadav4335-coder.github.io` (or your GitHub Pages site origin). Do not include a trailing slash.
5. Deploy the service and copy its public URL.

Render supplies the `PORT` environment variable. You may optionally set `GEMINI_MODEL` (for example, `gemini-2.5-flash`).

### Deploy the frontend to GitHub Pages

1. In the repository's **Settings → Pages**, set the source to **GitHub Actions**.
2. In **Settings → Secrets and variables → Actions → Variables**, create a repository variable named `CHEF_GPT_API_URL` and set it to the Render service URL (for example, `https://your-service.onrender.com`).
3. Push a change to `main`, or run the **Deploy to GitHub Pages** workflow from the **Actions** tab.
4. Visit `https://sauravyadav4335-coder.github.io/chef-gpt/`.

The workflow writes the backend URL into the public frontend at deploy time. This URL is not secret. Never put `GEMINI_API_KEY` in a GitHub variable, frontend file, or commit; keep it only in Render's environment settings.

## Project structure

- `server.js` — Express routes, request validation, and the server-side Gemini call.
- `public/index.html` — accessible chat interface and Chef.GPT introduction.
- `public/style.css` — responsive visual design.
- `public/app.js` — browser interactions and in-memory chat history.
- `.env.example` — placeholder configuration; copy it to `.env` for local use.
