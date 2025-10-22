const GRID_WIDTH = 30;
const EMPTY = 0;
const PLAYER = 1;
const ITEM = 2;
const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const BRAILLE_SPACE = "\u2800";

let grid, playerPos;
let whitespaceReplacementChar;

function main() {
  // detectBrowserUrlWhitespaceEscaping();
  setEventHandlers();
  resetUrl();
  startGame();
  let lastFrame = performance.now();
  drawWorld();
  // window.requestAnimationFrame(function frameHandler() {
  //   const now = performance.now();
  //   if (now - lastFrame >= 30) {
  //     drawWorld();
  //     lastFrame = now;
  //   }
  //   window.requestAnimationFrame(frameHandler);
  // });
}

function detectBrowserUrlWhitespaceEscaping() {
  history.replaceState(null, null, "#" + BRAILLE_SPACE + BRAILLE_SPACE);
  if (location.hash.indexOf(BRAILLE_SPACE) == -1) {
    console.warn("Browser is escaping whitespace characters on URL");
    whitespaceReplacementChar = "૟";
  }
}

function setEventHandlers() {
  const directionsByKey = {
    ArrowUp: UP,
    ArrowDown: DOWN,
    w: UP,
    s: DOWN,
    k: UP,
    j: DOWN,
  };

  document.onkeydown = (event) => {
    const key = event.key;
    if (key in directionsByKey) {
      const delta = directionsByKey[key];
      setCellAt(playerPos.x, playerPos.y, EMPTY);
      playerPos.x += delta.x;
      playerPos.y += delta.y;
      setCellAt(playerPos.x, playerPos.y, PLAYER);
      drawWorld();
    }
  };
}

function startGame() {
  grid = new Array(GRID_WIDTH * 4);
  playerPos = { x: 0, y: 1 };
  setCellAt(playerPos.x, playerPos.y, PLAYER);
}

function drawWorld() {
  const hash = "#|" + gridString();
  history.replaceState(null, "", hash);
  if (decodeURIComponent(location.hash) !== hash) {
    console.warn(
      "history.replaceState() throttling detected. Using location.hash fallback"
    );
    location.hash = hash;
  }
}

function cellAt(x, y) {
  return grid[(x % GRID_WIDTH) + y * GRID_WIDTH];
}

function bitAt(x, y) {
  return cellAt(x, y) ? 1 : 0;
}

function setCellAt(x, y, entity) {
  grid[(x % GRID_WIDTH) + y * GRID_WIDTH] = entity;
}

function gridString() {
  let gridStr = "";
  for (let x = 0; x < GRID_WIDTH; x += 2) {
    let n =
      0 |
      (bitAt(x, 0) << 0) |
      (bitAt(x, 1) << 1) |
      (bitAt(x, 2) << 2) |
      (bitAt(x + 1, 0) << 3) |
      (bitAt(x + 1, 1) << 4) |
      (bitAt(x + 1, 2) << 5) |
      (bitAt(x, 3) << 6) |
      (bitAt(x + 1, 3) << 7);
    n = 0xff ^ n;
    gridStr += String.fromCharCode(0x2800 + n);
  }
  return gridStr;
}

function resetUrl() {
  history.replaceState(null, "", location.pathname.replace(/\b\/$/, ""));
}

let $ = document.querySelector.bind(document);
main();
