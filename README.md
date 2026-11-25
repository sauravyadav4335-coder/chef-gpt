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

## Deploy to Render

1. Push this project to a Git repository and create a **Web Service** in [Render](https://render.com/), connecting that repository.
2. Set the build command to `npm install`.
3. Set the start command to `npm start`.
4. In the service's **Environment** settings, add `GEMINI_API_KEY` with your own Google AI Studio key. You may optionally add `GEMINI_MODEL` (for example, `gemini-2.5-flash`).
5. Deploy the service. Render supplies the `PORT` environment variable used by the Express server.

Do not commit `.env` or paste your API key into frontend code. The key must be configured as a server environment variable on Render.

## Project structure

- `server.js` — Express routes, request validation, and the server-side Gemini call.
- `public/index.html` — accessible chat interface and Chef.GPT introduction.
- `public/style.css` — responsive visual design.
- `public/app.js` — browser interactions and in-memory chat history.
- `.env.example` — placeholder configuration; copy it to `.env` for local use.
