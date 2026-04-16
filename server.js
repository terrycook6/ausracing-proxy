const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/*', async (req, res) => {
  const username = req.headers['x-racing-username'];
  const password = req.headers['x-racing-password'];
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const credentials = Buffer.from(username + ':' + password).toString('base64');
  const path = req.path.replace('/api', '');
  const query = new URLSearchParams(req.query).toString();
  const url = 'https://api.theracingapi.com/v1' + path + (query ? '?' + query : '');

  console.log('Fetching: ' + url);
  console.log('Username length: ' + username.length);
  console.log('Credentials b64 length: ' + credentials.length);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + credentials,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('API status: ' + response.status);
    const text = await response.text();
    console.log('Response preview: ' + text.slice(0, 2000));
    res.status(response.status).set('Content-Type', 'application/json').send(text);
  } catch (err) {
    console.error('Error: ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log('Running on ' + PORT));
