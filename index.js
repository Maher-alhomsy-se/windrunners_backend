import express from 'express';

import cors from 'cors';
import Redis from 'ioredis';
import { ethers } from 'ethers';

const db = new Redis(
  'rediss://default:AcNDAAIjcDE5ZDM1OGE1YjEyYjc0YWZiODllYmRmNGI5OTM3ZWZhMnAxMA@honest-snail-49987.upstash.io:6379'
);

const app = express();
app.use(express.json());
app.use(cors());

const URL =
  'https://base-mainnet.infura.io/v3/76d6ec90a58e4984adea4d341e6b8de7';

const provider = new ethers.JsonRpcProvider(URL);

app.get('/', async (req, res) => {
  const blockNumber = await provider.getBlockNumber();

  console.log('Block number: ' + blockNumber);

  res.status(200).json({ message: 'Hello from express! ' });
});

app.post('/verify', async (req, res) => {
  const { tx } = req.body;
  try {
    const transaction = await provider.getTransaction(tx.hash);

    return res
      .status(200)
      .json({ message: 'Success!', data: JSON.stringify(transaction) });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error !' });
  }
});

export default app;

app.listen(8080, () => {
  console.log('Running : 8080');
});
