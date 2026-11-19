const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const startButton = document.getElementById("startButton");

const basket = { x: 195, y: 470, width: 90, height: 22, speed: 360 };
const keys = { left: false, right: false };
const colors = ["#f05a9d", "#ffe36e", "#9b70d6", "#35a9d6"];
let items = [];
let score = 0;
let lives = 3;
let running = false;
let spawnTimer = 0;
let lastTime = 0;

function drawBasket() {
  // Keranjang neon dibuat dari kotak-kotak pixel.
  ctx.fillStyle = "#ff3cac";
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
  ctx.fillStyle = "#100e24";
  ctx.fillRect(basket.x, basket.y, basket.width, 5);
  ctx.fillStyle = "#00e5ff";
  ctx.fillRect(basket.x + 8, basket.y + 8, 8, 8);
  ctx.fillRect(basket.x + basket.width - 16, basket.y + 8, 8, 8);
  ctx.fillRect(basket.x + 30, basket.y + 8, 8, 8);
  ctx.fillRect(basket.x + 52, basket.y + 8, 8, 8);
}

function drawItem(item) {
  const x = item.x;
  const y = item.y;

  if (item.kind === "skull") {
    // Tengkorak pixel dengan mata neon.
    ctx.fillStyle = "#f4f2ff";
    ctx.fillRect(x + 6, y, 12, 4);
    ctx.fillRect(x + 2, y + 4, 20, 12);
    ctx.fillRect(x + 6, y + 16, 12, 4);
    ctx.fillRect(x + 5, y + 20, 4, 4);
    ctx.fillRect(x + 15, y + 20, 4, 4);
    ctx.fillStyle = "#ff3cac";
    ctx.fillRect(x + 5, y + 8, 5, 5);
    ctx.fillRect(x + 14, y + 8, 5, 5);
    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(x + 10, y + 14, 4, 4);
  } else if (item.kind === "bolt") {
    // Petir pixel warna kuning neon.
    ctx.fillStyle = "#ffe45e";
    ctx.fillRect(x + 10, y, 10, 6);
    ctx.fillRect(x + 6, y + 6, 10, 6);
    ctx.fillRect(x + 2, y + 12, 12, 6);
    ctx.fillRect(x + 10, y + 18, 8, 6);
    ctx.fillStyle = "#ff3cac";
    ctx.fillRect(x + 15, y + 3, 4, 4);
  } else {
    // Bola punk berduri.
    ctx.fillStyle = item.color;
    ctx.fillRect(x + 8, y + 4, 8, 4);
    ctx.fillRect(x + 4, y + 8, 16, 8);
    ctx.fillRect(x + 8, y + 16, 8, 4);
    ctx.fillRect(x + 8, y, 8, 4);
    ctx.fillRect(x, y + 8, 4, 8);
    ctx.fillRect(x + 20, y + 8, 4, 8);
    ctx.fillRect(x + 8, y + 20, 8, 4);
    ctx.fillStyle = "#ffe45e";
    ctx.fillRect(x + 8, y + 8, 4, 4);
    ctx.fillRect(x + 15, y + 13, 4, 4);
  }
}

function drawScene() {
  ctx.fillStyle = "#100e24";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Garis kota futuristik di latar belakang.
  ctx.fillStyle = "#211d38";
  for (let i = 0; i < 8; i++) {
    const buildingX = i * 65;
    const buildingHeight = 55 + (i * 29) % 90;
    ctx.fillRect(buildingX, 355 - buildingHeight, 42, buildingHeight);
  }
  ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
  ctx.lineWidth = 2;
  for (let y = 390; y < canvas.height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let x = 20; x < canvas.width; x += 45) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 390);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Lampu kecil di gedung.
  ctx.fillStyle = "#ffe45e";
  for (let i = 0; i < 12; i++) {
    const x = (i * 83 + 25) % canvas.width;
    const y = 275 + (i * 37) % 70;
    ctx.fillRect(x, y, 5, 5);
  }

  items.forEach(drawItem);
  drawBasket();

  if (!running) {
    ctx.fillStyle = "rgba(52, 36, 79, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe36e";
    ctx.font = "bold 30px Courier New";
    ctx.fillText(lives === 0 ? "GAME SELESAI!" : "SIAP-SIAP!", canvas.width / 2, 235);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 17px Courier New";
    ctx.fillText(lives === 0 ? `Skor kamu: ${score}` : "Tangkap semua benda!", canvas.width / 2, 270);
  }
}

function makeItem() {
  const size = 24;
  const kinds = ["skull", "bolt", "spike"];
  items.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size: size,
    speed: 150 + Math.random() * 100 + score * 3,
    drift: (Math.random() - 0.5) * 70,
    color: colors[Math.floor(Math.random() * colors.length)],
    kind: kinds[Math.floor(Math.random() * kinds.length)]
  });
}

function update(delta) {
  if (keys.left) basket.x -= basket.speed * delta;
  if (keys.right) basket.x += basket.speed * delta;
  basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));

  spawnTimer += delta;
  if (spawnTimer > Math.max(0.38, 0.85 - score * 0.015)) {
    makeItem();
    spawnTimer = 0;
  }

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    item.y += item.speed * delta;
    item.x += item.drift * delta;
    item.x = Math.max(0, Math.min(canvas.width - item.size, item.x));

    const caught = item.y + item.size >= basket.y &&
      item.y < basket.y + basket.height &&
      item.x + item.size > basket.x &&
      item.x < basket.x + basket.width;

    if (caught) {
      score++;
      scoreText.textContent = score;
      items.splice(i, 1);
    } else if (item.y > canvas.height) {
      lives--;
      livesText.textContent = lives;
      items.splice(i, 1);
      if (lives <= 0) {
        running = false;
        startButton.textContent = "MAIN LAGI";
      }
    }
  }
}

function gameLoop(time) {
  const delta = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  if (running) update(delta);
  drawScene();
  requestAnimationFrame(gameLoop);
}

function moveBasket(event) {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  basket.x = (event.clientX - rect.left) * scale - basket.width / 2;
  basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
}

startButton.addEventListener("click", () => {
  score = 0;
  lives = 3;
  items = [];
  spawnTimer = 0;
  basket.x = (canvas.width - basket.width) / 2;
  scoreText.textContent = score;
  livesText.textContent = lives;
  startButton.textContent = "ULANGI GAME";
  running = true;
});

canvas.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "touch" || event.buttons) moveBasket(event);
});
canvas.addEventListener("pointerdown", moveBasket);

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = true;
    event.preventDefault();
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = true;
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = false;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = false;
});

requestAnimationFrame(gameLoop);
