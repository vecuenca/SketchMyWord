(function (roomView, roomModel, gameView, gameModel, util) {
  "use strict";

  var socket;

  // Room functions
  document.addEventListener('onCreateRoom', function (e) {
    roomModel.createRoom(e.detail, function (err, resp) {
      // TODO: REFACTOR THIS
      if (err) return util.displayToast(err);
      resp.json().then(function (data) {
        roomView.roomCreateSuccess(data.roomId);
      });
    });
  });

  document.addEventListener('onRoomJoin', function (e) {
    var roomId = e.detail.roomId;
    // TODO: REFACTOR THIS
    roomModel.joinRoom(e.detail, function (err, resp) {
      if (err) return util.displayToast(err);
      resp.json().then(function (data) {
        roomView.roomJoinSuccess(roomId);
      });
    });
  });

  document.addEventListener('onLeaveRoom', function (e) {
    var roomId = e.detail.roomId;
    roomModel.leaveRoom(e.detail, function (err, resp) {
      if (err) return util.displayToast(err);
      resp.json().then(function (data) {
        roomView.roomLeaveSuccess(data);
      });
    });
  });

  document.addEventListener('onGetRooms', function (e) {
    roomModel.getRooms(function (err, res) {
      if (err) return util.displayToast(err);
      res.json().then(function (data) {
        roomView.displayRoomListInModal(data.rooms);
      });
    });
  });

  document.addEventListener('connectSocket', function (e) {
    socket = io.connect();
  });

  document.addEventListener('closeSocket', function (e) {
    socket.close();
  });

  // Game functions
  document.addEventListener('displayGame', function (e) {
    roomView.hide();
    gameView.display();

    socket.on('draw_line', function (data) {
      gameView.drawLine(data);
    });

    socket.on('render_message', function (messageObj) {
      gameView.renderMessage(messageObj);
    });

    socket.on('is_artist', function (wordToDraw) {
      util.displayToast('You are the Artist! Your word is ' + wordToDraw);
      gameView.setLineRecord();

    });

    socket.on('is_guesser', function (artist) {
      util.displayToast(artist + ' is the Artist!');
      gameView.removeLineRecord();
    });

    socket.on('correct_guess', function () {
      util.displayToast('You guessed the word!');
    });

    socket.on('word_guessed', function (guesser) {
      util.displayToast(guesser + ' guessed the word!');
    });

    socket.on('round_time_over', function () {
      util.displayToast('Time\'s up! Onto the next round!');
    });

    socket.on('everyone_guessed', function () {
      util.displayToast('Everyone guessed the word! Onto the next round!');
    });

    socket.on('game_over', function () {
      util.displayToast('The game is over! The winner is Me');

      gameView.hide();
      roomView.display();
    });

    socket.on('next_round_starting_soon', function () {
      util.displayToast('The next round starts in 10 seconds!');
    });

    socket.on('round_over', function (currentScore) {
      gameView.clearCanvas();

      // update scores
      var scoreStr = "Current score:\n";
      currentScore.forEach(function (x) {
        scoreStr += x.username + ": " + x.score + "\n";
      });
      util.displayToast(scoreStr, 8000);
    });

    gameView.setup();
  });

  document.addEventListener('socketJoinRoom', function (e) {
    var cookieUsername = util.str_obj(document.cookie).username;
    socket.emit('join_room', cookieUsername, e.detail.roomId);
    switch (e.detail.usertype) {
      case 'host':
        // waiting for room to be fulls
        socket.on('full_users', function (data) {
          roomView.roomFullUsersHost();
          document.dispatchEvent(new CustomEvent('displayGame'));
        });
        break;
      default:
        socket.on('full_users', function (data) {
          roomView.roomFullUsersDefault();
          document.dispatchEvent(new CustomEvent('displayGame'));
        });

        socket.on('leave_room', function (data) {
          roomView.roomLeaveSuccess({ host: false });
        });
        break;
    }
  });

  document.addEventListener('socketNewMessage', function (e) {
    socket.emit('new_message', e.detail.message);
  });

  document.addEventListener('socketDrawLine', function (e) {
    socket.emit('draw_line', {
      line: [e.detail.line[0], e.detail.line[1]],
      color: e.detail.color,
      lineWidth: e.detail.lineWidth,
    });
  });

}(roomView, roomModel, gameView, gameModel, util));