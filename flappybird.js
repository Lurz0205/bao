const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const width = 40;
const height = 20;
let birdX = 10;
let birdY = Math.floor(height / 2);
let score = 0;
let gameover = false;

// Hàm vẽ màn hình
function drawScreen() {
  process.stdout.write('\x1Bc');
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === birdY && x === birdX) {
        process.stdout.write('O');
      } else if (x === width - 1) {
        process.stdout.write('|');
      } else if (y === height - 1) {
        process.stdout.write('_');
      } else {
        process.stdout.write(' ');
      }
    }
    process.stdout.write('\n');
  }
  process.stdout.write(`Score: ${score}\n`);
}

// Hàm xử lý input từ bàn phím
function handleInput(key) {
  if (key === 'w' && birdY > 0) {
    birdY--;
  }
}

// Hàm cập nhật trạng thái game
function updateGame() {
  if (birdY < height - 1) {
    birdY++;
    score++;
  } else {
    gameover = true;
  }
}

// Hàm chạy game
function runGameLoop() {
  drawScreen();
  if (gameover) {
    process.stdout.write('Game Over\n');
    process.exit();
  }
}

// Bắt sự kiện nhấn phím
process.stdin.on('keypress', (_, key) => {
  handleInput(key.name);
});

// Hàm chạy game
function startGame() {
  setInterval(() => {
    updateGame();
    runGameLoop();
  }, 100);
}

// Bắt đầu game
startGame();