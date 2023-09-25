const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('file:///index.html'); // Thay thế đường dẫn tới tệp HTML của bạn

  await page.evaluate(() => {
    const bird = document.getElementById('bird');
    const gameContainer = document.getElementById('game-container');
    const scoreElement = document.getElementById('score');

    let birdTop = 220;
    let score = 0;
    let isGameOver = false;

    function jump() {
      if (birdTop > 20) {
        birdTop -= 40;
      }
    }

    function startGame() {
      if (isGameOver) return;

      bird.style.top = birdTop + 'px';
      birdTop += 2;

      if (birdTop > gameContainer.clientHeight - 40) {
        gameOver();
      }

      scoreElement.innerText = 'Score: ' + score;

      requestAnimationFrame(startGame);
    }

    function gameOver() {
      isGameOver = true;
      scoreElement.innerText = 'Game Over';
    }

    document.addEventListener('keydown', jump);
    startGame();
  });

  // Đợi một thời gian để trò chơi chạy
  await page.waitForTimeout(5000);

  await browser.close();
})();
