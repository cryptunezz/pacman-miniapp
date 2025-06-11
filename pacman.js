// Simple Pac-Man Clone (vanilla JS, Canvas)
// No dependencies, fits your setup

const TILE_SIZE = 18;
const MAP = [
  "###################",
  "#........#........#",
  "#.###.###.#.###.###",
  "#o###.###.#.###.###",
  "#.................#",
  "#.###.#.#####.#.###",
  "#.....#...#...#...#",
  "#####.### # ###.###",
  "    #.#   G #.#    ",
  "#####.# ## #.#.####",
  "     .  P     .    ",
  "#####.# #####.#.###",
  "    #.#       #.#  ",
  "#####.# #####.#.###",
  "#........#........#",
  "#.###.###.#.###.###",
  "#o..#..... .....#o#",
  "###.#.#.#####.#.###",
  "#.....#...#...#...#",
  "###################"
];

const DIR = {
  NONE: 0, LEFT: 1, UP: 2, RIGHT: 3, DOWN: 4
};

let canvas = document.createElement("canvas");
canvas.width = MAP[0].length * TILE_SIZE;
canvas.height = MAP.length * TILE_SIZE;
canvas.style.display = "block";
canvas.style.margin = "0 auto";
let ctx = canvas.getContext("2d");
document.getElementById("pacman").appendChild(canvas);

let pacman = { x: 9, y: 10, dir: DIR.LEFT, nextDir: DIR.LEFT, mouth: 0, lives: 3, score: 0 };
let ghosts = [
  { x: 9, y: 8, dir: DIR.UP, color: "#FF4B4B", dead: false }
];
let dots = [], energizers = [];

function init() {
  dots = [];
  energizers = [];
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[0].length; x++) {
      if (MAP[y][x] === ".") dots.push({ x, y });
      if (MAP[y][x] === "o") energizers.push({ x, y });
    }
  }
}
init();

