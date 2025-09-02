'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;
const RAW_OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.openrouter_api_key;
const OPENROUTER_API_KEY = (RAW_OPENROUTER_KEY || '')
  .toString()
  .trim()
  .replace(/^['"]|['"]$/g, '');

const VISITS_FILE = path.join(__dirname, 'visits.json');

function readVisits() {
  try {
    if (!fs.existsSync(VISITS_FILE)) return 0;
    const raw = fs.readFileSync(VISITS_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (typeof data.count === 'number') return data.count;
    return 0;
  } catch (e) {
    return 0;
  }
}

function writeVisits(count) {
  try {
    fs.writeFileSync(VISITS_FILE, JSON.stringify({ count: count }), 'utf8');
  } catch (e) {
    // ignore
  }
}

let visits = readVisits();

app.use(express.json({ limit: '1mb' }));

// Serve static site (index.html, chat.html, assets, etc.)
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Debug endpoint (does not expose secrets)
app.get('/api/debug/env', (req, res) => {
  res.json({
    hasKey: Boolean(OPENROUTER_API_KEY && OPENROUTER_API_KEY.length >= 10),
    siteUrl: SITE_URL
  });
});

// Chat proxy to OpenRouter
app.post('/api/chat', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY in .env' });
    }

    const userMessages = Array.isArray(req.body && req.body.messages) ? req.body.messages : [];

    const systemMessage = {
      role: 'system',
      content: [
        'You are the Anxiety Remedy Hub Assistant, a compassionate, practical anxiety relief expert.',
        'Guidelines:',
        '- Prioritize evidence-based techniques (CBT reframing, cognitive restructuring, behavioral activation), simple mindfulness, breathwork, and grounding.',
        '- Offer holistic suggestions where appropriate (sleep hygiene, movement, nutrition), and a responsible perspective on spirituality as a complementary tool.',
        '- Keep a calm, encouraging tone. Give concise, stepwise suggestions users can try now.',
        '- Do not diagnose or provide medical advice. Include a gentle disclaimer if needed.',
        '- IMPORTANT: End every answer with a friendly invitation to get in touch with the experts at Anxiety Remedy Hub for more guidance and solutions (refer them to the Contact section or email sagarwalfms@gmail.com).'
      ].join('\n')
    };

    const body = {
      model: 'google/gemini-2.5-flash',
      messages: [systemMessage, ...userMessages],
      temperature: 0.6,
      top_p: 0.9
    };

    const doFetch = (typeof fetch !== 'undefined') ? fetch : (await import('node-fetch')).default;
    const response = await doFetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': 'Anxiety Remedy Hub Assistant'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Upstream error', details: text });
    }

    const data = await response.json();
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return res.json({ content: content || '' });
  } catch (err) {
    console.error('Chat proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Explicit route for chat page for direct navigation
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

app.get('/api/visits', (req, res) => {
  res.json({ count: visits });
});

app.post('/api/visits', (req, res) => {
  visits += 1;
  writeVisits(visits);
  res.json({ count: visits });
});

app.listen(PORT, () => {
  console.log(`Anxiety Remedy Hub server running at ${SITE_URL}`);
});


