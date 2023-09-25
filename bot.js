const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const bot = new Discord.Client();
const app = express();
const port = process.env.PORT || 3000;

const queue = new Map();

function play(connection, message) {
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue) {
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(serverQueue.songs[0].url))
    .on('finish', () => {
      serverQueue.songs.shift();
      play(connection, message);
    })
    .on('error', (error) => console.error(error));

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Đang phát: **${serverQueue.songs[0].title}**`);
}

bot.on('ready', () => {
  console.log('Bot đã sẵn sàng!');
});

bot.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.PREFIX)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${process.env.PREFIX}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${process.env.PREFIX}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${process.env.PREFIX}stop`)) {
    stop(message, serverQueue);
    return;
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(' ');

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send('Bạn phải vào một kênh thoại trước!');
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send(
      'Bot không có quyền kết nối hoặc phát âm thanh trong kênh thoại này!'
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      const connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(connection, message);
    } catch (error) {
      console.error(error);
      queue.delete(message.guild.id);
      return message.channel.send(error.message);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(
      `**${song.title}** đã được thêm vào danh sách phát!`
    );
  }
}

function skip(message, serverQueue) {
  if (!```javascript
function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Bạn phải vào một kênh thoại để bỏ qua nhạc!"
    );
  if (!serverQueue)
    return message.channel.send("Không có bài hát nào để bỏ qua!");

  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Bạn phải vào một kênh thoại để dừng nhạc!"
    );
    
  if (!serverQueue)
    return message.channel.send("Không có bài hát nào để dừng!");

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

app.get("/", (req, res) => {
  res.send("Dashboard");
});

app.listen(port, () => {
  console.log("Dashboard đang chạy tại");
});

bot.login(process.env.DISCORD_TOKEN);
