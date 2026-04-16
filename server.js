
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

app.get('/betfair/login', async (req, res) => {
  const username = req.query.user;
  const password = req.query.pass;
  const apiKey = req.query.key;
  if (!username || !password || !apiKey) return res.status(400).json({ error: 'Missing credentials' });
  console.log('Betfair login for: ' + username);
  try {
   const response = await fetch('https://identitysso.betfair.com/api/login?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&login=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Application': apiKey,
        'Accept': 'application/json',
        'Referer': 'https://www.betfair.com'
      },
      body: ''
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

app.post('/betfair/api', async (req, res) => {
  const sessionToken = req.headers['x-betfair-session'];
  const apiKey = req.headers['x-betfair-key'];
  if (!sessionToken || !apiKey) return res.status(400).json({ error: 'Missing Betfair headers' });
  console.log('Betfair API call');
  try {
    const response = await fetch('https://api.betfair.com/exchange/betting/json-rpc/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Application': apiKey,
        'X-Authentication': sessionToken,
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    console.log('Betfair API status: ' + response.status);
    res.status(response.status).set('Content-Type', 'application/json').send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log('Running on ' + PORT));
