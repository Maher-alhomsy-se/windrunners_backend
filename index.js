import express from 'express';

import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from express! ' });
});

export default app;

app.listen(8080, () => {
  console.log('Running : 8080');
});
