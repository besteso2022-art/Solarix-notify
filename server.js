const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const SUPABASE_URL = 'https://smfvityytelrxskotawh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZnZpdHl5dGVscnhza290YXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODAzOTQsImV4cCI6MjEwNTA1NjM5NH0.5Z_td9bmFCKk67ZCQPRCtSRxEQHtny7Q0XQ5RDLFfjc';

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const APP_URL = 'https://solarix.besteso2022.workers.dev';

console.log('Server starting... BOT_TOKEN set:', !!BOT_TOKEN);

async function sendTelegram(chatId, text, replyMarkup) {
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  console.log('Telegram response:', JSON.stringify(json));
  return json;
}

/* ====================== NOTIFY ENDPOINT ====================== */
app.post('/notify', async (req, res) => {
  const { chatId, type, data } = req.body;

  if (!chatId || !type) {
    return res.status(400).json({ error: 'Missing chatId or type' });
  }

  let text = '';
  let buttons = null;

  if (type === 'welcome') {
    text =
      `👋 <b>Welcome to Solarix AI, ${data.name}!</b>\n\n` +
      `🆔 <b>User ID:</b> <code>${chatId}</code>\n` +
      `👤 <b>Username:</b> @${data.username || 'solarix_user'}\n\n` +
      `💎 <i>Mine Solarix daily, invite friends, complete tasks, and swap SLX to USDT directly!</i>\n\n` +
      `👇 <b>Get started:</b>`;
    buttons = {
      inline_keyboard: [
        [{ text: '🚀 Open Mining App', web_app: { url: APP_URL } }]
      ]
    };
  } else if (type === 'package_deployed') {
    text =
      `🎉 <b>Mining Rig Activated Successfully!</b>\n\n` +
      `Congratulations Miner! Your new mining hardware is now live and working 24/7:\n\n` +
      `⚡ <b>Rig:</b> Solarix ${data.packageName} Node\n` +
      `💰 <b>Cost:</b> ${data.cost} USDT\n` +
      `📈 <b>Daily Profit:</b> +${data.dailyRate} SLX / day\n` +
      `⏳ <b>Duration:</b> 30 Days\n` +
      `🚀 <b>Hasrate:</b> ${data.speed} GH/S\n\n` +
      `⛏ <i>Your mining speed has been boosted!</i>\n` +
      `Open the Mini App to watch your real-time earnings grow!`;
    buttons = {
      inline_keyboard: [
        [{ text: '⛏ Open Mining App', web_app: { url: APP_URL } }]
      ]
    };
  } else if (type === 'deposit_received') {
    text =
      `✅ <b>Deposit Confirmed!</b>\n\n` +
      `💰 <b>Amount:</b> ${data.amount} USDT\n` +
      `🔗 <b>Tx Hash:</b> <code>${(data.txId || '').substring(0, 16)}...</code>\n` +
      `📊 <b>New Balance:</b> ${data.newBalance} USDT\n\n` +
      `<i>Your funds have been credited to your holding balance.</i>`;
    buttons = {
      inline_keyboard: [
        [{ text: '💼 View Wallet', web_app: { url: APP_URL } }]
      ]
    };
  } else if (type === 'withdrawal_requested') {
    text =
      `📤 <b>Withdrawal Request Received</b>\n\n` +
      `💰 <b>Amount:</b> ${data.amount} USDT\n` +
      `📍 <b>To Wallet:</b> <code>${data.wallet}</code>\n` +
      `⏳ <b>Status:</b> Pending admin approval\n\n` +
      `<i>You will be notified once processed.</i>`;
  } else if (type === 'withdrawal_sent') {
    text =
      `✅ <b>Withdrawal Sent!</b>\n\n` +
      `💰 <b>Amount:</b> ${data.amount} USDT\n` +
      `📍 <b>To:</b> <code>${data.wallet}</code>\n\n` +
      `<i>Please check your wallet. Transaction usually arrives within a few minutes.</i>`;
  } else if (type === 'withdrawal_rejected') {
    text =
      `❌ <b>Withdrawal Rejected</b>\n\n` +
      `💰 <b>Amount:</b> ${data.amount} USDT\n` +
      `💵 <b>Refunded to balance.</b>\n\n` +
      `<i>If you have questions, contact support.</i>`;
  } else if (type === 'task_completed') {
    text =
      `🎯 <b>Task Completed!</b>\n\n` +
      `📝 <b>Task:</b> ${data.taskDesc}\n` +
      `🎁 <b>Reward:</b> +${data.reward}\n\n` +
      `<i>Keep completing tasks to boost your earnings!</i>`;
} else if (type === 'referral_earned') {
  text =
    `🎁 <b>New Referral Bonus!</b>\n\n` +
    `👤 Someone joined using your invite link.\n` +
    `💰 <b>Reward:</b> +${data.amount} SLX (Locked)\n` +
    `📊 <b>Total referrals:</b> ${data.count}\n\n` +
    `<i>Locked SLX can only be used to purchase miners. Keep sharing to earn more!</i>`;
    buttons = {
      inline_keyboard: [
        [{ text: '👥 Invite More', url: 'https://t.me/share/url?url=https://t.me/Solarix_ai_bot?start=ref_' + chatId + '&text=Join%20Solarix%20AI!' }]
      ]
    };
  } else {
    return res.status(400).json({ error: 'Unknown type' });
  }

  try {
    const result = await sendTelegram(chatId, text, buttons);
    if (result && result.ok) {
      res.json({ ok: true, telegram: result });
    } else {
      console.error('Telegram rejected:', result);
      res.status(400).json({ ok: false, telegram: result });
    }
  } catch (err) {
    console.error('Telegram send error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ====================== TELEGRAM WEBHOOK (/start handler) ====================== */
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('Webhook received:', JSON.stringify(update));

    if (update.message && update.message.text) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text;
      const firstName = msg.from.first_name || 'Miner';
      const username = msg.from.username || 'solarix_user';

      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const payload = parts[1] || '';
        let referralNote = '';

        if (payload.startsWith('ref_')) {
          const referrerId = payload.replace('ref_', '');

          if (referrerId && referrerId !== String(chatId)) {
            try {
              const { error: refErr } = await supabase
                .from('referrals')
                .insert({
                  referrer_id: referrerId,
                  new_user_id: String(chatId),
                  rewarded: false
                });

              if (refErr && !refErr.message.includes('duplicate')) {
                console.error('Referral insert error:', refErr);
              } else {
                referralNote = `\n🎁 <i>You were invited by a friend!</i>\n`;
              }
            } catch (e) {
              console.error('Referral save exception:', e);
            }
          }
        }

        const welcomeText =
          `👋 <b>Welcome to Solarix AI, ${firstName}!</b>\n\n` +
          `🆔 <b>User ID:</b> <code>${chatId}</code>\n` +
          `👤 <b>Username:</b> @${username}\n` +
          referralNote + `\n` +
          `💎 <i>Mine Solarix daily, invite friends, complete tasks, and swap SLX to USDT directly!</i>\n\n` +
          `👇 <b>Get started:</b>`;

        const buttons = {
          inline_keyboard: [
            [{ text: '🚀 Open Mining App', web_app: { url: APP_URL } }],
            [{ text: '📢 Official Channel', url: 'https://t.me/solarix_ai' }],
            [{ text: '👥 Invite Friends', url: 'https://t.me/share/url?url=https://t.me/Solarix_ai_bot?start=ref_' + chatId + '&text=Join%20Solarix%20AI!' }]
          ]
        };

        await sendTelegram(chatId, welcomeText, buttons);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Solarix notify server running.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
