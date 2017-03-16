/*jshint esversion: 6 */
var gameView = (function (util) {
  "use strict";

  var gameView = {};

  var mouse = {
    click: false,
    move: false,
    pos: {
      x: 0,
      y: 0
    },
    pos_prev: false
  };

  var canvas = document.getElementById('drawing');
  var context = canvas.getContext('2d');
  var width = document.getElementById('canvas_box').clientWidth;
  var height = document.getElementById('canvas_box').clientHeight;
  var socket;
  var set = false;
  var username = util.getUsername();

  gameView.onload = function () {
    $('#form-chat').submit(function(e) {
      e.preventDefault();
      var messageValue = $('#chat-input').val();
      if (messageValue == "") {
        return;
      }

      var message = {
        username: username,
        message: messageValue
      };

      socket.emit('new_message', message);
      $('#form-chat')[0].reset();
    });
  }

  gameView.renderMessage = function(messageObj) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'card chat-message';
    msgDiv.innerHTML = `
    <span class="green-text">${messageObj.username}&nbsp;</span>${messageObj.message}
    `;
    $('#chat-flex-container').prepend(msgDiv);

    // scroll down chat box to the message we just rendered
    var height = 0;
    $('#chat-flex-container div').each(function(i, value) {
      height += parseInt($(this).height());
    });
    $('#chat-contents').animate({ scrollTop: height }, 'slow');
  };

  gameView.display = function () {
    $('#game-area').show();
  };

  gameView.hide = function () {
    $('#game-area').hide();
  };

  gameView.setup = function (passedSocket) {
    canvas.width = width;
    canvas.height = height;

    // register mouse event handlers
    canvas.onmousedown = function (e) {
      console.log(socket);
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

    passedSocket.on('draw_line', function (data) {
      console.log(data);
      var line = data.line;
      context.beginPath();
      context.moveTo(line[0].x, line[0].y);
      context.lineTo(line[1].x, line[1].y);
      context.stroke();
    });
    socket = passedSocket;
    set = true;

    socket.on('render_message', function(messageObj) {
      gameView.renderMessage(messageObj);
    });
  }

  // main loop, running every 25ms
  function mainLoop() {
    // if we open a socket connection
    if (set) {
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
    }
    setTimeout(mainLoop, 25);
  }

  mainLoop();

  // taken from http://stackoverflow.com/questions/5047346/converting-strings-like-document-cookie-to-objects
  function str_obj(str) {
    str = str.split(', ');
    var result = {};
    for (var i = 0; i < str.length; i++) {
      var cur = str[i].split('=');
      result[cur[0]] = cur[1];
    }
    return result;
  }

  return gameView;

}(util));