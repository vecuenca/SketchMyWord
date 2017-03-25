(function (preloaderView, roomView, roomModel, gameView, gameModel, scoreModel, util) {
  "use strict";

  var socket;

  var setupView = function () {
    preloaderView.hide();
    var roomId = util.getRoomId();
    if (roomId) {
      gameModel.isActive(roomId)
        .then(function (resp) {
          if (resp.active) {
            socket = io.connect();
            var cookieUsername = util.str_obj(document.cookie).username;
            socket.emit('join_room', cookieUsername, roomId);
            gameView.populateGame(resp);
          } else {
            roomView.display();
          }
        })
        .catch(util.displayToast);
    } else {
      roomView.display();
    }
  }

  setupView();

  // Room functions
  document.addEventListener('displayLobby', function (e) {
    roomView.show();
    gameView.hide();
  });

  document.addEventListener('onCreateRoom', function (e) {
    roomModel.createRoom(e.detail, function (err, resp) {
      // TODO: REFACTOR THIS
      if (err) return util.displayToast(err);
      resp.json().then(function (data) {
        roomView.roomCreateSuccess(data.roomId);
      });
    });
  });
  // document.addEventListener('onCreateRoom', function (e) {
  //   roomModel.createRoom(e.detail)
  //     .then(function (resp) {
  //       roomView.roomCreateSuccess(resp.roomId);
  //     })
  //     .catch(function (err) {
  //       util.displayToast(err);
  //     });
  // });

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
    util.deleteCookie('roomId');
    socket.close();
  });

  // Score functions
  document.addEventListener('fetchPersonalStats', function (e) {
    scoreModel.fetchPersonalStats(e.detail, function(err, res) {
      if (err) {
        return util.displayToast(err);
      } 
      res.json().then(data => {
        roomView.renderPersonalScore(data[0]);
      });
    });
  });

  document.addEventListener('fetchGlobalStats', function (e) {
    scoreModel.fetchGlobalStats(e.detail, function(err, res) {
      if (err) {
        return util.displayToast(err);
      }

      res.json().then(data => {
        roomView.renderLeaderboard(data);
      }); 
    });
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

    socket.on('render_system_message', function (messageObj) {
      gameView.renderSystemMessage(messageObj);
    });

    socket.on('is_artist', function (wordToDraw) {
      gameView.clearChat();
      gameView.renderSystemMessage('You are the Artist! Your word is \'' + wordToDraw + '\'');
      gameView.startTimer();
      gameView.setLineRecord();
      gameView.baffleWord(wordToDraw);
    });

    socket.on('is_guesser', function (data) {
      gameView.clearChat();
      gameView.renderSystemMessage(data.artist + ' is the Artist!');
      gameView.startTimer();
      gameView.removeLineRecord();
      gameView.showWord(data.wordToShow);
    });

    socket.on('correct_guess', function (data) {
      gameView.renderSystemMessage('You guessed the word! You earned ' + data.pointsEarned + ' points.');
      gameView.showWord(data.word);
    });

    socket.on('word_guessed', function (guesser) {
      gameView.renderSystemMessage(guesser + ' guessed the word!');
    });

    socket.on('round_time_over', function () {
      gameView.renderSystemMessage('Time\'s up for this round!');
      gameView.resetTimer();
    });

    socket.on('everyone_guessed', function (artist) {
      gameView.renderSystemMessage('Everyone guessed the word! ' + artist + ' earned 2 points!');
      gameView.resetTimer();
    });

    socket.on('game_over', function (score) {
      gameView.displayEndScore(score);

      setTimeout(function () {
        gameView.closeEndScore();
        gameView.hide();
        roomView.display();
        util.deleteCookie('roomId');
      }, 5000);
      socket.close();
    });

    socket.on('next_round_starting_soon', function () {
      gameView.renderSystemMessage('The next round starts in 10 seconds!');
    });

    socket.on('round_over', function (currentScore) {
      gameView.clearCanvas();
    });

    socket.on('broadcast_score', function (score) {
      gameView.renderScore(score);
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

}(preloaderView, roomView, roomModel, gameView, gameModel, scoreModel, util));

