import bot from '../lib/bot.js';

export async function addCommands(req, res) {
  try {
    const commands = [
      { command: 'start', description: 'Start' },
      { command: 'help', description: 'Get help' },
      { command: 'pay', description: 'Pay by WHISH' },
    ];

    await bot.setMyCommands(commands);

    res.json({ success: true, message: 'Bot commands updated!' });
  } catch (error) {
    console.error('Error updating commands:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
