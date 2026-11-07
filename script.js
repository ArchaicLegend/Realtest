import Odometer, {
  FACE_FAMILY,
} from "https://cdn.jsdelivr.net/npm/tactile-odometer@1.1.1/odometer.mjs";

const MAX = 999999; // 6 dígitos

const odometer = new Odometer(document.getElementById("odometer"), {
  value: 1099,
  digits: 6,
  zeros: true,
});

const amount = document.getElementById("amount");
const addBtn = document.getElementById("add");
const subBtn = document.getElementById("sub");
const setBtn = document.getElementById("set");
const resetBtn = document.getElementById("reset");
const pause = document.getElementById("pause");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
let running = true;
let timer = 0;

// ---------------------------------------------------------------- som
const sound = new Audio(new URL("./sound.mp3", import.meta.url));
sound.preload = "auto";

let unlocked = false; // o navegador só libera áudio depois de um clique/tecla
let lastPlay = 0;

for (const type of ["pointerdown", "keydown"]) {
  addEventListener(type, () => (unlocked = true), { capture: true, once: true });
}

function playSound() {
  lastPlay = performance.now();
  if (!unlocked) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// Toca também quando o contador automático gira (no máximo 1 vez por segundo).
let wasSpinning = false;
function watchSpin() {
  const spinning = odometer.state === "running";
  if (spinning && !wasSpinning && performance.now() - lastPlay > 1000) {
    playSound();
  }
  wasSpinning = spinning;
  requestAnimationFrame(watchSpin);
}
requestAnimationFrame(watchSpin);

// ---------------------------------------------------------------- contador
function tally(on) {
  running = on;
  clearTimeout(timer);
  odometer.count(on ? 4 : 0);
  pause.textContent = on ? "Pausar" : "Contar";
}

// Lê o número digitado; devolve null se estiver vazio ou inválido.
function readAmount() {
  const n = Math.trunc(Number(amount.value));
  if (amount.value.trim() === "" || !Number.isFinite(n)) {
    amount.focus();
    return null;
  }
  return n;
}

function show(value) {
  const next = Math.min(MAX, Math.max(0, value));
  tally(false);
  if (next !== odometer.value) playSound();
  odometer.setValue(next);
}

addBtn.onclick = () => {
  const n = readAmount();
  if (n !== null) show(odometer.value + n);
};

subBtn.onclick = () => {
  const n = readAmount();
  if (n !== null) show(odometer.value - n);
};

setBtn.onclick = () => {
  const n = readAmount();
  if (n !== null) show(n);
};

resetBtn.onclick = () => {
  show(0);
  amount.value = "";
};

amount.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addBtn.click();
});

pause.onclick = () => tally(!running);

function start() {
  timer = setTimeout(() => {
    odometer.setValue(1100);
    if (running) timer = setTimeout(() => tally(true), 1200);
  }, 500);
}
if (still) tally(false);
document.fonts.load(`700 1em "${FACE_FAMILY}"`).then(start, start);
