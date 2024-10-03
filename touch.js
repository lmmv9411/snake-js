export default function (canvas, move) {

    let startX, startY, endX, endY;

    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, false);

    canvas.addEventListener('touchmove', e => {

        e.preventDefault();

        endX = e.touches[0].clientX;
        endY = e.touches[0].clientY;

        const x = endX - startX;
        const y = endY - startY;

        if (Math.abs(x) > Math.abs(y)) { //Horizontal
            if (endX > startX) {
                move('ArrowRight');
            } else {
                move('ArrowLeft');
            }
        } else {                         //Vertical
            if (endY > startY) {
                move('ArrowDown');
            } else {
                move('ArrowUp');
            }

        }
    }, false);
}