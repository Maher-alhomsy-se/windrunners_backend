import express from 'express';

import cors from 'cors';
import Redis from 'ioredis';
import { ethers, formatEther } from 'ethers';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot('7992828654:AAGCEaVx1OxZA6Em79ow9P1gP0KE0SB7Mnw', {
  polling: true,
});

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
  res.status(200).json({ message: 'Hello from express! ' });
});

app.post('/verify', async (req, res) => {
  const { tx, userId, address } = req.body;
  try {
    const transaction = await provider.getTransaction(tx.hash);
    const etherValue = formatEther(transaction.value);

    const key = `group:${address}`;
    const data = { etherValue, address, date: Date.now() };

    db.set(key, JSON.stringify(data));

    if (etherValue === '0.001805') {
      bot.approveChatJoinRequest('-1002415386979', userId);

      // Set timeout to remove user after 2 minutes (120,000ms)
      setTimeout(async () => {
        try {
          await bot.banChatMember('-1002415386979', userId);
          console.log(
            `❌ User ${userId} removed from the group after 2 minutes.`
          );
        } catch (err) {
          console.error(`Failed to remove user ${userId}:`, err);
        }
      }, 120000);
    }

    return res
      .status(200)
      .json({ message: 'Success!', data: JSON.stringify(transaction), userId });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error !' });
  }
});

export default app;

app.listen(8080, () => {
  console.log('Running : 8080');
});
