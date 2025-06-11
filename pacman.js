// pacman.js
// Loads levels from levels.js and supports swipe/keyboard input.

const levels = window.pacmanLevels; // <-- uses window object from levels.js
const tileSize = 24;
let currentLevel = 0;

const directions = { left: [-1, 0], up: [0, -1], right: [1, 0], down: [0, 1] };
const keyMap = { 37: "left", 38: "up", 39: "right", 40: "down" };

let canvas, ctx, map, player, ghosts, dotsLeft, swipeStart;

function setupGame(levelIdx) {
  map = levels[levelIdx].map(row => row.split(""));
  canvas.width = map[0].length * tileSize;
  canvas.height = map.length * tileSize + 40;
  player = { x: 9, y: 7, dir: "left", nextDir: "left", lives: 3, score: 0 };
  ghosts = [
    { x: 8, y: 6, dir: "right" },
    { x: 10, y: 6, dir: "left" }
  ];
  dotsLeft = 0;
  for (let row of map) for (let cell of row) if (cell === "." || cell === "o") dotsLeft++;
}

function drawGame() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Draw map
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === "#") {
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else if (map[y][x] === "." || map[y][x] === "o") {
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          map[y][x] === "o" ? 6 : 3,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
  }
  // Draw ghosts
  for (let g of ghosts) {
    ctx.fillStyle = "#F55";
    ctx.beginPath();
    ctx.arc(
      g.x * tileSize + tileSize / 2,
      g.y * tileSize + tileSize / 2,
      tileSize / 2.2,
      Math.PI,
      0
    );
    ctx.lineTo(g.x * tileSize + tileSize * 0.85, g.y * tileSize + tileSize / 1.6);
    ctx.lineTo(g.x * tileSize + tileSize * 0.15, g.y * tileSize + tileSize / 1.6);
    ctx.closePath();
    ctx.fill();
    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(g.x * tileSize + tileSize / 2.7, g.y * tileSize + tileSize / 2.6, 3, 0, 2 * Math.PI);
    ctx.arc(g.x * tileSize + tileSize / 1.6, g.y * tileSize + tileSize / 2.6, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
  // Draw player
  ctx.fillStyle = "#FF0";
  ctx.beginPath();
  ctx.arc(
    player.x * tileSize + tileSize / 2,
    player.y * tileSize + tileSize / 2,
    tileSize / 2.2,
    Math.PI / 6 * (player.dir === "right" ? 1 : player.dir === "left" ? 7 : player.dir === "down" ? 5 : 3),
    Math.PI * 2 - Math.PI / 6 * (player.dir === "right" ? 1 : player.dir === "left" ? 7 : player.dir === "down" ? 5 : 3)
  );
  ctx.lineTo(player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2);
  ctx.fill();
  // HUD
  ctx.fillStyle = "#FFF";
  ctx.font = "16px 'Press Start 2P', sans-serif";
  ctx.fillText("Level: " + (currentLevel + 1), 8, canvas.height - 30);
  ctx.fillText("Score: " + player.score, 8, canvas.height - 14);
}

function movePlayer() {
  if (canMove(player.x + directions[player.nextDir][0], player.y + directions[player.nextDir][1])) {
    player.dir = player.nextDir;
  }
  const [dx, dy] = directions[player.dir];
  const nx = player.x + dx, ny = player.y + dy;
  if (canMove(nx, ny)) {
    player.x = nx;
    player.y = ny;
    eatDot(nx, ny);
  }
}

function eatDot(x, y) {
  if (map[y][x] === "." || map[y][x] === "o") {
    player.score += map[y][x] === "o" ? 50 : 10;
    map[y][x] = " ";
    dotsLeft--;
    if (dotsLeft === 0) setTimeout(nextLevel, 500);
  }
}

function canMove(x, y) {
  return map[y] && map[y][x] && map[y][x] !== "#";
}

function moveGhosts() {
  for (let g of ghosts) {
    let dirs = Object.keys(directions).filter(dir => canMove(g.x + directions[dir][0], g.y + directions[dir][1]));
    dirs = dirs.filter(dir => dir !== oppositeDir(g.dir)) || dirs;
    g.dir = dirs[Math.floor(Math.random() * dirs.length)];
    g.x += directions[g.dir][0];
    g.y += directions[g.dir][1];
    if (g.x === player.x && g.y === player.y) gameOver();
  }
}

function oppositeDir(dir) {
  return { left: "right", right: "left", up: "down", down: "up" }[dir];
}

function nextLevel() {
  currentLevel++;
  if (currentLevel >= levels.length) currentLevel = 0;
  setupGame(currentLevel);
}

function gameOver() {
  alert("Game Over! Your score: " + player.score);
  setupGame(0);
}

document.addEventListener("keydown", e => {
  if (keyMap[e.keyCode]) player.nextDir = keyMap[e.keyCode];
});

function handleSwipe(e) {
  if (!swipeStart) return;
  let dx = e.changedTouches[0].clientX - swipeStart.x;
  let dy = e.changedTouches[0].clientY - swipeStart.y;
  if (Math.abs(dx) > Math.abs(dy)) player.nextDir = dx > 0 ? "right" : "left";
  else player.nextDir = dy > 0 ? "down" : "up";
  swipeStart = null;
}
document.addEventListener("touchstart", e => {
  swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
document.addEventListener("touchend", handleSwipe);

function loop() {
  movePlayer();
  moveGhosts();
  drawGame();
  requestAnimationFrame(loop);
}

window.onload = () => {
  canvas = document.getElementById("pacman-canvas");
  ctx = canvas.getContext("2d");
  setupGame(0);
  loop();
};
