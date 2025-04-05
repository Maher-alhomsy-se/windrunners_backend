import express from 'express';

import cors from 'cors';

import db from './lib/db.js';
import bot from './lib/bot.js';
import { verify } from './controllers/verify.controller.js';
import { addCommands } from './controllers/add-commands.controller.js';

const CHANNEL_ID = '-1002282561796';
const WEBHOOK_URL = 'https://group-app-backend.vercel.app';
const BOT_TOKEN = '7856924356:AAEpDIvpy1ScASAb0xeIfr-9WwNALA7sJ8s';

const app = express();

app.use(cors());
app.use(express.json());

bot.setWebHook(`${WEBHOOK_URL}/bot${BOT_TOKEN}`);

app.post('/verify', verify);
app.post('/set-commands', addCommands);

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

app.get('/cleanup', (req, res) => {
  console.log('Clean up');

  res.status(200).json({ message: 'CleanUp' });
});

export default app;
