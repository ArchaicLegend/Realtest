import Odometer, {
  FACE_FAMILY,
} from "https://cdn.jsdelivr.net/npm/tactile-odometer@1.1.1/odometer.mjs";

const odometer = new Odometer(document.getElementById("odometer"), {
  value: 1099,
  digits: 6,
  zeros: true,
});

const pause = document.getElementById("pause");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
let running = true;
let timer = 0;

function tally(on) {
  running = on;
  clearTimeout(timer);
  odometer.count(on ? 4 : 0);
  pause.textContent = on ? "Pause" : "Count";
}

document.querySelectorAll("[data-add]").forEach((button) => {
  button.onclick = () => {
    tally(false);
    odometer.setValue(odometer.value + Number(button.dataset.add));
  };
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
