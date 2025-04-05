import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = '7856924356:AAEpDIvpy1ScASAb0xeIfr-9WwNALA7sJ8s';

const bot = new TelegramBot(BOT_TOKEN, { webHook: true });

export default bot;