function drawMap() {
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[0].length; x++) {
      if (MAP[y][x] === "#") {
        ctx.fillStyle = "#03ff60";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function drawDots() {
  ctx.fillStyle = "#fff";
  dots.forEach(dot => {
    ctx.beginPath();
    ctx.arc(
      dot.x * TILE_SIZE + TILE_SIZE / 2,
      dot.y * TILE_SIZE + TILE_SIZE / 2,
      2, 0, Math.PI * 2
    );
    ctx.fill();
  });
  ctx.fillStyle = "#fff";
  energizers.forEach(dot => {
    ctx.beginPath();
    ctx.arc(
      dot.x * TILE_SIZE + TILE_SIZE / 2,
      dot.y * TILE_SIZE + TILE_SIZE / 2,
      5, 0, Math.PI * 2
    );
    ctx.fill();
  });
}

function drawPacman() {
  let angle = Math.PI / 4 * Math.abs(Math.sin(pacman.mouth));
  ctx.save();
  ctx.translate(
    pacman.x * TILE_SIZE + TILE_SIZE / 2,
    pacman.y * TILE_SIZE + TILE_SIZE / 2
  );
  let rot = [0, Math.PI, -Math.PI / 2, 0, Math.PI / 2][pacman.dir];
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, TILE_SIZE / 2 - 1, angle, 2 * Math.PI - angle, false);
  ctx.closePath();
  ctx.fillStyle = "#FF0";
  ctx.fill();
  ctx.restore();
}

function drawGhosts() {
  ghosts.forEach(g => {
    ctx.beginPath();
    ctx.arc(
      g.x * TILE_SIZE + TILE_SIZE / 2,
      g.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2, 0, Math.PI * 2
    );
    ctx.fillStyle = g.dead ? "#aaa" : g.color;
    ctx.fill();
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(
      g.x * TILE_SIZE + TILE_SIZE / 2 - 4,
      g.y * TILE_SIZE + TILE_SIZE / 2 - 2,
      3, 0, Math.PI * 2
    );
    ctx.arc(
      g.x * TILE_SIZE + TILE_SIZE / 2 + 4,
      g.y * TILE_SIZE + TILE_SIZE / 2 - 2,
      3, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(
      g.x * TILE_SIZE + TILE_SIZE / 2 - 4,
      g.y * TILE_SIZE + TILE_SIZE / 2 - 2,
      1.5, 0, Math.PI * 2
    );
    ctx.arc(
      g.x * TILE_SIZE + TILE_SIZE / 2 + 4,
      g.y * TILE_SIZE + TILE_SIZE / 2 - 2,
      1.5, 0, Math.PI * 2
    );
    ctx.fill();
  });
}

function drawUI() {
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px 'Press Start 2P', cursive";
  ctx.fillText("Score: " + pacman.score, 10, canvas.height - 8);
  ctx.fillText("Lives: " + pacman.lives, canvas.width - 100, canvas.height - 8);
}

function movePacman() {
  let dx = [0, -1, 0, 1, 0], dy = [0, 0, -1, 0, 1];
  // Try next direction if possible
  if (canMove(pacman.x + dx[pacman.nextDir], pacman.y + dy[pacman.nextDir])) {
    pacman.dir = pacman.nextDir;
  }
  let nx = pacman.x + dx[pacman.dir], ny = pacman.y + dy[pacman.dir];
  if (canMove(nx, ny)) {
    pacman.x = nx; pacman.y = ny;
    // Teleport
    if (pacman.x < 0) pacman.x = MAP[0].length - 1;
    if (pacman.x >= MAP[0].length) pacman.x = 0;
    if (pacman.y < 0) pacman.y = MAP.length - 1;
    if (pacman.y >= MAP.length) pacman.y = 0;
  }
  // Eat dot
  for (let i = 0; i < dots.length; i++) {
    if (dots[i].x === pacman.x && dots[i].y === pacman.y) {
      dots.splice(i, 1);
      pacman.score += 10;
      break;
    }
  }
  // Eat energizer
  for (let i = 0; i < energizers.length; i++) {
    if (energizers[i].x === pacman.x && energizers[i].y === pacman.y) {
      energizers.splice(i, 1);
      pacman.score += 50;
      ghosts.forEach(g => g.dead = true);
      setTimeout(() => ghosts.forEach(g => g.dead = false), 5000);
      break;
    }
  }
}

function canMove(x, y) {
  if (x < 0 || y < 0 || x >= MAP[0].length || y >= MAP.length) return false;
  return MAP[y][x] !== "#";
}

function moveGhosts() {
  ghosts.forEach(g => {
    let dx = [0, -1, 0, 1, 0], dy = [0, 0, -1, 0, 1];
    let dirs = [DIR.LEFT, DIR.UP, DIR.RIGHT, DIR.DOWN];
    let best = g.dir;
    let dist = 1e9;
    if (!g.dead) {
      dirs.forEach(d => {
        let nx = g.x + dx[d], ny = g.y + dy[d];
        if (canMove(nx, ny)) {
          let d2 = Math.abs(nx - pacman.x) + Math.abs(ny - pacman.y);
          if (d2 < dist && !(nx === g.x && ny === g.y)) {
            dist = d2; best = d;
          }
        }
      });
      g.dir = best;
    } else {
      // Run away when dead (powerup)
      dirs.forEach(d => {
        let nx = g.x + dx[d], ny = g.y + dy[d];
        if (canMove(nx, ny)) {
          let d2 = -Math.abs(nx - pacman.x) - Math.abs(ny - pacman.y);
          if (d2 < dist) {
            dist = d2; best = d;
          }
        }
      });
      g.dir = best;
    }
    g.x += dx[g.dir]; g.y += dy[g.dir];
    // Teleport
    if (g.x < 0) g.x = MAP[0].length - 1;
    if (g.x >= MAP[0].length) g.x = 0;
    if (g.y < 0) g.y = MAP.length - 1;
    if (g.y >= MAP.length) g.y = 0;
    // Collide with pacman
    if (g.x === pacman.x && g.y === pacman.y) {
      if (g.dead) { g.x = 9; g.y = 8; g.dead = false; pacman.score += 200; }
      else { pacman.lives--; pacman.x = 9; pacman.y = 10; pacman.dir = DIR.LEFT; }
    }
  });
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawDots();
  movePacman();
  drawPacman();
  moveGhosts();
  drawGhosts();
  drawUI();
  pacman.mouth += 0.18;
  if (dots.length === 0 && energizers.length === 0) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px 'Press Start 2P', cursive";
    ctx.fillText("You Win!", 90, 210);
    return;
  }
  if (pacman.lives > 0)
    requestAnimationFrame(loop);
  else {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px 'Press Start 2P', cursive";
    ctx.fillText("Game Over!", 60, 210);
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") pacman.nextDir = DIR.LEFT;
  else if (e.key === "ArrowUp") pacman.nextDir = DIR.UP;
  else if (e.key === "ArrowRight") pacman.nextDir = DIR.RIGHT;
  else if (e.key === "ArrowDown") pacman.nextDir = DIR.DOWN;
});

// Start game
loop();
