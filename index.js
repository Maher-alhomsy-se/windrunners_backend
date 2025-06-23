import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';

import bot from './lib/bot.js';
import { verify } from './controllers/verify.controller.js';
import { cleanup } from './controllers/cleanup.controller.js';
import { addCommands } from './controllers/add-commands.controller.js';

const WEBHOOK_URL = 'https://windrunnersbackend.onrender.com';
const BOT_TOKEN = '7856924356:AAEpDIvpy1ScASAb0xeIfr-9WwNALA7sJ8s';

const PORT = process.env.PORT || 3000;

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

bot.setWebHook(`${WEBHOOK_URL}/bot${BOT_TOKEN}`);
// bot.startPolling();

app.post('/verify', verify);
app.get('/cleanup', cleanup);
app.post('/set-commands', addCommands);

app.post(`/bot${BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello server' });
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

  if (text === '/pay') {
    const message =
      `💳 **Payment Instructions (WHISH)**\n\n` +
      `To get access to the private channel, please send ** $15 ** via the WHISH app to the following number: \n\n` +
      `📱 \`70224984\` \n\n` +
      `After sending the payment, please message @zksnarks on Telegram with a screenshot so I can verify and give you access.Thank you! 🙏`;

    bot.sendMessage(chat.id, message, { parse_mode: 'Markdown' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
