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
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  const path = req.path.replace('/api', '');
  const query = new URLSearchParams(req.query).toString();
  const url = `https://api.theracingapi.com/v1${path}${query ? '?' + query : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      }
    });
    const text = await response.text();
    res.status(response.status).set('Content-Type', 'application/json').send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Running on ${PORT}`));
