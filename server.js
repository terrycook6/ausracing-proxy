

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
  const token = req.headers['x-racing-token'];
  const path = req.path.replace('/api', '');
  const query = new URLSearchParams(req.query).toString();
  const url = `https://api.theracingapi.com/v1${path}${query ? '?' + query : ''}`;
  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': token,
        'Authorization': `Bearer ${token}`,
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
