document.addEventListener("DOMContentLoaded", function () {
    var mouse = {
        click: false,
        move: false,
        pos: {
            x: 0,
            y: 0
        },
        pos_prev: false
    };
    // get canvas element and create context
    var canvas = document.getElementById('drawing');
    var context = canvas.getContext('2d');
    var width = document.getElementById('canvas_box').clientWidth;
    var height = document.getElementById('canvas_box').clientHeight;
    
    // // Make it visually fill the positioned parent
    canvas.width  = width;
    canvas.height = height;

    // register mouse event handlers
    canvas.onmousedown = function (e) {
        console.log(document.getElementById("canvas_box").offsetTop);
        mouse.click = true;
    };
    canvas.onmouseup = function (e) {
        mouse.click = false;
    };

    canvas.onmousemove = function (e) {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = e.pageX - document.getElementById("canvas_box").offsetLeft;
        mouse.pos.y = e.pageY - document.getElementById("canvas_box").offsetTop;
        mouse.move = true;
    };

    // draw line received from server
    socket.on('draw_line', function (data) {
        var line = data.line;
        context.beginPath();
        context.moveTo(line[0].x, line[0].y);
        context.lineTo(line[1].x, line[1].y);
        context.stroke();
    });

    // main loop, running every 25ms
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            socket.emit('draw_line', {
                line: [mouse.pos, mouse.pos_prev]
            });
            mouse.move = false;
        }
        mouse.pos_prev = {
            x: mouse.pos.x,
            y: mouse.pos.y
        };
        setTimeout(mainLoop, 25);
    }
    mainLoop();
});