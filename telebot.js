const Telegraf = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const util = require('util');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const { token, ownerUsername } = JSON.parse(fs.readFileSync('./settings.json'));

// Array untuk menyimpan riwayat chat
const chatHistory = [];

// express endpoint
app.set('json spaces', 2);
app.get('/', (req, res) => {
  const data = {
    status: 'true',
    message: `Telegram Bot Successfully Activated! Bot Token: ${token}`,
    author: 'AmmarBN',
  };
  const result = {
    response: data,
  };
  res.json(result);
});

function listenOnPort(port) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  app.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying another port...`);
      listenOnPort(port + 1);
    } else {
      console.error(err);
    }
  });
}

listenOnPort(port);

// Bot config token
const bot = new Telegraf(token, { polling: true });
let Start = new Date();

let senderInfo;
let dateInfo;

const logs = (message, color, senderInfo, dateInfo) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(chalk[color](`[${timestamp}] ${senderInfo} ${dateInfo} => ${message}`));
};

const Figlet = () => {
  figlet('ChatBot Ai', { font: 'Block', horizontalLayout: 'default' }, function (err, data) {
    if (err) {
      console.log('Error:', err);
      return;
    }
    console.log(chalk.yellow.bold(data));
    console.log(chalk.yellow(`Lann`));
  });
};

bot.on('polling_error', (error) => {
  logs(`Polling error: ${error.message}`, 'blue');
});

bot.onText(/^\/creator$/, (msg) => {
  const From = msg.chat.id;
  const creatorMessage = 'This is my creator: [SariiRooti](https://t.me/SariiRooti)';
  
  senderInfo = `From: ${msg.from.first_name} (@${msg.from.username || 'N/A'})`;
  dateInfo = `Date: ${new Date(msg.date * 1000).toLocaleString()}`;

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Chat Creator VoidGPT', url: 'https://t.me/SariiRooti' }],
      ],
    },
  };
  bot.sendMessage(From, creatorMessage, { reply_to_message_id: msg.message_id, ...replyMarkup });

  // Tampilkan informasi di console
  logs('Creator response sent', 'green', senderInfo, dateInfo);
});


bot.onText(/^\/runtime$/, (msg) => {
  const now = new Date();
  const uptimeMilliseconds = now - Start;
  const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  const From = msg.chat.id;
  const uptimeMessage = `Active ⏱️${uptimeHours} hour ${uptimeMinutes % 60} minute ${uptimeSeconds % 60} second.`;

  senderInfo = `From: ${msg.from.first_name} (@${msg.from.username || 'N/A'})`;
  dateInfo = `Date: ${new Date(msg.date * 1000).toLocaleString()}`;

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Visit Hoshiyuki API', url: 'https://hoshiyuki-api.my.id' }],
      ],
    },
  };
  bot.sendMessage(From, uptimeMessage, { reply_to_message_id: msg.message_id, ...replyMarkup });

  // Tampilkan informasi di console
  logs('Runtime response sent', 'green', senderInfo, dateInfo);
});

bot.onText(/^\/start$/, (msg) => {
  const From = msg.chat.id;
  const user = msg.from;
  const caption = `Hi ${user.first_name}! Welcome to VoidGPT Ai. I am VoidGPT unfiltered ChatBot Created By AmmarBN`;

  senderInfo = `From: ${msg.from.first_name} (@${msg.from.username || 'N/A'})`;
  dateInfo = `Date: ${new Date(msg.date * 1000).toLocaleString()}`;

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Visit Hoshiyuki API', url: 'https://hoshiyuki-api.my.id' }],
      ],
    },
  };
  bot.sendMessage(From, caption, { reply_to_message_id: msg.message_id, ...replyMarkup });

  // Tampilkan informasi di console
  logs('Start response sent', 'green', senderInfo, dateInfo);
});

bot.on('message', async (msg) => {
  const From = msg.chat.id;
  if (msg.text && (msg.text.toLowerCase() === '/start' || msg.text.toLowerCase() === '/runtime' || msg.text.toLowerCase() === '/creator')) {
    return;
  }

  const q = msg.text;
  const replyToMessageId = msg.message_id; 

  // Menyimpan pesan dalam riwayat chat
  const chatEntry = {
    senderInfo: `From: ${msg.from.first_name} (@${msg.from.username || 'N/A'})`,
    dateInfo: `Date: ${new Date(msg.date * 1000).toLocaleString()}`,
    message: q,
    messageType: 'incoming', // atau 'outgoing' jika pesan dikirim oleh bot
  };
  chatHistory.push(chatEntry);

  try {
    const response = await fetch(`https://hoshiyuki-api.my.id/api/voidgpt?text=${encodeURIComponent(q)}&apikey=YOUR_APIKEY`);
    const data = await response.json();
    
    if (data.code === 200) {
      const result = data.result;

      const replyMarkup = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Hoshiyuki API', url: 'https://hoshiyuki-api.my.id' }],
          ],
        },
      };

      // Menyusun pesan balasan berdasarkan riwayat chat sebelumnya
      let contextResponse = `Hello! I don't have any context for this message.`;
      const lastChatEntry = chatHistory[chatHistory.length - 2];
      if (lastChatEntry && lastChatEntry.messageType === 'incoming') {
        contextResponse = `You previously said: ${lastChatEntry.message}`;
      }

      const responseMessage = `${contextResponse}\n${result}`;
      bot.sendMessage(From, responseMessage, { reply_to_message_id: replyToMessageId, ...replyMarkup });
      logs('Response sent', 'green', senderInfo, dateInfo);
      
      // Menyimpan pesan balasan dalam riwayat chat
      const replyEntry = {
        senderInfo: 'Bot', // Anda bisa menyesuaikan ini sesuai kebutuhan
        dateInfo: `Date: ${new Date().toLocaleString()}`,
        message: result,
        messageType: 'outgoing',
      };
      chatHistory.push(replyEntry);
    } else {
      throw new Error(`API returned non-200 status code: ${data.code}`);
    }
  } catch (error) {
    // Handle error
    const errorMessage = `${senderInfo}\n${dateInfo}\n\nSorry, there was an error on our internal server when contacting AI.`;
    const userUrl = `https://t.me/${msg.from.username}`;
    const ownerButtonMarkup = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'User Profile', url: userUrl }],
        ],
      },
    };

    bot.sendMessage(`@${ownerUsername}`, `Error: ${error.message}\n\n${errorMessage}`, ownerButtonMarkup);

    bot.sendMessage(From, errorMessage, { reply_to_message_id: replyToMessageId });

    logs(`[ ERROR ] ${From}: ${error.message}`, 'red', senderInfo, dateInfo);
  }
});