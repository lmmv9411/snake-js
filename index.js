import touch from './touch.js';

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

const STOP = 0, RUN = 1, EATEN = 2;

const DIRECTIONS = {
    'ArrowUp': [0, -1],
    'ArrowDown': [0, 1],
    'ArrowLeft': [-1, 0],
    'ArrowRight': [1, 0],
};

const direction = { x: 1, y: 0 };

touch(canvas, move);

const head = {
    x: 0,
    y: 0,
    width: column_size,
    height: column_size
};

const body = [head];

const food = {
    x: 0,
    y: 0,
    width: column_size,
    height: column_size
}

let state = STOP, timeout, animation;

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
            crashes = body.filter(p => p.x === x && p.y === y).length > 0;
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

function collition(head) {

    const sx = head.x + head.width;
    const sy = head.y + head.height;

    if (head.x < 0 || sx > width || head.y < 0 || sy > height) {
        gameover.play();
        navigator.vibrate(300);
        state = STOP;
        return;
    }

    if (head.x === food.x && head.y === food.y) {
        food_audio.play();
        navigator.vibrate(100);
        state = EATEN;
        return;
    }

    body.forEach((p) => {
        if (p.x == head.x && p.y == head.y) {
            gameover.play();
            navigator.vibrate(300);
            state = STOP;
        }
    });

}

function newPosition() {
    const head = body[0];
    return Object.freeze({
        x: head.x + direction.x * column_size,
        y: head.y + direction.y * row_size,
        width: head.width,
        height: head.height
    });
}

window.addEventListener('keydown', e => move(e.code));

function move(code) {

    if (state !== RUN) {
        return;
    }

    if (!DIRECTIONS.hasOwnProperty(code)) {
        console.log("own", code);
        return;
    }

    mover.play();

    const [x, y] = DIRECTIONS[code];

    if (-x !== direction.x || -y !== direction.y) {
        direction.x = x;
        direction.y = y;
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

    body.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    timeout = setTimeout(losing, (1000 / frames) * 2);
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

    ctx.fillRect(food.x, food.y, food.width, food.height);

    //Body
    body.unshift(newHead);
    ctx.fillStyle = '#00ff00'

    if (state === EATEN) {
        state = RUN;
    } else {
        body.pop();
    }

    body.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

}

function run() {

    if (state === STOP) {
        btngame.textContent = "Start";
        count = 0;
        score.value = count;
        losing();
        return;
    }

    timeout = setTimeout(run, (1000 / frames) * 2);
    animation = requestAnimationFrame(draw)

}

btngame.addEventListener('click', () => {
    if (state === RUN) {
        state = STOP;
        btngame.textContent = "Start";
    } else {
        state = RUN;
        btngame.textContent = "Stop";
        main();
    }
});

function main() {
    const { x, y } = randomPosition();
    food.x = x;
    food.y = y;

    const rh = randomPosition(true);
    const rd = randomDirecion();

    head.x = rh.x;
    head.y = rh.y;

    direction.x = rd.x;
    direction.y = rd.y;
    run();
}