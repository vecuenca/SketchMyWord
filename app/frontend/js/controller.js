(function (preloaderView, roomView, roomModel, gameView, gameModel, util) {
  "use strict";

  var socket;

  var setupView = () => {
    preloaderView.hide();
    var roomId = util.getRoomId();
    if (roomId) {
      gameModel.isActive(roomId)
        .then(resp => {
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
  document.addEventListener('displayLobby',  e => {
    roomView.show();
    gameView.hide();
  });

  document.addEventListener('onCreateRoom', e => {
    roomModel.createRoom(e.detail)
      .then(resp => {
        roomView.roomCreateSuccess(resp.roomId);
      })
      .catch(util.displayToast);
  });

  document.addEventListener('onRoomJoin', e => {
    var roomId = e.detail.roomId;
    // TODO: REFACTOR THIS
    roomModel.joinRoom(e.detail)
      .then(resp => {
        roomView.roomJoinSuccess(roomId);
      })
      .catch(util.displayToast);
  });

  document.addEventListener('onLeaveRoom', e => {
    var roomId = e.detail.roomId;
    roomModel.leaveRoom(e.detail)
      .then(resp => {
        roomView.roomLeaveSuccess(resp);
      })
      .catch(util.displayToast);
  });

  document.addEventListener('onGetRooms', e => {
    roomModel.getRooms().then(resp => {
        roomView.displayRoomListInModal(resp.rooms);
      })
      .catch(util.displayToast);
  });

  document.addEventListener('connectSocket', e => {
    socket = io.connect();
  });

  document.addEventListener('closeSocket', e => {
    util.deleteCookie('roomId');
    socket.close();
  });

  // Game functions
  document.addEventListener('displayGame', e => {
    roomView.hide();
    gameView.display();

    socket.on('draw_line', data => {
      gameView.drawLine(data);
    });

    socket.on('render_message', messageObj => {
      gameView.renderMessage(messageObj);
    });

    socket.on('render_system_message', messageObj => {
      gameView.renderSystemMessage(messageObj);
    });

    socket.on('is_artist', wordToDraw => {
      gameView.clearChat();
      gameView.renderSystemMessage('You are the Artist! Your word is \'' + wordToDraw + '\'');
      gameView.startTimer();
      gameView.setLineRecord();
      gameView.baffleWord(wordToDraw);
    });

    socket.on('is_guesser', data => {
      gameView.clearChat();
      gameView.renderSystemMessage(data.artist + ' is the Artist!');
      gameView.startTimer();
      gameView.removeLineRecord();
      gameView.showWord(data.wordToShow);
    });

    socket.on('correct_guess', data => {
      gameView.renderSystemMessage('You guessed the word! You earned ' + data.pointsEarned + ' points.');
      gameView.showWord(data.word);
    });

    socket.on('word_guessed', guesser => {
      gameView.renderSystemMessage(guesser + ' guessed the word!');
    });

    socket.on('round_time_over', () => {
      gameView.renderSystemMessage('Time\'s up for this round!');
      gameView.resetTimer();
    });

    socket.on('everyone_guessed', artist => {
      gameView.renderSystemMessage('Everyone guessed the word! ' + artist + ' earned 2 points!');
      gameView.resetTimer();
    });

    socket.on('game_over', score => {
      gameView.displayEndScore(score);

      setTimeout(() => {
        gameView.closeEndScore();
        gameView.hide();
        roomView.display();
        util.deleteCookie('roomId');
      }, 5000);
      socket.close();
    });

    socket.on('next_round_starting_soon', () => {
      gameView.renderSystemMessage('The next round starts in 10 seconds!');
    });

    socket.on('round_over',  currentScore => {
      gameView.clearCanvas();
    });

    socket.on('broadcast_score', score => {
      gameView.renderScore(score);
    });

    gameView.setup();
  });

  document.addEventListener('socketJoinRoom', e => {
    var cookieUsername = util.str_obj(document.cookie).username;
    socket.emit('join_room', cookieUsername, e.detail.roomId);
    switch (e.detail.usertype) {
      case 'host':
        // waiting for room to be fulls
        socket.on('full_users', data => {
          roomView.roomFullUsersHost();
          document.dispatchEvent(new CustomEvent('displayGame'));
        });
        break;
      default:
        socket.on('full_users', data => {
          roomView.roomFullUsersDefault();
          document.dispatchEvent(new CustomEvent('displayGame'));
        });

        socket.on('leave_room', data => {
          roomView.roomLeaveSuccess({ host: false });
        });
        break;
    }
  });

  document.addEventListener('socketNewMessage', e => {
    socket.emit('new_message', e.detail.message);
  });

  document.addEventListener('socketDrawLine', e => {
    socket.emit('draw_line', {
      line: [e.detail.line[0], e.detail.line[1]],
      color: e.detail.color,
      lineWidth: e.detail.lineWidth,
    });
  });

}(preloaderView, roomView, roomModel, gameView, gameModel, util));