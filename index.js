const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const search = require('youtube-api-search');
const ytdl = require('ytdl-core');

// Lưu trữ lịch sử phát bài hát
let history = [];

// Phát nhạc từ YouTube
function playMusic(videoId, socket) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const stream = ytdl(url, { filter: 'audioonly' });

  // Phát nhạc đến tất cả các kết nối socket
  io.emit('play', url);

  // Lưu lịch sử phát bài hát
  history.push(url);

  // Khi stream kết thúc, chuyển đến bài hát tiếp theo trong lịch sử
  stream.on('end', () => {
    const next = history.shift();
    playMusic(next, socket);
  });

  // Khi có lỗi, bỏ qua bài hát hiện tại và chuyển đến bài hát tiếp theo
  stream.on('error', () => {
    const next = history.shift();
    playMusic(next, socket);
  });
}

// Thiết lập socket.io
io.on('connection', socket => {
  // Gửi lịch sử phát nhạc cho người dùng mới kết nối
  socket.emit('history', history);

  // Người dùng yêu cầu phát nhạc từ videoId
  socket.on('play', videoId => {
    playMusic(videoId, socket);
  });

  // Người dùng yêu cầu dừng phát nhạc
  socket.on('pause', () => {
    io.emit('pause');
  });

  // Người dùng yêu cầu tiếp tục phát nhạc
  socket.on('resume', () => {
    io.emit('resume');
  });
});

// Tìm kiếm video trên YouTube
app.get('/search', (req, res) => {
  const query = req.query.q;

  search({ key: 'YOUR_YOUTUBE_API_KEY', term: query }, (videos) => {
    res.json(videos);
  });
});

// Serve các file tĩnh trong thư mục public
app.use(express.static('public'));

// Khởi động máy chủ
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
