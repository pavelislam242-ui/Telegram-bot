const TelegramBot = require('node-telegram-bot-api');

// Read the token from Render environment variable or hardcode for testing
const token = process.env.BOT_TOKEN || 'PASTE_YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, { polling: true });

// Respond to any message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Hello ${msg.from.first_name || 'there'}! Your bot is live 🚀`);
});

// Keep server alive for Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...');
});
