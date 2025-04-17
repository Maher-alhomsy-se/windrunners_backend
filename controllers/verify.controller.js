import { ethers, formatEther } from 'ethers';

import db from '../lib/db.js';
import bot from '../lib/bot.js';

const CHANNEL_ID = '-1002415386979'; // '-1002282561796'
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const URL =
  'https://base-mainnet.infura.io/v3/76d6ec90a58e4984adea4d341e6b8de7';

const provider = new ethers.JsonRpcProvider(URL);

export async function verify(req, res) {
  const { tx, userId, address } = req.body;

  if (!tx || !userId || !address) {
    return res
      .status(500)
      .json({ message: JSON.stringify({ tx, userId, address }) });
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

    if (transaction.value === 10000000000000000n) {
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
    console.log(error);

    return res.status(500).json({ message: error?.message || error });
  }
}
