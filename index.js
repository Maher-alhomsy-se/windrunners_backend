import express from 'express';

import cors from 'cors';
import Redis from 'ioredis';
import { ethers, formatEther } from 'ethers';
import TelegramBot from 'node-telegram-bot-api';

const CHANNEL_ID = '-1002282561796';
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const WEBHOOK_URL = 'https://group-app-backend.vercel.app';

const URL =
  'https://base-mainnet.infura.io/v3/76d6ec90a58e4984adea4d341e6b8de7';
// const BOT_TOKEN = '7992828654:AAGCEaVx1OxZA6Em79ow9P1gP0KE0SB7Mnw';
const BOT_TOKEN = '7856924356:AAEpDIvpy1ScASAb0xeIfr-9WwNALA7sJ8s';
const DB_URL =
  'rediss://default:AcNDAAIjcDE5ZDM1OGE1YjEyYjc0YWZiODllYmRmNGI5OTM3ZWZhMnAxMA@honest-snail-49987.upstash.io:6379';

const app = express();

app.use(cors());
app.use(express.json());

const db = new Redis(DB_URL);
const provider = new ethers.JsonRpcProvider(URL);
const bot = new TelegramBot(BOT_TOKEN, { webHook: true });

bot.setWebHook(`${WEBHOOK_URL}/bot${BOT_TOKEN}`);

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
    const data = {
      userId,
      address,
      etherValue,
      date: Date.now() + ONE_MONTH_MS,
    };

    if (etherValue === '0.005415') {
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

app.post(`/bot${BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('text', async ({ text, chat }) => {
  console.log(text);

  if (text === '/help') {
    bot.sendMessage(
      chat.id,
      'If you’re facing any payment issues, simply send 0.01 ETH to this address: \n`0xa8ed9b14658Bb9ea3e9CC1e32BA08fcbe6888927`\n\nThen, share the transaction ID with @zksnarks. You’ll be automatically added to the airdrop Telegram group.',
      { parse_mode: 'Markdown' }
    );
  }

  if (text === '/start') {
    bot.sendMessage(
      chat.id,
      'Welcome! Click the button below to open the Mini App.',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open Mini App 🚀',
                web_app: { url: 'https://group-app-gilt.vercel.app' }, // Replace with your Mini App URL
              },
            ],
          ],
        },
      }
    );
  }
});

app.post('/set-commands', async (req, res) => {
  try {
    const commands = [
      { command: 'start', description: 'Start' },
      { command: 'help', description: 'Get help' },
    ];

    await bot.setMyCommands(commands);

    res.json({ success: true, message: 'Bot commands updated!' });
  } catch (error) {
    console.error('Error updating commands:', error);
    res.status(500).json({ success: false, error: error.message });
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
        await bot.unbanChatMember(CHANNEL_ID, parsedData.userId, {
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
