const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

const port = 3000;

app.post('/hash', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Vui lòng nhập password' });

  const hashed = await bcrypt.hash(password, 10);
  res.json({ hashed });
});

app.post('/compare', async (req, res) => {
  const { password, hashed } = req.body;
  if (!password || !hashed) return res.status(400).json({ error: 'Thiếu password hoặc hashed' });

  const match = await bcrypt.compare(password, hashed);
  res.json({ match });
});

app.listen(port, () => {
  console.log(`🔥 Server running at http://localhost:${port}`);
});
