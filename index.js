import express from 'express';

import cors from 'cors';
import Redis from 'ioredis';

const db = new Redis(
  'rediss://default:AcNDAAIjcDE5ZDM1OGE1YjEyYjc0YWZiODllYmRmNGI5OTM3ZWZhMnAxMA@honest-snail-49987.upstash.io:6379'
);

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from express! ' });
});

app.get('/add-user', async (req, res) => {
  try {
    const result = await db.get('group_app', JSON.stringify({ name: 'Maher' }));

    res.status(200).json({ message: 'OK', result });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});

export default app;

app.listen(8080, () => {
  console.log('Running : 8080');
});
