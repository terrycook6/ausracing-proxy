const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Racing API proxy
app.get('/api/*', async (req, res) => {
  const username = req.headers['x-racing-username'];
  const password = req.headers['x-racing-password'];
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  const credentials = Buffer.from(username + ':' + password).toString('base64');
  const path = req.path.replace('/api', '');
  const query = new URLSearchParams(req.query).toString();
  const url = 'https://api.theracingapi.com/v1' + path + (query ? '?' + query : '');
  console.log('Racing API: ' + url);
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + credentials,
        'Accept': 'application/json'
      }
    });
    const text = await response.text();
    console.log('Status: ' + response.status + ' Length: ' + text.length);
    res.status(response.status).set('Content-Type', 'application/json').send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Betfair login proxy
app.post('/betfair/login', async (req, res) => {
  const { username, password, apiKey } = req.body;
  if (!username || !password || !apiKey) return res.status(400).json({ error: 'Missing credentials' });
  console.log('Betfair login for: ' + username);
  try {
    const response = await fetch('https://identitysso.betfair.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Application': apiKey,
        'Accept': 'application/json'
      },
      body: 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
    });
    console.log('Betfair login status: ' + response.status);
    const text = await response.text();
    console.log('Betfair login body: ' + text.slice(0, 300));
    res.status(response.status).set('Content-Type', 'application/json').send(text);
  } catch (err) {
    console.error('Betfair login error: ' + err.message);
    res.status(500).json({ error: err.message });
  }
});
