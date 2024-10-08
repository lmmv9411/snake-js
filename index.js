import buttons from './buttons.js';
//import touch from './touch.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const score = document.getElementById('score');
const btngame = document.getElementById('btngame');

//audio
const food_audio = document.getElementById('food');
const mover = document.getElementById('move');
const gameover = document.getElementById('gameover');

const width = canvas.width;
const height = canvas.height;

const frames = 20;

const numrows = height / frames;
const numcolumns = width / frames;

const column_size = width / numcolumns;
const row_size = height / numrows;

const STOP = 0,
  RUN = 1,
  EATEN = 2;

const DIRECTIONS = {
  'ArrowUp': [0, -1],
  'ArrowDown': [0, 1],
  'ArrowLeft': [-1, 0],
  'ArrowRight': [1, 0],
};

const direction = { x: 1, y: 0 };

//touch(canvas, move);
buttons(move);

const head = { x: 0, y: 0 };

const food = { x: 0, y: 0 }

let body = [head];

let state = STOP,
  timeout, animation;

let count = 0;

function randomPosition(isBody = false) {

  let crashes = false;
  let x, y;

  do {
    x = Math.floor(Math.random() * numcolumns) * column_size;
    y = Math.floor(Math.random() * numrows) * row_size;

    if (isBody) {
      crashes = food.x == x && food.y === y;
    } else {
      crashes = body.some(p => p.x === x && p.y === y);
    }
  } while (crashes);

  return { x, y }
}

function randomDirecion() {
  let x = Math.floor(Math.random() * 3) - 1;
  let y = 0;
  let isZero = x === 0;

  while (isZero) {
    y = Math.floor(Math.random() * 3) - 1;
    isZero = y === 0;
  }

  return { x, y }
}

function fixDirection() {
  const head = body[0];
  const margin = 5;

  //Cálculo de margenes
  const col_margin = numcolumns - margin;
  const row_margin = numrows - margin;

  function adjustDirection(position, size, direction, maxMargin) {
    const boundary = Math.floor(position / size);
    if (direction > 0 && boundary >= maxMargin) {
      return -1;
    } else if (direction < 0 && boundary <= margin) {
      return 1;
    }
    return direction;
  }


  if (Math.abs(direction.x) > Math.abs(direction.y)) { // Ajustar dirección horizontal
    direction.x = adjustDirection(head.x, column_size, direction.x, col_margin);
  } else { // Ajustar dirección vertical
    direction.y = adjustDirection(head.y, row_size, direction.y, row_margin);
  }
}

function collition(head) {

  function checkBorderCollision(head) {
    const sx = head.x + column_size;
    const sy = head.y + row_size;
    return head.x < 0 || sx > width || head.y < 0 || sy > height;
  }

  function checkBodyCollision(head) {
    return body.some(p => p.x === head.x && p.y === head.y);
  }

  function checkFoodCollision(head) {
    return head.x === food.x && head.y === food.y;
  }

  function endGame() {
    gameover.play();
    navigator.vibrate(300);
    state = STOP;
  }

  function eatFood() {
    food_audio.play();
    navigator.vibrate(50);
    state = EATEN;
  }

  if (checkBorderCollision(head) || checkBodyCollision(head)) {
    endGame();
    return;
  }

  if (checkFoodCollision(head)) {
    eatFood();
  }

}

function newPosition() {
  const currentHead = body[0];
  return {
    x: currentHead.x + direction.x * column_size,
    y: currentHead.y + direction.y * row_size
  };
}

function move(code) {

  if (state !== RUN) {
    return;
  }

  if (!DIRECTIONS.hasOwnProperty(code)) {
    console.log("own", code);
    return;
  }

  //mover.play()

  const [x, y] = DIRECTIONS[code];

  if (-x !== direction.x || -y !== direction.y) {
    direction.x = x;
    direction.y = y;
    navigator.vibrate(15)
  }

}

function losing() {

  if (body.length === 1) {
    cancelAnimationFrame(animation);
    clearTimeout(timeout);
    return;
  }

  //Clean 
  ctx.clearRect(0, 0, width, height);

  //Body
  body.pop();

  ctx.fillStyle = '#00ff00'

  body.forEach(p => ctx.fillRect(p.x, p.y, column_size, row_size));

  timeout = setTimeout(() => {}, 200);
  animation = requestAnimationFrame(losing)

}

function draw() {

  const newHead = newPosition();
  collition(newHead);

  if (state === STOP) {
    return;
  }

  //Clean 
  ctx.clearRect(0, 0, width, height);

  //Eat
  ctx.fillStyle = 'Red'

  if (state === EATEN) {
    ctx.fillStyle = 'Red'
    const { x, y } = randomPosition();
    food.x = x;
    food.y = y;
    count++;
    score.value = count;
  }

  ctx.fillRect(food.x, food.y, column_size, row_size);

  //Body
  body.unshift(newHead);
  ctx.fillStyle = '#00ff00'

  if (state === EATEN) {
    state = RUN;
  } else {
    body.pop();
  }

  body.forEach(p => ctx.fillRect(p.x, p.y, column_size, row_size));

}

function run() {

  if (state === STOP) {
    btngame.textContent = "Start";
    losing();
    return;
  }

  animation = requestAnimationFrame(draw)
  timeout = setTimeout(run, 140);

}

function main() {
  const { x, y } = randomPosition();
  food.x = x;
  food.y = y;

  const rh = randomPosition(true);
  const rd = randomDirecion();

  head.x = rh.x;
  head.y = rh.y;

  body = [head];

  direction.x = rd.x;
  direction.y = rd.y;

  fixDirection();

  run();
}

btngame.addEventListener('click', () => {
  if (state === RUN) {
    state = STOP;
    btngame.textContent = "Start";
  } else {
    count = 0;
    score.value = count;
    state = RUN;
    btngame.textContent = "Stop";
    main();
  }
});

window.addEventListener('keydown', e => move(e.code));