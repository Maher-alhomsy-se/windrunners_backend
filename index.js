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

app.use(cors());
app.use(express.json());

const URL =
  'https://base-mainnet.infura.io/v3/76d6ec90a58e4984adea4d341e6b8de7';

const provider = new ethers.JsonRpcProvider(URL);

const GROUP_ID = '-1002415386979';
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const ADDRESS = '0xa8ed9b14658Bb9ea3e9CC1e32BA08fcbe6888927';

app.post('/verify', async (req, res) => {
  const { tx, userId, address } = req.body;
  try {
    const transaction = await provider.getTransaction(tx.hash);
    const etherValue = formatEther(transaction.value);

    const key = `group:${address}:app`;
    const data = { etherValue, address, date: Date.now() + ONE_MONTH_MS };

    db.set(key, JSON.stringify(data));

    if (
      etherValue === '0.001805' &&
      transaction.to.toLocaleLowerCase() === ADDRESS.toLocaleLowerCase()
    ) {
      bot.approveChatJoinRequest(GROUP_ID, userId);
    }

    return res
      .status(200)
      .json({ message: 'Success!', data: JSON.stringify(transaction), userId });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error !' });
  }
});

setInterval(async () => {
  const users = await db.keys('group:*');

  for (const key of users) {
    const address = key.split(':')[1];
    const data = await db.get(`group:${address}`);

    const parsedData = JSON.parse(data);
    const expireTime = parsedData.date;

    if (expireTime && Date.now() >= expireTime) {
      try {
        await bot.unbanChatMember(GROUP_ID, userId, { only_if_banned: false });
        await db.del(`group:${address}`);
        console.log(`❌ User ${userId} removed from the group after 1 month.`);
      } catch (err) {
        console.error(`Failed to remove user ${userId}:`, err);
      }
    }
  }
}, 5000);

export default app;

app.listen(8080, () => {
  console.log('Running : 8080');
});
