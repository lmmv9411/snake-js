const up = document.getElementById('up');
const down = document.getElementById('down');
const left = document.getElementById('left');
const right = document.getElementById('right');

export default function (move) {
    up.addEventListener('click', () => move("ArrowUp"));
    down.addEventListener('click', () => move("ArrowDown"));
    left.addEventListener('click', () => move("ArrowLeft"));
    right.addEventListener('click', () => move("ArrowRight"));
}