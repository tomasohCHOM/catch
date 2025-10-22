const GRID_WIDTH = 30;
const GRID_HEIGHT = 4;
const EMPTY = 0;
const PLAYER = 1;
const ITEM = 2;
const UP = -1;
const DOWN = 1;
const BRAILLE_SPACE = "\u2800";
const FRAME_TIME = 500;

const Game = {
  grid: [],
  playerPos: 1,
  droppingItems: [],
  running: true,
  lastFrame: 0,
  currentScore: 0,
  whitespaceReplacementChar: BRAILLE_SPACE,
};

function main() {
  resetUrl();
  detectBrowserUrlWhitespaceEscaping();
  setEventHandlers();
  resetGame();

  Game.lastFrame = Date.now();
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!Game.running) return;

  const now = Date.now();
  const delta = now - Game.lastFrame;
  if (delta >= FRAME_TIME) {
    updateGame();
    drawGame();
    Game.lastFrame = now;
  }
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  Grid.clear();
  Game.playerPos = 1;
  Game.droppingItems = [];
  Game.currentScore = 0;
  Grid.set(0, Game.playerPos, PLAYER);
}

function updateGame() {
  updateItems();
  maybeDropNewItem();
  checkCollisions();
}

function setEventHandlers() {
  const keyMap = {
    ArrowUp: UP,
    ArrowDown: DOWN,
    w: UP,
    s: DOWN,
    k: UP,
    j: DOWN,
  };

  document.addEventListener("keydown", (e) => {
    const dir = keyMap[e.key];
    if (!dir) return;

    const newY = Game.playerPos + dir;
    if (newY < 0 || newY >= GRID_HEIGHT) return;

    Grid.set(0, Game.playerPos, EMPTY);
    Game.playerPos = newY;
    Grid.set(0, Game.playerPos, PLAYER);

    drawGame();
  });
}

function maybeDropNewItem() {
  const y = Math.floor(Math.random() * GRID_HEIGHT);
  const last = Game.droppingItems.at(-1);
  const shouldDrop =
    Math.random() >= 0.5 && (!last || last[0] < GRID_WIDTH - 7);
  if (shouldDrop) {
    Game.droppingItems.push([GRID_WIDTH - 1, y]);
  }
}

function updateItems() {
  for (const [x, y] of Game.droppingItems) {
    Grid.set(x, y, EMPTY);
  }
  for (const item of Game.droppingItems) {
    item[0] -= 1;
  }
  Game.droppingItems = Game.droppingItems.filter(([x]) => x >= 0);
  for (const [x, y] of Game.droppingItems) {
    Grid.set(x, y, ITEM);
  }
}

function checkCollisions() {
  for (const [x, y] of Game.droppingItems) {
    if (x === 0) {
      if (Game.playerPos !== y) resetGame();
      Game.currentScore += 1;
    }
  }
}

function drawGame() {
  const hash =
    "#|" + Grid.toBrailleString() + "|[score:" + Game.currentScore + "]";
  try {
    history.replaceState(null, "", hash);
  } catch {
    location.hash = hash;
  }
}

const Grid = {
  index(x, y) {
    return (x % GRID_WIDTH) + y * GRID_WIDTH;
  },
  get(x, y) {
    return Game.grid[this.index(x, y)] || EMPTY;
  },
  set(x, y, v) {
    Game.grid[this.index(x, y)] = v;
  },
  clear() {
    Game.grid = new Array(GRID_WIDTH * GRID_HEIGHT).fill(EMPTY);
  },
  bitAt(x, y) {
    return this.get(x, y) ? 1 : 0;
  },
  toBrailleString() {
    let out = "";
    for (let x = 0; x < GRID_WIDTH; x += 2) {
      let n =
        (this.bitAt(x, 0) << 0) |
        (this.bitAt(x, 1) << 1) |
        (this.bitAt(x, 2) << 2) |
        (this.bitAt(x + 1, 0) << 3) |
        (this.bitAt(x + 1, 1) << 4) |
        (this.bitAt(x + 1, 2) << 5) |
        (this.bitAt(x, 3) << 6) |
        (this.bitAt(x + 1, 3) << 7);

      n = 0xff ^ n; // invert
      out += String.fromCharCode(0x2800 + n);
    }
    return out;
  },
};

function detectBrowserUrlWhitespaceEscaping() {
  history.replaceState(null, null, "#" + BRAILLE_SPACE + BRAILLE_SPACE);
  if (location.hash.indexOf(BRAILLE_SPACE) == -1) {
    console.warn("Browser is escaping whitespace characters on URL");
    Game.whitespaceReplacementChar = "૟";
  }
}

function resetUrl() {
  history.replaceState(null, "", location.pathname.replace(/\b\/$/, ""));
}

main();
