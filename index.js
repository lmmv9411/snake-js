import touch from "./touch.js"

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//audio
const food = document.getElementById('food');
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

const head = Object.freeze({
    x: column_size,
    y: row_size,
    width: column_size,
    height: column_size
});

const body = [head];

const eat = {
    x: 0,
    y: 0,
    width: column_size,
    height: column_size
}

let state = RUN;
let timeout, animation;

function randomPosition() {

    let onBody = false;
    let x, y;

    do {
        x = Math.floor(Math.random() * numcolumns) * column_size;
        y = Math.floor(Math.random() * numrows) * row_size;
        onBody = body.filter(p => p.x === x && p.y === y).length > 0;
    } while (onBody);

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

    if (head.x === eat.x && head.y === eat.y) {
        food.play();
        navigator.vibrate(100);
        state = EATEN;
        return;
    }

    for (let part of body) {
        if (part.x == head.x && part.y == head.y) {
            gameover.play();
            navigator.vibrate(300);
            state = STOP;
        }
    }

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

    ctx.fillStyle = 'Green'

    for (let part of body) {
        ctx.fillRect(part.x, part.y, part.width, part.height);
    }

    timeout = setTimeout(losing, (1000 / frames) * 2);
    animation = requestAnimationFrame(losing)

}

function draw() {

    const newHead = newPosition();

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
        eat.x = x;
        eat.y = y;
    }

    ctx.fillRect(eat.x, eat.y, eat.width, eat.height);

    //Body
    body.unshift(newHead);
    ctx.fillStyle = 'Green'

    if (state === EATEN) {
        state = RUN;
    } else {
        body.pop();
    }

    for (let part of body) {
        ctx.fillRect(part.x, part.y, part.width, part.height);
    }

    collition(newHead);

}

function run() {

    if (state === STOP) {
        losing();
        return;
    }

    timeout = setTimeout(run, (1000 / frames) * 2);
    animation = requestAnimationFrame(draw)

}

const { x, y } = randomPosition();
eat.x = x;
eat.y = y;

run();
