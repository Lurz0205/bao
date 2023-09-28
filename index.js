const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 3000;

// Thiết lập thông tin xác thực Spotify
const spotifyApi = new SpotifyWebApi({
  clientId: '40c5ee08678d4e60aef46bedc6761fd4',
  clientSecret: '2e8ef57a93454b31b035569f64fea7c8',
  redirectUri: 'https://bao-lofimusic.onrender.com/callback' // URL chuyển hướng sau khi xác thực
});

// Đăng nhập Spotify
app.get('/login', (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(['user-read-playback-state', 'user-modify-playback-state'], 'state');
  res.redirect(authorizeURL);
});

// Xử lý callback sau khi xác thực thành công
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    // Thiết lập access token cho Spotify API
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.send('Đăng nhập thành công!');

  } catch (error) {
    console.error('Lỗi khi xử lý callback:', error);
    res.status(500).send('Đã xảy ra lỗi');
  }
});

// Tăng hoặc giảm âm lượng
app.get('/volume/:volume', async (req, res) => {
  const volume = req.params.volume;

  try {
    await spotifyApi.setVolume(volume);
    res.send(`Đã đặt âm lượng thành ${volume}`);
  } catch (error) {
    console.error('Lỗi khi đặt âm lượng:', error);
    res.status(500).send('Đã xảy ra lỗi');
  }
});

// Tạm dừng hoặc tiếp tục phát nhạc
app.get('/playback/:state', async (req, res) => {
  const state = req.params.state;

  try {
    if (state === 'pause') {
      await spotifyApi.pause();
      res.send('Nhạc đã tạm dừng');
    } else if (state === 'play') {
      await spotifyApi.play();
      res.send('Nhạc đã tiếp tục phát');
    } else {
      res.status(400).send('Trạng thái không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi khi tạm dừng hoặc tiếp tục phát nhạc:', error);
    res.status(500).send('Đã xảy ra lỗi');
  }
});

// Quay lại hoặc chuyển tiếp bài hát
app.get('/seek/:position', async (req, res) => {
  const position = req.params.position;

  try {
    await spotifyApi.seek(position);
    res.send(`Đã chuyển đến vị trí ${position}`);
  } catch (error) {
    console.error('Lỗi khi quay lại hoặc chuyển tiếp bài hát:', error);
    res.status(500).send('Đã xảy ra lỗi');
  }
});

//Tiếp tục phần mã JavaScript:

// Lưu lịch sử phát bài hát
const history = [];

app.get('/playback-history', (req, res) => {
  res.json(history);
});

app.get('/add-to-history/:trackId', async (req, res) => {
  const trackId = req.params.trackId;

  try {
    const trackInfo = await spotifyApi.getTrack(trackId);
    history.push(trackInfo.body);
    res.send('Bài hát đã được thêm vào lịch sử phát');
  } catch (error) {
    console.error('Lỗi khi thêm bài hát vào lịch sử phát:', error);
    res.status(500).send('Đã xảy ra lỗi');
  }
});

// Giao diện web
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Spotify Music Player</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
          }
          h1 {
            text-align: center;
          }
          button {
            margin: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Spotify Music Player</h1>
        <button onclick="window.location.href='/login'">Đăng nhập Spotify</button>
        <button onclick="setVolume(50)">Tăng âm lượng</button>
        <button onclick="setVolume(10)">Giảm âm lượng</button>
        <button onclick="play()">Phát</button>
        <button onclick="pause()">Tạm dừng</button>
        <button onclick="seek(30000)">Chuyển tiếp 30 giây</button>
        <button onclick="seek(-30000)">Quay lại 30 giây</button>
      </body>
      <script>
        function setVolume(volume) {
          fetch('/volume/' + volume)
            .then(response => response.text())
            .then(message => console.log(message))
            .catch(error => console.error(error));
        }

        function play() {
          fetch('/playback/play')
            .then(response => response.text())
            .then(message => console.log(message))
            .catch(error => console.error(error));
        }

        function pause() {
          fetch('/playback/pause')
            .then(response => response.text())
            .then(message => console.log(message))
            .catch(error => console.error(error));
        }

        function seek(position) {
          fetch('/seek/' + position)
            .then(response => response.text())
            .then(message => console.log(message))
            .catch(error => console.error(error));
        }
      </script>
    </html>
  `);
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
