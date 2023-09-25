require('dotenv').config();
const Discord = require('discord.js');
const { YTSearcher } = require('discord-youtube-api');
const express = require('express');
const ejs = require('ejs');
const ytdl = require('ytdl-core');

const client = new Discord.Client();
const searcher = new YTSearcher(process.env.YOUTUBE_API_KEY);

const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

const app = express();
app.set('view engine', 'ejs');

let queue = [];
let isPlaying = false;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'play') {
    if (!args.length) return message.channel.send('Bạn chưa nhập tên bài hát!');
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
      const video = await searcher.search(args.join(' '), { type: 'video' });
      if (!video) return message.channel.send('Không tìm thấy video!');
      
      const song = {
        title: video.title,
        url: video.url
      };

      queue.push(song);
      if (!isPlaying) playSong(connection, message.channel);
    } else {
      message.channel.send('Bạn cần tham gia một kênh thoại trước!');
    }
  } else if (command === 'volume') {
    const volume = parseInt(args[0]);
    if (isNaN(volume) || volume < 0 || volume > 1000) {
      return message.channel.send('Vui lòng nhập một số từ 0 đến 1000!');
    }

    const dispatcher = message.guild.voice?.connection?.dispatcher;
    if (dispatcher) {
      dispatcher.setVolume(volume / 100);
      message.channel.send(`Âm lượng đã được đặt thành ${volume}!`);
    } else {
      message.channel.send('Bot không đang phát nhạc!');
    }
  } else if (command === 'autoplay') {
    // Xử lý chế độ tự động phát
  } else if (command === 'dashboard') {
    // Xử lý web dashboard
  } else if (command === 'currentsong') {
    const currentSong = queue[0];
    if (currentSong) {
      message.channel.send(`Bài đang phát: ${currentSong.title}`);
    } else {
      message.channel.send('Bot không đang phát nhạc!');
    }
  } else if (command === 'help') {
    // Xử lý hiển thị trợ giúp
```javascript
  } else if (command === 'help') {
    const embed = new Discord.MessageEmbed()
      .setTitle('Bot Discord - Trợ giúp')
      .setDescription('Danh sách các lệnh và chức năng của bot Discord:')
      .addField(`${prefix}play <tên bài hát>`, 'Phát một bài hát từ YouTube')
      .addField(`${prefix}volume <giá trị âm lượng>`, 'Đặt âm lượng phát nhạc (0 - 1000)')
      .addField(`${prefix}autoplay`, 'Bật/tắt chế độ tự động phát')
      .addField(`${prefix}dashboard`, 'Mở web dashboard để quản lý danh sách chờ')
      .addField(`${prefix}currentsong`, 'Hiển thị bài đang phát')
      .addField(`${prefix}help`, 'Hiển thị trợ giúp về các lệnh')
      .setFooter('Bot Discord - Trợ giúp');
    message.channel.send(embed);
  }
});

async function playSong(connection, channel) {
  isPlaying = true;
  const currentSong = queue[0];
  if (!currentSong) {
    isPlaying = false;
    return;
  }

  const stream = ytdl(currentSong.url, { filter: 'audioonly' });
  const dispatcher = connection.play(stream);

  dispatcher.on('finish', () => {
    queue.shift();
    playSong(connection, channel);
  });

  dispatcher.on('error', (error) => {
    console.error(error);
    isPlaying = false;
    queue = [];
    channel.send('Đã xảy ra lỗi khi phát nhạc!');
  });

  await channel.send(`Đang phát: ${currentSong.title}`);
}

app.get('/', (req, res) => {
  res.render('dashboard', { queue });
});

app.listen(3000, () => {
  console.log('Web dashboard đang chạy tại http://localhost:3000');
});

client.login(token);
