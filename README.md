# Anxiety Remedy Hub

A compassionate anxiety relief website with an AI-powered assistant to help users manage anxiety through evidence-based techniques.

## Features

- 🏠 **Main Website**: Information about anxiety relief techniques and resources
- 💬 **AI Chat Assistant**: Powered by OpenRouter API for personalized anxiety support
- 📊 **Visit Tracking**: Simple analytics for site visits
- 🔒 **Secure**: Environment variables for sensitive data

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENROUTER_API_KEY
   ```

3. **Start the server**:
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

4. **Open your browser**: Navigate to http://localhost:3000

## Deployment

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to [Vercel](https://vercel.com)
3. Add your `OPENROUTER_API_KEY` to Vercel environment variables
4. Deploy!

### Deploy to Railway

1. Push your code to GitHub
2. Connect your repository to [Railway](https://railway.app)
3. Add environment variables
4. Deploy!

### Deploy to Render

1. Push your code to GitHub
2. Create a new web service on [Render](https://render.com)
3. Connect your GitHub repository
4. Add environment variables
5. Deploy!

## Environment Variables

- `OPENROUTER_API_KEY`: Required for chat functionality
- `PORT`: Server port (defaults to 3000)
- `SITE_URL`: Your deployed site URL

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **AI**: OpenRouter API (Google Gemini 2.5 Flash)
- **Deployment**: Vercel/Railway/Render

## API Endpoints

- `GET /` - Main website
- `GET /chat` - Chat page
- `POST /api/chat` - Chat with AI assistant
- `GET /api/visits` - Get visit count
- `POST /api/visits` - Increment visit count
- `GET /health` - Health check
