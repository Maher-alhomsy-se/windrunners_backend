import express from 'express';

import cors from 'cors';
import Redis from 'ioredis';
import { ethers, formatEther } from 'ethers';
import TelegramBot from 'node-telegram-bot-api';

const CHANNEL_ID = '-1002282561796';
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const URL =
  'https://base-mainnet.infura.io/v3/76d6ec90a58e4984adea4d341e6b8de7';
const BOT_TOKEN = '7992828654:AAGCEaVx1OxZA6Em79ow9P1gP0KE0SB7Mnw';
const DB_URL =
  'rediss://default:AcNDAAIjcDE5ZDM1OGE1YjEyYjc0YWZiODllYmRmNGI5OTM3ZWZhMnAxMA@honest-snail-49987.upstash.io:6379';

const app = express();

app.use(cors());
app.use(express.json());

const db = new Redis(DB_URL);
const provider = new ethers.JsonRpcProvider(URL);
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

app.post('/verify', async (req, res) => {
  const { tx, userId, address } = req.body;

  if (!tx || !userId || !address) {
    return res
      .status(500)
      .json({ message: JSON.stringify({ tx, user, address }) });
  }

  try {
    const transaction = await provider.getTransaction(tx.hash);
    const etherValue = formatEther(transaction.value);

    const key = `group:${address}:app`;
    const data = { etherValue, address, date: Date.now() + ONE_MONTH_MS };

    if (etherValue === '0.001805') {
      db.set(key, JSON.stringify(data));

      const inviteLink = await bot.createChatInviteLink(CHANNEL_ID, {
        expire_date: Math.floor(Date.now() / 1000) + 300,
        member_limit: 1,
      });

      const { chat } = await bot.sendMessage(
        userId,
        `✅ Approved! Join here: [Click to Join](${inviteLink.invite_link})`,
        { parse_mode: 'Markdown' }
      );

      console.log(`send link to : ${chat.first_name || chat.id}`);
    }

    return res
      .status(200)
      .json({ message: 'Success!', data: JSON.stringify(transaction), userId });
  } catch (error) {
    return res.status(500).json({ message: error?.message || error });
  }
});

setInterval(async () => {
  const users = await db.keys('group:*:app');

  for (const key of users) {
    const address = key.split(':')[1];
    const data = await db.get(`group:${address}:app`);

    const parsedData = JSON.parse(data);
    const expireTime = parsedData.date;

    if (expireTime && Date.now() >= expireTime) {
      try {
        await bot.unbanChatMember(CHANNEL_ID, userId, {
          only_if_banned: false,
        });
        await db.del(`group:${address}:app`);
        console.log(`❌ User ${address} removed from the group after 1 month.`);
      } catch (err) {
        console.error(`Failed to remove user ${address}:`, err);
      }
    }
  }
}, 60 * 60 * 1000);

export default app;

app.listen(8080, () => {
  console.log('Running : 8080');
});
