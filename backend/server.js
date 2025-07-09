const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { sendRateLimitAlert } = require('../src/lib/server-utils');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API1_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API2_URL = process.env.API2_URL || 'https://your-backup-api.com/chat';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_KEY2 = process.env.OPENROUTER_API_KEY2;

const ALERT_LOG_PATH = path.join(__dirname, 'rate_limit_alert_log.json');

function hasSentAlertToday() {
  try {
    const log = JSON.parse(fs.readFileSync(ALERT_LOG_PATH, 'utf8'));
    const today = new Date().toISOString().slice(0, 10);
    return log.date === today;
  } catch {
    return false;
  }
}

function markAlertSentToday() {
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(ALERT_LOG_PATH, JSON.stringify({ date: today }));
}

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  // 1. Try API 1
  let response1;
  try {
    response1 = await fetch(API1_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach API 1' });
  }

  if (response1.status === 429) {
    // 2. If 429, send alert (once per day)
    if (!hasSentAlertToday()) {
      await sendRateLimitAlert('API 1 (OpenRouter) returned 429');
      markAlertSentToday();
    }
    // 3. Fallback to API 2
    try {
      const response2 = await fetch(API2_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY2}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
      const data2 = await response2.json();
      return res.json(data2);
    } catch (err) {
      return res.status(500).json({ error: 'Both APIs failed' });
    }
  } else {
    // 4. If API 1 succeeded, return its response
    const data1 = await response1.json();
    return res.json(data1);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chat proxy server running on port ${PORT}`);
}); 