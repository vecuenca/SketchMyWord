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
  var isRecord = false;
  var username = util.getUsername();

  gameView.onload = function () {
    $('#form-chat').submit(function (e) {
      e.preventDefault();
      var messageValue = $('#chat-input').val();
      if (messageValue == "") {
        return;
      }

      var message = {
        username: username,
        message: messageValue
      };
      document.dispatchEvent(new CustomEvent('socketNewMessage', {
        detail: {
          message: message
        }
      }));
      $('#form-chat')[0].reset();
    });
  };

  gameView.renderMessage = function (messageObj) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'card chat-message';
    msgDiv.innerHTML = `
    <span class="green-text">${messageObj.username}&nbsp;</span>${messageObj.message}
    `;
    $('#chat-flex-container').prepend(msgDiv);

    // scroll down chat box to the message we just rendered
    var height = 0;
    $('#chat-flex-container div').each(function (i, value) {
      height += parseInt($(this).height());
    });
    $('#chat-contents').animate({ scrollTop: height }, 'slow');
    msgDiv.className += ' slide-in-right';
  };

  gameView.display = function () {
    $('#game-area').show();
  };

  gameView.hide = function () {
    $('#game-area').hide();
  };

  gameView.setup = function () {
    canvas.width = width;
    canvas.height = height;

    // register mouse event handlers
    canvas.onmousedown = function (e) {
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

    isRecord = true;
  }

  gameView.drawLine = function (data) {
    var line = data.line;
    context.beginPath();
    context.moveTo(line[0].x, line[0].y);
    context.lineTo(line[1].x, line[1].y);
    context.strokeStyle = data.color;
    context.stroke();
  };

  gameView.clearCanvas = function () {
    context.clearRect(0, 0, canvas.width, canvas.height)
  };

  gameView.removeLineRecord = function () {
    isRecord = false;
  };

  gameView.setLineRecord = function() {
    isRecord = true;
  }

  // main loop, running every 25ms
  function mainLoop() {
    // if we open a socket connection AND is artist
    if (isRecord) {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
        // send line to to the server
        var color = document.getElementById('color_input').value;
        document.dispatchEvent(new CustomEvent('socketDrawLine', {detail:{
          line: [mouse.pos, mouse.pos_prev],
          color: color
        }}));
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