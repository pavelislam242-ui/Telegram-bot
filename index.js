const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// ENV on Render: add BOT_TOKEN and WEBAPP_URL in Settings → Environment
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL =
  process.env.WEBAPP_URL || 'https://YOUR-RENDER-URL.onrender.com/app';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- Serve WebApp static files at /app ---
app.use('/app', express.static('public'));

// --- Simple in-memory user store (good for demo; resets on restart) ---
const users = {}; // { [userId]: { balance: number, tasksDone: number } }

// --- APIs used by the WebApp ---
app.get('/api/balance', (req, res) => {
  const id = (req.query.user_id || '').toString();
  if (!users[id]) users[id] = { balance: 0, tasksDone: 0 };
  res.json(users[id]);
});

app.get('/api/earn', (req, res) => {
  const id = (req.query.user_id || '').toString();
  if (!users[id]) users[id] = { balance: 0, tasksDone: 0 };
  users[id].balance += 0.2;   // each claim adds 0.20 BDT (demo)
  users[id].tasksDone += 1;
  res.json(users[id]);
});

// --- Telegram bot handlers ---
bot.onText(/\/start/, (msg) => {
  const id = msg.chat.id.toString();
  if (!users[id]) users[id] = { balance: 0, tasksDone: 0 };

  bot.sendMessage(
    msg.chat.id,
    `Welcome ${msg.from.first_name || ''}! Balance: BDT ${users[id].balance.toFixed(2)}`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: 'Open App', web_app: { url: WEBAPP_URL } }]]
      }
    }
  );
});

// --- Set persistent bottom-left "Open App" menu button for the bot ---
(async () => {
  try {
    // Node 18+ has global fetch. If your Node <18, install node-fetch and import it.
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: { type: 'web_app', text: 'Open App', web_app: { url: WEBAPP_URL } }
      })
    });
    const data = await resp.json();
    console.log('setChatMenuButton:', data);
  } catch (e) {
    console.error('Menu button error:', e);
  }
})();

// --- Keepalive ---
app.get('/', (_, res) => res.send('Cash Pilot bot + WebApp running'));
app.listen(process.env.PORT || 3000, () => console.log('Server started'));
