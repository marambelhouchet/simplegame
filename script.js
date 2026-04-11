const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* =====================
   IMAGE LOADING
===================== */
const playerImg = new Image();
playerImg.src = "assets/player.png";

const customerImg = new Image();
customerImg.src = "assets/customer.png";

const mixerImg = new Image();
mixerImg.src = "assets/mixer.png";

/* =====================
   GAME STATE
===================== */
let money = 0;
let player = {
  x: 400, y: 300, size: 60, speed: 5,
  holding: null 
};

let mixer = { x: 780, y: 250, width: 80, height: 100 };

let customer = { 
  x: 100, y: 480, 
  width: 50, height: 70,
  want: "orange", 
  status: "waiting", 
  speed: 2 
};

let trees = [
  { x: 250, y: 150, fruit: "orange", hasFruit: true },
  { x: 450, y: 100, fruit: "apple", hasFruit: true },
  { x: 650, y: 150, fruit: "pineapple", hasFruit: true }
];

let inventory = { orange: 0, apple: 0, pineapple: 0 };
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* =====================
   LOGIC & INTERACTIONS
===================== */

function update() {
  // Move Player
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // Move Customer if leaving
  if (customer.status === "leaving") {
    customer.x -= customer.speed;
    if (customer.x < -100) resetCustomer();
  }

  // Action Key (Space)
  if (keys[" "]) {
    handleAction();
    keys[" "] = false; 
  }
}

function handleAction() {
  // 1. PICK FRUIT
  trees.forEach(t => {
    let dist = Math.hypot(player.x - t.x, player.y - t.y);
    if (dist < 70 && t.hasFruit) {
      inventory[t.fruit]++;
      t.hasFruit = false;
      setTimeout(() => t.hasFruit = true, 5000);
    }
  });

  // 2. MIX JUICE
  let distToMixer = Math.hypot(player.x - mixer.x, player.y - mixer.y);
  if (distToMixer < 90 && !player.holding) {
    let fruit = Object.keys(inventory).find(f => inventory[f] > 0);
    if (fruit) {
      inventory[fruit]--;
      player.holding = fruit + "_juice";
    }
  }

  // 3. SERVE CUSTOMER
  let distToCustomer = Math.hypot(player.x - customer.x, player.y - customer.y);
  if (distToCustomer < 90 && customer.status === "waiting") {
    if (player.holding === customer.want + "_juice") {
      player.holding = null;
      money += 15; // Payment!
      customer.status = "happy";
      setTimeout(() => { customer.status = "leaving"; }, 1500);
    }
  }
}

function resetCustomer() {
  const fruits = ["orange", "apple", "pineapple"];
  customer.x = 100;
  customer.want = fruits[Math.floor(Math.random() * fruits.length)];
  customer.status = "waiting";
}

/* =====================
   DRAWING
===================== */

function draw() {
  // Grass Background
  ctx.fillStyle = "#7ec850";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mixer Image
  if (mixerImg.complete) {
    ctx.drawImage(mixerImg, mixer.x, mixer.y, mixer.width, mixer.height);
  } else {
    ctx.fillStyle = "gray";
    ctx.fillRect(mixer.x, mixer.y, mixer.width, mixer.height);
  }
  ctx.fillStyle = "black";
  ctx.font = "bold 14px Arial";
  ctx.fillText("THE MIXER", mixer.x, mixer.y - 10);

  // Customer Image
  if (customerImg.complete) {
    ctx.drawImage(customerImg, customer.x, customer.y, customer.width, customer.height);
  } else {
    ctx.fillStyle = customer.status === "waiting" ? "red" : "gold";
    ctx.fillRect(customer.x, customer.y, customer.width, customer.height);
  }
  
  // Customer Speech
  ctx.fillStyle = "black";
  if (customer.status === "waiting") ctx.fillText("Want: " + customer.want, customer.x, customer.y - 15);
  if (customer.status === "happy") ctx.fillText("Merci! +$15", customer.x, customer.y - 15);
  if (customer.status === "leaving") ctx.fillText("Bye bye!", customer.x, customer.y - 15);

  // Trees
  trees.forEach(t => {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(t.x, t.y, 20, 30);
    ctx.fillStyle = "#228B22";
    ctx.beginPath(); ctx.arc(t.x + 10, t.y - 5, 25, 0, Math.PI * 2); ctx.fill();
    if (t.hasFruit) {
      ctx.fillStyle = t.fruit === "orange" ? "orange" : t.fruit === "apple" ? "red" : "gold";
      ctx.beginPath(); ctx.arc(t.x + 20, t.y, 7, 0, Math.PI * 2); ctx.fill();
    }
  });

  // Player
  if (playerImg.complete) {
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
  }
  if (player.holding) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText("🧃 " + player.holding.replace("_", " "), player.x, player.y - 10);
    ctx.fillText("🧃 " + player.holding.replace("_", " "), player.x, player.y - 10);
  }

  // UI
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(10, 10, 180, 130);
  ctx.fillStyle = "white";
  ctx.font = "bold 22px Arial";
  ctx.fillText("💰 Cash: $" + money, 25, 45);
  ctx.font = "16px Arial";
  ctx.fillText("🍊 Oranges: " + inventory.orange, 25, 75);
  ctx.fillText("🍎 Apples: " + inventory.apple, 25, 95);
  ctx.fillText("🍍 Pines: " + inventory.pineapple, 25, 115);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();