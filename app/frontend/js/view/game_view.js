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
  var lineWidth = 3;
  var color = '#000000';
  var isErase = false;
  var username = util.getUsername();

  // round timer stuff
  var timerClock = $('.clock');
  var ROUND_TIME_SECONDS = 60;
  var timerInterval = 0,
      timerTime     = ROUND_TIME_SECONDS;
  
  gameView.startTimer = function () {
    clearInterval(timerInterval) ;

    timerInterval = setInterval(function() {
      timerTime--;
      timerClock.text(returnFormattedToSeconds(timerTime));

      if (timerTime <= 0) {
        timerClock.text(returnFormattedToSeconds(0));
        gameView.pauseTimer();
        timerTime = ROUND_TIME_SECONDS;
      }
    }, 1000);
  }

  gameView.pauseTimer = function () {
    clearInterval(timerInterval);
  }

  gameView.resetTimer = function (){
    gameView.pauseTimer();
    timerTime = ROUND_TIME_SECONDS;
    timerClock.text(returnFormattedToSeconds(timerTime));
  }

  function returnFormattedToSeconds(time){
    var minutes = Math.floor(time / 60),
        seconds = Math.round(time - minutes * 60);

    seconds = seconds < 10 ? '0' + seconds : seconds;

    return minutes + ":" + seconds;
  }

  document.getElementById('pencil-tool').onclick = function (e) {
    lineWidth = 5;
    isErase = false;
  };

  document.getElementById('marker-tool').onclick = function (e) {
    lineWidth = 20;
    isErase = false;
  };

  document.getElementById('eraser-tool').onclick = function (e) {
    isErase = true;
  }

  document.getElementById('color-tool').onchange = function (e) {
    color = document.getElementById('color').value;
  }

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

  gameView.renderSystemMessage = function(message) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'card orange white-text chat-message';
    msgDiv.innerHTML = `${message}`;
    $('#chat-flex-container').prepend(msgDiv);

    var height = 0;
    $('#chat-flex-container div').each(function (i, value) {
      height += parseInt($(this).height());
    });
    $('#chat-contents').animate({ scrollTop: height }, 'slow');
    msgDiv.className += ' slide-in-right';
  };

  gameView.renderMessage = function (msgObj) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'card chat-message';
    msgDiv.innerHTML = `
    <span style="color: ${msgObj.color}">${msgObj.username}:&nbsp;</span>${msgObj.message}
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

  gameView.clearChat = function () {
    $('#chat-flex-container').empty();
  };

  gameView.display = function () {
    $('#game-area').show();
    $('.fixed-action-btn').openFAB();
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
    context.lineWidth = data.lineWidth;
    context.stroke();
  };

  gameView.clearCanvas = function () {
    context.clearRect(0, 0, canvas.width, canvas.height)
  };

  gameView.removeLineRecord = function () {
    isRecord = false;
  };

  gameView.setLineRecord = function () {
    isRecord = true;
  }

  gameView.renderScore = function (scoreArr) {
    var scoreList = $('#score-list');
    scoreList.empty();

    scoreArr.forEach(function (score) {
      var e = document.createElement('li');
      e.className = 'collection-item';
      e.innerHTML = `
        <div><span style="color: ${score.color}">${score.username}</span><a href="#!" class="secondary-content">${score.score} pts</a></div>
      `;
      scoreList.append(e);
      e.className += ' bounce-in-left';
    });
  };

  gameView.displayEndScore = function (scoreObj) {
    $('#game-winner-points').text(scoreObj.score);
    $('#game-winner').text(scoreObj.username);
    $('#game-over-score-modal').modal('open');
  };

  gameView.closeEndScore = function() {
    $('#game-over-score-modal').modal('close');
  };

  gameView.showWord = function(word_to_show) {
    document.getElementById("word_to_show").textContent = word_to_show;
  };

  gameView.baffleWord = function(word) {
    document.getElementById("word_to_show").textContent = word;
    let b = baffle('#word_to_show');
    b.start();
    b.reveal(2500);
  };

  gameView.populateGame = function(data) {
    debugger;
    data.chatHistory.forEach(function(element) {
      gameView.renderMessage(element);
    });

    data.lineHistory.forEach(function(element){
      gameView.drawLine(element);
    });

    gameView.showWord(data.wordToDraw);
    gameView.renderScore(data.scores);

    document.dispatchEvent(new CustomEvent('connectSocket'));
    document.dispatchEvent(new CustomEvent('displayGame'));
  };
  
  // main loop, running every 25ms
  function mainLoop() {
    // if we open a socket connection AND is artist
    if (isRecord) {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
        // send line to to the server
        if (isErase) {
          document.dispatchEvent(new CustomEvent('socketDrawLine', {
            detail: {
              line: [mouse.pos, mouse.pos_prev],
              color: '#f5f5f5',
              lineWidth: 20,
            }
          }));
        } else {
          document.dispatchEvent(new CustomEvent('socketDrawLine', {
            detail: {
              line: [mouse.pos, mouse.pos_prev],
              color: color,
              lineWidth: lineWidth,
            }
          }));
        }

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