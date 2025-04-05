import db from '../lib/db.js';
import bot from '../lib/bot.js';

const CHANNEL_ID = '-1002282561796';

export async function cleanup(req, res) {
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

  res.status(200).json({ message: 'Success' });
}
